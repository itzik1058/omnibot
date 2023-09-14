import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import DiscordSlashCommand from "../core/command.js";

export default class MemeCommand extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder()
      .setName("meme")
      .setDescription("Meme")
      .toJSON();
  }

  async execute(interaction: ChatInputCommandInteraction) {
    await this.omnibot.tasks.get("meme")?.execute();
    await interaction.deferReply();
    await interaction.deleteReply();
  }
}
