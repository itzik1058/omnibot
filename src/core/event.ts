import { Awaitable, ClientEvents } from "discord.js";
import Omnibot from "./omnibot.js";

export default abstract class DiscordEvent<Event extends keyof ClientEvents> {
  protected omnibot: Omnibot;

  constructor(omnibot: Omnibot) {
    this.omnibot = omnibot;
  }

  abstract execute(...args: ClientEvents[Event]): Awaitable<void>;
}
