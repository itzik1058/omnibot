import { Client, GatewayIntentBits } from "discord.js";
import config from "./config";
import Omnibot from "./omnibot";

process.on("uncaughtException", (error: Error) => {
  console.error(error);
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
void omnibot.login(config.token);
