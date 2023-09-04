import type { Client } from "discord.js";
import { Collection, Events } from "discord.js";
import type DiscordSlashCommand from "./command";
import { Mimic } from "./commands";
import { ClientReady, InteractionCreate } from "./events";

export default class Omnibot {
  public commands: Collection<string, DiscordSlashCommand>;

  private readonly client: Client;

  public constructor(client: Client) {
    this.client = client;
    this.commands = new Collection(
      [new Mimic(this)].map((command) => [command.builder().name, command])
    );

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
