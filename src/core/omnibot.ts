import { Client, Collection, Events } from "discord.js";
import EchoCommand from "../commands/echo.js";
import MemeCommand from "../commands/meme.js";
import MimicCommand from "../commands/mimic.js";
import ClientReady from "../events/clientReady.js";
import InteractionCreate from "../events/interactionCreate.js";
import FloridaManTask from "../tasks/floridaMan.js";
import MemeTask from "../tasks/meme.js";
import MimicTask from "../tasks/mimic.js";
import DiscordSlashCommand from "./command.js";
import { OmnibotTask } from "./task.js";

export default class Omnibot {
  public commands: Collection<string, DiscordSlashCommand>;
  public tasks: Collection<string, OmnibotTask>;

  public readonly client: Client;

  public constructor(client: Client) {
    this.client = client;
    this.commands = new Collection(
      [
        new MemeCommand(this),
        new MimicCommand(this),
        new EchoCommand(this),
      ].map((command) => [command.builder().name, command])
    );
    this.tasks = new Collection();
    this.tasks.set("meme", new MemeTask(this));
    this.tasks.set("mimic", new MimicTask(this));
    this.tasks.set("floridaMan", new FloridaManTask(this));

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
