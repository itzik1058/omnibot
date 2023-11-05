import { readFileSync } from "node:fs";
import path from "node:path";
import config from "../core/config.js";
import Omnibot from "../core/omnibot.js";
import { ScheduledOmnibotTask } from "../core/task.js";

interface FloridaManRawEntry {
  post_id: string;
  created_at: string;
  score: string;
  title: string;
  posted_by: string;
  url: string;
}

interface FloridaManEntry {
  post_id: string;
  created_at: Date;
  score: number;
  title: string;
  posted_by: string;
  url: string;
}

export default class FloridaManTask extends ScheduledOmnibotTask {
  private data: Array<FloridaManEntry>;

  constructor(omnibot: Omnibot) {
    super(omnibot, 24 * 60 * 60 * 1000); // every day

    this.data = [];
  }

  setup() {
    super.setup();
    const rawData = JSON.parse(
      readFileSync(
        path.join(config.dataPath, "attachments/florida_man.json"),
        "utf-8"
      )
    ) as Array<FloridaManRawEntry>;
    this.data = rawData.map((entry) => ({
      post_id: entry.post_id,
      created_at: new Date(entry.created_at),
      score: Number(entry.score),
      title: entry.title,
      posted_by: entry.posted_by,
      url: entry.url,
    }));
  }

  async execute() {
    const entries = this.data.filter((entry) => {
      const now = new Date();
      return (
        entry.created_at.getDate() == now.getDate() &&
        entry.created_at.getMonth() == now.getMonth()
      );
    });
    if (entries.length == 0) {
      console.info(`FloridaManTask no entry found for today`);
      return;
    }
    const entry = entries[Math.floor(Math.random() * entries.length)];
    const channel = this.omnibot.client.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) await channel.send({ content: `${entry.url}` });
    console.info(`FloridaManTask with entry ${entry.post_id}`);
  }
}
