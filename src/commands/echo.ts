import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import DiscordSlashCommand from "../core/command.js";
import config from "../core/config.js";

export default class EchoCommand extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder()
      .setName("echo")
      .setDescription("Echo")
      .setDMPermission(false)
      .addStringOption((option) =>
        option.setName("content").setDescription("content").setRequired(true)
      )
      .toJSON();
  }

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    await interaction.deleteReply();
    const content = interaction.options.getString("content");
    const channel = this.omnibot.client.channels.cache.get(config.channelId);
    if (channel?.isTextBased() && content !== null)
      await channel.send({ content: content });
  }
}
