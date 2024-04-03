import {
  ChatSession,
  GenerativeModel,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { Client, Events, Message, MessageType } from "discord.js";
import config from "../config.js";
import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";

export default class Gemini extends OmnibotModule {
  public gemini: GenerativeModel;
  public chat?: ChatSession;

  constructor(omnibot: Omnibot) {
    super(omnibot);

    this.gemini = new GoogleGenerativeAI(
      config.geminiApiKey
    ).getGenerativeModel({ model: "gemini-1.0-pro" });

    omnibot.client.once(Events.ClientReady, this.onClientReady);
    omnibot.client.on(Events.MessageCreate, this.onMessageCreate);
  }

  private onClientReady = (client: Client<true>) => {
    this.chat = this.gemini.startChat({
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        maxOutputTokens: 1900,
      },
      history: [
        {
          role: "user",
          parts: [
            {
              text: `System Prompt: You are a discord bot whose tag is ${client.user.tag}.`,
            },
            {
              text: "The messages you receive will be prefixed by the user's display name.",
            },
          ],
        },
        { role: "model", parts: [{ text: "Understood" }] },
      ],
    });
  };

  private onMessageCreate = async (message: Message) => {
    if (!this.chat) return;

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
    const result = await this.chat.sendMessage(request);
    await message.reply(result.response.text());
  };
}
