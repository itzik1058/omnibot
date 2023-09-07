import "dotenv/config";

const config = {
  clientId: process.env.CLIENT_ID,
  token: process.env.DISCORD_TOKEN,
  guildId: process.env.GUILD_ID,
  dataPath: process.env.DATA_PATH,
};

export default config;
