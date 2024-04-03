import { randomErlang } from "./utils.js";

type CallbackType = () => void | PromiseLike<void>;

export class ScheduledTask {
  protected callback: CallbackType;
  protected delay: number;
  protected timeout?: NodeJS.Timeout;

  constructor(callback: CallbackType, delay: number) {
    this.callback = callback;
    this.delay = delay;
  }

  public start() {
    this.schedule();
  }

  protected schedule() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      new Promise((resolve) => {
        resolve(this.callback());
      }).catch((reason: unknown) => {
        console.error(reason);
      });
      this.schedule();
    }, this.delay);
  }
}

export class ErlangScheduledTask extends ScheduledTask {
  private scale: number;

  constructor(callback: CallbackType, scale: number) {
    super(callback, Infinity);
    this.scale = scale;
  }

  protected schedule() {
    // divide variance by e^3 for stable results
    const varianceDivider = Math.pow(Math.E, 3);
    this.delay = randomErlang(varianceDivider, this.scale / varianceDivider);
    super.schedule();
  }
}
