import { glob } from "glob";
import config from "../core/config.js";
import Omnibot from "../core/omnibot.js";
import { ErlangScheduledOmnibotTask } from "../core/task.js";

export default class MemeTask extends ErlangScheduledOmnibotTask {
  private attachments: Array<string>;
  private queue: Array<string>;

  constructor(omnibot: Omnibot) {
    super(omnibot, 12 * 60 * 60 * 1000);

    this.attachments = [];
    this.queue = [];
  }

  async setup() {
    super.setup();

    const fsd = await glob(`${config.dataPath}/attachments/fsd/*`);
    const sign = await glob(`${config.dataPath}/attachments/sign/*`);
    this.attachments = [...fsd, ...sign];
  }

  async execute() {
    if (this.queue.length == 0) {
      this.queue = [...this.attachments];
      this.queue.sort(() => Math.random() - 0.5); // shuffle
    }
    const attachment = this.queue.pop() as string;
    const channel = this.omnibot.client.channels.cache.get(config.channelId);
    if (channel?.isTextBased())
      await channel.send({ files: [{ attachment: attachment }] });
    console.info(`MemeTask with attachment ${attachment}`);
  }
}
