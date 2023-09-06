import { Client, Collection, Events } from "discord.js";
import MemeCommand from "../commands/meme";
import { MimicCommand, MimicScheduleCommand } from "../commands/mimic";
import ClientReady from "../events/clientReady";
import InteractionCreate from "../events/interactionCreate";
import MemeTask from "../tasks/meme";
import MimicTask from "../tasks/mimic";
import DiscordSlashCommand from "./command";
import { OmnibotTask } from "./task";

export default class Omnibot {
  public commands: Collection<string, DiscordSlashCommand>;
  public tasks: Collection<string, OmnibotTask>;

  private readonly client: Client;

  public constructor(client: Client) {
    this.client = client;
    this.commands = new Collection(
      [
        new MemeCommand(this),
        new MimicCommand(this),
        new MimicScheduleCommand(this),
      ].map((command) => [command.builder().name, command])
    );
    this.tasks = new Collection();
    this.tasks.set("meme", new MemeTask(this));
    this.tasks.set("mimic", new MimicTask(this));

    client.once(Events.ClientReady, (...args) =>
      new ClientReady(this).execute(...args)
    );
    client.on(Events.InteractionCreate, (...args) =>
      new InteractionCreate(this).execute(...args)
    );
  }

  async login(token?: string) {
    await this.client.login(token);
  }
}
