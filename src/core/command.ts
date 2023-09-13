import {
  AutocompleteInteraction,
  Awaitable,
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import Omnibot from "./omnibot.js";

export default abstract class DiscordSlashCommand {
  protected omnibot: Omnibot;

  constructor(omnibot: Omnibot) {
    this.omnibot = omnibot;
  }

  autocomplete(interaction: AutocompleteInteraction): Awaitable<void> {
    throw Error(
      `unhandled autocomplete for command ${interaction.commandName}`
    );
  }

  abstract json(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  abstract execute(interaction: ChatInputCommandInteraction): Awaitable<void>;
}
