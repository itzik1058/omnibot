import { ChatInputCommandInteraction, Events, Interaction } from "discord.js";
import DiscordEvent from "../core/event.js";

export default class InteractionCreate extends DiscordEvent<Events.InteractionCreate> {
  async execute(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      try {
        await this.handleChatInputCommandInteraction(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    } else {
      console.error("unhandled interaction");
    }
  }

  private async handleChatInputCommandInteraction(
    interaction: ChatInputCommandInteraction
  ) {
    const command = this.omnibot.commands.get(interaction.commandName);
    if (!command) throw Error(`unhandled command ${interaction.commandName}`);
    await command.execute(interaction);
  }
}
