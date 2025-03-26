import { existsSync, type PathLike } from "node:fs";
import { appendFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Collection, Events, GuildMember } from "discord.js";

import config from "../config.ts";
import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";
import { ScheduledTask } from "../task.ts";

type GuildMemberActivity = GuildMember & { activityStart: Date };

export default class Activity extends OmnibotModule {
  private members: Collection<string, GuildMemberActivity>;
  private logPath: PathLike;
  private task: ScheduledTask;

  constructor(omnibot: Omnibot) {
    super(omnibot);

    this.members = new Collection();
    this.logPath = path.join(config.dataPath, "activity.csv");
    this.task = new ScheduledTask(this.tick.bind(this), 1000);

    omnibot.client.once(Events.ClientReady, () => {
      this.onClientReady().catch((e) => console.error(e));
    });
  }

  private onClientReady = async () => {
    if (!existsSync(this.logPath))
      await writeFile(
        this.logPath,
        ["id", "username", "join", "leave", "nickname"].join(","),
      );
    this.task.start();
  };

  private async tick() {
    const guild = this.omnibot.client.guilds.cache.get(config.guildId);
    if (!guild) return;
    const members = guild.channels.cache
      .filter((channel) => channel.isVoiceBased())
      .flatMap((channel) => channel.members)
      .mapValues(
        (member, key) =>
          ({
            ...member,
            activityStart: this.members.get(key)?.activityStart ?? new Date(),
          }) as GuildMemberActivity,
      );
    const previousMembers = new Set(this.members.map((_, key) => key));
    const currentMembers = new Set(members.map((_, key) => key));
    for (const key of previousMembers.difference(currentMembers)) {
      const member = this.members.get(key)!;
      const now = new Date();
      await appendFile(
        this.logPath,
        "\n" +
          [
            member.id,
            member.user.username,
            member.activityStart.toISOString(),
            now.toISOString(),
            member.nickname,
          ].join(","),
      );
    }
    this.members = members;
  }
}
