import "dotenv/config";

if (process.env.CLIENT_ID === undefined)
  throw Error("Client id is not defined");
if (process.env.DISCORD_TOKEN === undefined)
  throw Error("Discord token is not defined");
if (process.env.GUILD_ID === undefined) throw Error("Guild id is not defined");

const config = {
  clientId: process.env.CLIENT_ID,
  token: process.env.DISCORD_TOKEN,
  guildId: process.env.GUILD_ID,
};

export default config;
