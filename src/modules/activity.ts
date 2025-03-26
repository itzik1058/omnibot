import { Collection, Events, GuildMember } from "discord.js";

import config from "../config.ts";
import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";
import { ScheduledTask } from "../task.ts";

type GuildMemberActivity = GuildMember & { start: Date };

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
      .mapValues((member) => {
        return { ...member, start: new Date() } as GuildMemberActivity;
      });
    this.members.difference(members).forEach((member) => {
      const now = new Date();
      console.log(
        `Member ${member.user.username} was active`,
        `from ${member.start.toString()} to ${now.toString()}`,
      );
    });
    this.members = members;
  };
}
