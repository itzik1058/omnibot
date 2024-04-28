import { Client, Collection, Events, REST, Routes } from "discord.js";
import config from "./config.js";
import { OmnibotModule } from "./module.js";
import Echo from "./modules/echo.js";
import FloridaMan from "./modules/floridaMan.js";
import Gemini from "./modules/gemini.js";
import Meme from "./modules/meme.js";
import Mimic from "./modules/mimic.js";
import Record from "./modules/record.js";

export default class Omnibot {
  public modules: Collection<string, OmnibotModule>;

  public readonly client: Client;

  public constructor(client: Client) {
    this.client = client;
    this.modules = new Collection();
    this.modules.set("echo", new Echo(this));
    this.modules.set("floridaMan", new FloridaMan(this));
    this.modules.set("gemini", new Gemini(this));
    this.modules.set("meme", new Meme(this));
    this.modules.set("mimic", new Mimic(this));
    this.modules.set("record", new Record(this));

    client.once(Events.ClientReady, this.onClientReady);
  }

  async login(token?: string) {
    await this.client.login(token);
  }

  onClientReady = async (client: Client<true>) => {
    console.info(`Ready! Logged in as ${client.user.tag}`);

    const commands = this.modules.map((module) => module.commands()).flat();
    const rest = new REST().setToken(client.token);
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      {
        body: commands,
      }
    );

    const commandNames = commands.map((command) => command.name).join(", ");
    console.info(`registered command handlers for ${commandNames}`);
  };
}
