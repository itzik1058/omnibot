import { Collection, Events, GuildMember } from "discord.js";

import config from "../config.ts";
import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";
import { ScheduledTask } from "../task.ts";

type GuildMemberActivity = GuildMember & { activityStart: Date };

export default class Activity extends OmnibotModule {
  private members: Collection<string, GuildMemberActivity>;
  private task: ScheduledTask;

  constructor(omnibot: Omnibot) {
    super(omnibot);

    this.members = new Collection();
    this.task = new ScheduledTask(this.tick, 1000);

    omnibot.client.once(Events.ClientReady, () => this.task.start());
  }

  private tick = () => {
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
    previousMembers.difference(currentMembers).forEach((key) => {
      const member = this.members.get(key)!;
      const now = new Date();
      console.log(
        `Member ${member.user.username} was active`,
        `from ${member.activityStart.toString()} to ${now.toString()}`,
      );
    });
    this.members = members;
  };
}
