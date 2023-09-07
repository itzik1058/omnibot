export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_ID: string;
      DISCORD_TOKEN: string;
      GUILD_ID: string;
      DATA_PATH: string;
    }
  }
}
