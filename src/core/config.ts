import "dotenv/config";
import assert from "node:assert";
import untildify from "untildify";

const config = {
  clientId: process.env.CLIENT_ID || assert.fail("Missing CLIENT_ID"),
  token: process.env.DISCORD_TOKEN || assert.fail("Missing DISCORD_TOKEN"),
  guildId: process.env.GUILD_ID || assert.fail("Missing GUILD_ID"),
  dataPath: untildify(
    process.env.DATA_PATH || assert.fail("Missing DATA_PATH")
  ),
};

export default config;
