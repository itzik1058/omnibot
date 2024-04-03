import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import {
  Events,
  GuildMember,
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
  VoiceBasedChannel,
} from "discord.js";
import { glob } from "glob";
import path from "node:path";
import config from "../core/config.js";
import { OmnibotModule } from "../core/module.js";
import Omnibot from "../core/omnibot.js";
import { ErlangScheduledTask } from "../core/task.js";

export default class Mimic extends OmnibotModule {
  private audio: Array<string>;
  private queue: Array<string>;
  private task: ErlangScheduledTask;

  constructor(omnibot: Omnibot) {
    super(omnibot);

    this.audio = [];
    this.queue = [];
    this.task = new ErlangScheduledTask(
      this.playRandom.bind(this),
      24 * 60 * 60 * 1000
    );

    omnibot.client.once(Events.ClientReady, this.onClientReady);
    omnibot.client.on(Events.InteractionCreate, this.onInteractionCreate);
  }

  public commands(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return [
      new SlashCommandBuilder()
        .setName("mimic")
        .setDescription("Mimic")
        .setDMPermission(false)
        .addStringOption((option) =>
          option
            .setName("path")
            .setDescription("Resource path")
            .setAutocomplete(true)
        )
        .toJSON(),
    ];
  }

  private onClientReady = async () => {
    const mimic = await glob(path.join(config.dataPath, "audio/mimic/**/*.*"));
    const terraria = await glob(
      path.join(config.dataPath, "audio/terraria/**/*.*")
    );
    this.audio = [...mimic, ...terraria].map((resource) =>
      path.relative(config.dataPath, resource)
    );
    this.task.start();
  };

  private onInteractionCreate = async (interaction: Interaction) => {
    if (
      interaction.isChatInputCommand() &&
      interaction.commandName == "mimic"
    ) {
      const path = interaction.options.getString("path");
      if (path) {
        const member = interaction.member as GuildMember;
        if (!member.voice.channel) {
          await interaction.reply({
            content: "You must be connected to a voice channel",
            ephemeral: true,
          });
          return;
        }
        this.play(member.voice.channel, path);
      } else {
        this.playRandom();
      }
    } else if (
      interaction.isAutocomplete() &&
      interaction.commandName == "mimic"
    ) {
      const focused = interaction.options.getFocused(true);
      switch (focused.name) {
        case "path":
          {
            const pattern = new RegExp(
              Array.from(focused.value.toLowerCase()).join(".*?")
            );
            const options = this.audio
              .filter((resource) => pattern.test(resource.toLowerCase()))
              .slice(0, 25)
              .map((resource) => ({ name: resource, value: resource }));
            await interaction.respond(options);
          }
          break;
      }
    }
  };

  private playRandom() {
    if (this.queue.length == 0) {
      this.queue = [...this.audio];
      this.queue.sort(() => Math.random() - 0.5); // shuffle
    }
    const resource = this.queue.pop() as string;
    const channel = this.omnibot.client.channels.cache
      .filter((channel) => channel.isVoiceBased() && channel.members.size > 0)
      .random() as VoiceBasedChannel | undefined;
    if (!channel) {
      console.info("playRandom skipped because voice channels are empty");
      return;
    }

    console.info(`playRandom with resource ${resource}`);
    this.play(channel, resource);
  }

  private play(channel: VoiceBasedChannel, resource: string) {
    getVoiceConnection(channel.guildId)?.destroy();
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
    connection.subscribe(player);
    player.play(createAudioResource(path.join(config.dataPath, resource)));
  }
}
