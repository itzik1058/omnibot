import { generateDependencyReport } from "@discordjs/voice";
import { Client, GatewayIntentBits } from "discord.js";
import config from "./config.js";
import Omnibot from "./omnibot.js";

process.on("uncaughtException", (error: Error) => {
  console.error(`Uncaught exception: ${error.stack ?? error.message}`);
});

console.info(generateDependencyReport());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
});
const omnibot = new Omnibot(client);
await omnibot.login(config.token);
