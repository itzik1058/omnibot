import {
  AudioReceiveStreamOptions,
  EndBehaviorType,
  joinVoiceChannel,
} from "@discordjs/voice";
import {
  Events,
  GuildMember,
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";
import Ffmpeg from "fluent-ffmpeg";
import { opus } from "prism-media";
import { PassThrough } from "stream";
import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";

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
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to record")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("stop-silence-duration")
            .setDescription(
              "Silence duration (ms) after which recording will stop"
            )
            .setMinValue(0)
            .setMaxValue(25000)
        )
        .toJSON(),
    ];
  }

  private onInteractionCreate = async (interaction: Interaction) => {
    if (
      interaction.isChatInputCommand() &&
      interaction.commandName == "record"
    ) {
      const targetUser = interaction.options.getMember("user");
      const afterSilenceDuration = interaction.options.getInteger(
        "stop-silence-duration"
      );
      if (!targetUser) {
        await interaction.reply({
          content: "User was not found",
          ephemeral: true,
        });
        return;
      }
      const member = targetUser as GuildMember;
      const channel = member.voice.channel;
      if (!channel) {
        await interaction.reply({
          content: "User must be connected to a voice channel",
          ephemeral: true,
        });
        return;
      }
      await interaction.deferReply();
      await interaction.deleteReply();
      const connection = joinVoiceChannel({
        guildId: channel.guildId,
        channelId: channel.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true,
      });
      const streamOptions: Partial<AudioReceiveStreamOptions> = {};
      if (afterSilenceDuration)
        streamOptions.end = {
          behavior: EndBehaviorType.AfterSilence,
          duration: afterSilenceDuration,
        };
      else
        streamOptions.end = {
          behavior: EndBehaviorType.AfterSilence,
          duration: 300, // default 300 ms
        };
      const decoder = new opus.Decoder({
        frameSize: 960,
        channels: 2,
        rate: 48_000,
      });
      const stream = connection.receiver
        .subscribe(member.id, streamOptions)
        .on("error", console.error)
        .once("readable", () => {
          interaction
            .followUp({
              content: "Recording started",
              ephemeral: true,
            })
            .catch(console.error);
        })
        .once("close", () => {
          connection.destroy();
          interaction
            .followUp({
              content: "Recording ended",
              ephemeral: true,
            })
            .catch(console.error);
        })
        .pipe(decoder);
      const audio = new PassThrough();
      Ffmpeg()
        .input(stream)
        .inputFormat("s32le")
        .audioBitrate(48_000)
        .audioChannels(2)
        .format("mp3")
        .writeToStream(audio);
      await interaction.followUp({
        files: [
          {
            attachment: audio,
            name: `${Date.now()}-${member.displayName}.mp3`,
          },
        ],
        ephemeral: true,
      });
    }
  };
}
