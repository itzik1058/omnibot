import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { Client, Events, REST, Routes } from "discord.js";
import config from "../core/config.js";
import DiscordEvent from "../core/event.js";

export default class ClientReady extends DiscordEvent<Events.ClientReady> {
  async execute(client: Client<true>) {
    console.info(`Ready! Logged in as ${client.user.tag}`);

    const rest = new REST().setToken(client.token);
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      {
        body: this.omnibot.commands.map((value) => value.builder()),
      }
    );

    const commandNames = [...this.omnibot.commands.keys()];
    console.info(`registered command handlers for ${commandNames.join(", ")}`);

    await Promise.all(this.omnibot.tasks.mapValues((task) => task.setup()));
    const taskNames = [...this.omnibot.tasks.keys()];
    console.info(`setup tasks ${taskNames.join(", ")}`);

    this.omnibot.chat = this.omnibot.gemini.startChat({
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      history: [
        {
          role: "user",
          parts: [
            {
              text: `System Prompt: You are a discord bot whose tag is ${client.user.tag}.`,
            },
            {
              text: "The messages you receive will be prefixed by the user's display name.",
            },
          ],
        },
        { role: "model", parts: [{ text: "Understood" }] },
      ],
    });
  }
}
