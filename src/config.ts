import "dotenv/config";

if (process.env.CLIENT_ID === undefined)
  throw Error("Client id is not defined");
if (process.env.DISCORD_TOKEN === undefined)
  throw Error("Discord token is not defined");

const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
};

export default config;
