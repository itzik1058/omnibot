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

export abstract class ScheduledOmnibotTask extends OmnibotTask {
  protected timeout?: NodeJS.Timeout;
  protected delay: number;

  constructor(omnibot: Omnibot, delay: number) {
    super(omnibot);
    this.delay = delay;
  }

  setup() {
    this.schedule();
  }

  protected schedule() {
    const execute = this.execute.bind(this);
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      new Promise((resolve) => {
        resolve(execute());
      }).catch((reason) => {
        console.error(reason);
      });
      this.schedule();
    }, this.delay);
  }
}

export abstract class ErlangScheduledOmnibotTask extends ScheduledOmnibotTask {
  private scale: number;

  constructor(omnibot: Omnibot, scale: number) {
    super(omnibot, Infinity);
    this.scale = scale;
  }

  protected schedule() {
    // divide variance by e^3 for stable results
    const varianceDivider = Math.pow(Math.E, 3);
    this.delay = randomErlang(varianceDivider, this.scale / varianceDivider);
    super.schedule();
  }
}
