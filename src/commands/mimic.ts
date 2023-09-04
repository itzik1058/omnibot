import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import DiscordSlashCommand from "../command";

export default class Mimic extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder().setName("mimic").setDescription("Mimic");
  }

  async execute(interaction: CommandInteraction) {
    await interaction.reply("mimic");
  }
}
