import { Awaitable, CommandInteraction, SlashCommandBuilder } from "discord.js";
import Omnibot from "./omnibot.js";

export default abstract class DiscordSlashCommand {
  protected omnibot: Omnibot;

  constructor(omnibot: Omnibot) {
    this.omnibot = omnibot;
  }

  abstract builder(): SlashCommandBuilder;
  abstract execute(interaction: CommandInteraction): Awaitable<void>;
}
