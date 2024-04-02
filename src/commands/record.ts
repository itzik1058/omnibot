import { EndBehaviorType, joinVoiceChannel } from "@discordjs/voice";
import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import DiscordSlashCommand from "../core/command.js";

export default class RecordCommand extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder()
      .setName("record")
      .setDescription("Record conversation")
      .setDMPermission(false)
      .toJSON();
  }

  async execute(interaction: ChatInputCommandInteraction) {
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
}
