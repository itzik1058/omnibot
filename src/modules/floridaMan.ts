import { Events } from "discord.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import config from "../config.js";
import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";

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

export default class FloridaMan extends OmnibotModule {
  private data: Array<FloridaManEntry>;

  constructor(omnibot: Omnibot) {
    super(omnibot);

    this.data = [];

    omnibot.client.on(Events.ClientReady, this.onClientReady);
  }

  private onClientReady = () => {
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
  };

  async sendFloridaMan() {
    const entries = this.data.filter((entry) => {
      const now = new Date();
      return (
        entry.created_at.getDate() == now.getDate() &&
        entry.created_at.getMonth() == now.getMonth()
      );
    });

    if (entries.length == 0) {
      console.info(`sendFloridaMan no entry found for today`);
      return;
    }

    const entry = entries[Math.floor(Math.random() * entries.length)];
    const channel = this.omnibot.client.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) await channel.send({ content: entry.url });
    console.info(`sendFloridaMan with entry ${entry.post_id}`);
  }
}
