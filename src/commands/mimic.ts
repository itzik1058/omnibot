import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import DiscordSlashCommand from "../core/command";

export class MimicCommand extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder().setName("mimic").setDescription("Mimic");
  }

  async execute(interaction: CommandInteraction) {
    await interaction.reply("mimic");
  }
}

export class MimicScheduleCommand extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder()
      .setName("mimic-schedule")
      .setDescription("Mimic schedule");
  }

  async execute(interaction: CommandInteraction) {
    await interaction.reply("schedule");
  }
}
