import { glob } from "glob";
import path from "node:path";
import config from "../core/config.js";
import Omnibot from "../core/omnibot.js";
import { ErlangScheduledOmnibotTask } from "../core/task.js";

export default class MemeTask extends ErlangScheduledOmnibotTask {
  private attachments: Array<string>;
  private queue: Array<string>;

  constructor(omnibot: Omnibot) {
    super(omnibot, 7 * 24 * 60 * 60 * 1000);

    this.attachments = [];
    this.queue = [];
  }

  async setup() {
    super.setup();

    const fsd = await glob(path.join(config.dataPath, "attachments/fsd/*.*"));
    const sign = await glob(path.join(config.dataPath, "attachments/sign/*.*"));
    this.attachments = [...fsd, ...sign].map((attachment) =>
      path.relative(config.dataPath, attachment)
    );
  }

  async execute() {
    if (this.queue.length == 0) {
      this.queue = [...this.attachments];
      this.queue.sort(() => Math.random() - 0.5); // shuffle
    }
    const attachment = this.queue.pop() as string;
    const channel = this.omnibot.client.channels.cache.get(config.channelId);
    if (channel?.isTextBased())
      await channel.send({
        files: [{ attachment: path.join(config.dataPath, attachment) }],
      });
    console.info(`MemeTask with attachment ${attachment}`);
  }
}
