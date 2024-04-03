import { EndBehaviorType, joinVoiceChannel } from "@discordjs/voice";
import {
  Events,
  GuildMember,
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";
import { OmnibotModule } from "../core/module.js";
import Omnibot from "../core/omnibot.js";

export default class Record extends OmnibotModule {
  constructor(omnibot: Omnibot) {
    super(omnibot);

    omnibot.client.on(Events.InteractionCreate, this.onInteractionCreate);
  }

  public commands(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return [
      new SlashCommandBuilder()
        .setName("record")
        .setDescription("Record conversation")
        .setDMPermission(false)
        .toJSON(),
    ];
  }

  private onInteractionCreate = async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      const member = interaction.member as GuildMember;
      const channel = member.voice.channel;
      if (!channel) {
        await interaction.reply({
          content: "You must be connected to a voice channel",
          ephemeral: true,
        });
        return;
      }
      const connection = joinVoiceChannel({
        guildId: channel.guildId,
        channelId: channel.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true,
      });
      connection.receiver
        .subscribe(member.user.id, {
          end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 },
        })
        .on("readable", () => {
          interaction
            .reply({
              content: "Recording started",
              ephemeral: true,
            })
            .catch((reason) => {
              console.error(reason);
            });
        })
        .on("close", () => {
          connection.destroy();
          interaction
            .followUp({
              content: "Recording ended",
              ephemeral: true,
            })
            .catch((reason) => {
              console.error(reason);
            });
        })
        .on("data", (chunk) => {
          console.info(chunk);
        });
    }
  };
}
