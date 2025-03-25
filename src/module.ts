import { type RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

import Omnibot from "./omnibot.js";

export abstract class OmnibotModule {
  protected omnibot: Omnibot;

  constructor(omnibot: Omnibot) {
    this.omnibot = omnibot;
  }

  public commands(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return [];
  }
}
