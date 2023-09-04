import { Client, Events, REST, Routes } from "discord.js";
import config from "../config";
import DiscordEvent from "../event";

export default class ClientReady extends DiscordEvent<Events.ClientReady> {
  async execute(client: Client<true>) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    const rest = new REST().setToken(client.token);
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, "192644286171316224"),
      {
        body: this.omnibot.commands.map((value) => value.builder().toJSON()),
      }
    );

    const registeredCommands = [...this.omnibot.commands.keys()];
    console.info(
      `registered command handlers for ${registeredCommands.join(", ")}`
    );
  }
}
