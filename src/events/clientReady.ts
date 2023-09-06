import { Client, Events, REST, Routes } from "discord.js";
import config from "../core/config";
import DiscordEvent from "../core/event";

export default class ClientReady extends DiscordEvent<Events.ClientReady> {
  async execute(client: Client<true>) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    const rest = new REST().setToken(client.token);
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      {
        body: this.omnibot.commands.map((value) => value.builder().toJSON()),
      }
    );

    const commandNames = [...this.omnibot.commands.keys()];
    console.info(`registered command handlers for ${commandNames.join(", ")}`);

    await Promise.all(this.omnibot.tasks.mapValues((task) => task.setup()));
    const taskNames = [...this.omnibot.tasks.keys()];
    console.info(`setup tasks ${taskNames.join(", ")}`);
  }
}
