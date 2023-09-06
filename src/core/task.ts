import { Awaitable } from "discord.js";
import Omnibot from "./omnibot";
import { randomErlang } from "./utils";

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
    const delay = randomErlang(10, this.scale) / 10;
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
