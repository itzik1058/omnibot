import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import DiscordSlashCommand from "../core/command.js";
import MimicTask from "../tasks/mimic.js";

export default class MimicCommand extends DiscordSlashCommand {
  builder() {
    return new SlashCommandBuilder()
      .setName("mimic")
      .setDescription("Mimic")
      .setDMPermission(false)
      .addStringOption((option) =>
        option
          .setName("path")
          .setDescription("Resource path")
          .setAutocomplete(true)
      )
      .toJSON();
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const path = interaction.options.getString("path");
    const mimic = this.omnibot.tasks.get("mimic") as MimicTask;
    if (path) {
      const member = interaction.member as GuildMember;
      if (!member.voice.channel) {
        await interaction.reply({
          content: "You must be connected to a voice channel",
          ephemeral: true,
        });
        return;
      }
      mimic.play(member.voice.channel, path);
    } else {
      mimic.execute();
    }
    await interaction.deferReply();
    await interaction.deleteReply();
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    switch (focused.name) {
      case "path":
        {
          const pattern = new RegExp(
            Array.from(focused.value.toLowerCase()).join(".*?")
          );
          const mimicTask = this.omnibot.tasks.get("mimic") as MimicTask;
          const options = mimicTask
            .resources()
            .filter((resource) => pattern.test(resource.toLowerCase()))
            .slice(0, 25)
            .map((resource) => ({ name: resource, value: resource }));
          await interaction.respond(options);
        }
        break;
    }
  }
}
