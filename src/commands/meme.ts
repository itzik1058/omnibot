import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import DiscordSlashCommand from "../core/command.js";

export default class MemeCommand extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder().setName("meme").setDescription("Meme");
  }

  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    await interaction.deleteReply();
    await this.omnibot.tasks.get("meme")?.execute();
  }
}
