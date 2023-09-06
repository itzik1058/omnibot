import { Client, GatewayIntentBits } from "discord.js";
import config from "./core/config";
import Omnibot from "./core/omnibot";

process.on("uncaughtException", (error: Error) => {
  console.error(`Uncaught exception: ${error.stack}`);
});

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
    // GatewayIntentBits.MessageContent,
  ],
});
const omnibot = new Omnibot(client);
omnibot.login(config.token).catch((reason) => {
  console.error(reason);
});
