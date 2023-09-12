import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import DiscordSlashCommand from "../core/command.js";

export class MimicCommand extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder().setName("mimic").setDescription("Mimic");
  }

  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    await interaction.deleteReply();
    await this.omnibot.tasks.get("mimic")?.execute();
  }
}

export class MimicScheduleCommand extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder()
      .setName("mimic-schedule")
      .setDescription("Mimic schedule");
  }

  async execute(interaction: CommandInteraction) {
    await interaction.reply({ content: "schedule", ephemeral: true });
  }
}
