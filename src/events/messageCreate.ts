import { Events, Message, MessageType } from "discord.js";
import DiscordEvent from "../core/event.js";

export default class MessageCreate extends DiscordEvent<Events.MessageCreate> {
  async execute(message: Message) {
    if (!this.omnibot.chat) return;

    const userId = this.omnibot.client.user?.id;
    if (
      message.author.bot ||
      message.content.includes("@here") ||
      message.content.includes("@everyone") ||
      message.type == MessageType.Reply ||
      (userId && !message.mentions.has(userId))
    )
      return;

    const request = `${message.member?.displayName}: ${message.content}`;
    console.info(request);
    const result = await this.omnibot.chat.sendMessage(request);
    await message.reply(result.response.text());
  }
}
