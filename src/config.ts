import "dotenv/config";

import assert from "node:assert";

import untildify from "untildify";

const config = {
  clientId: process.env.CLIENT_ID || assert.fail("Missing CLIENT_ID"),
  token: process.env.DISCORD_TOKEN || assert.fail("Missing DISCORD_TOKEN"),
  dataPath: untildify(process.env.DATA_PATH ?? "/omnibot"),
  guildId: process.env.GUILD_ID || assert.fail("Missing GUILD_ID"),
  channelId: process.env.CHANNEL_ID || assert.fail("Missing CHANNEL_ID"),
  geminiApiKey:
    process.env.GEMINI_API_KEY || assert.fail("Missing GEMINI_API_KEY"),
};

export default config;
