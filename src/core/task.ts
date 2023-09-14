import { Awaitable } from "discord.js";
import Omnibot from "./omnibot.js";
import { randomErlang } from "./utils.js";

export abstract class OmnibotTask {
  protected omnibot: Omnibot;

  constructor(omnibot: Omnibot) {
    this.omnibot = omnibot;
  }

  abstract setup(): Awaitable<void>;
  abstract execute(): Awaitable<void>;
}

export abstract class ErlangScheduledOmnibotTask extends OmnibotTask {
  protected timeout?: NodeJS.Timeout;
  private scale: number;

  constructor(omnibot: Omnibot, scale: number) {
    super(omnibot);
    this.scale = scale;
  }

  setup() {
    this.schedule();
  }

  protected schedule() {
    const execute = this.execute.bind(this);
    // divide variance by e^3 for more stable results
    const varianceDivider = Math.pow(Math.E, 3);
    const delay = randomErlang(varianceDivider, this.scale / varianceDivider);
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      new Promise((resolve) => {
        resolve(execute());
      }).catch((reason) => {
        console.error(reason);
      });
      this.schedule();
    }, delay);
  }
}
