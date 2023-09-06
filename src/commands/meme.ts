import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import DiscordSlashCommand from "../core/command";

export default class MemeCommand extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder().setName("meme").setDescription("Meme");
  }

  async execute(interaction: CommandInteraction) {
    await interaction.reply("meme");
  }
}
