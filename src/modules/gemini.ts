import {
  ChatSession,
  type Content,
  GenerativeModel,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import {
  Client,
  Events,
  type Interaction,
  Message,
  MessageType,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";

import config from "../config.js";
import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";

export default class Gemini extends OmnibotModule {
  private gemini: GenerativeModel;
  private history: Content[];
  private chat?: ChatSession;

  constructor(omnibot: Omnibot) {
    super(omnibot);

    this.gemini = new GoogleGenerativeAI(
      config.geminiApiKey,
    ).getGenerativeModel({
      model: "gemini-2.0-flash",
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
        maxOutputTokens: 1000,
      },
    });
    this.history = [];

    omnibot.client.once(Events.ClientReady, this.onClientReady);
    omnibot.client.on(Events.InteractionCreate, this.onInteractionCreate);
    omnibot.client.on(Events.MessageCreate, (message) => {
      this.onMessageCreate(message).catch((e) => console.error(e));
    });
  }

  public commands(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return [
      new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Reset chat")
        .toJSON(),
    ];
  }

  private resetChat() {
    this.chat = this.gemini.startChat({ history: [...this.history] });
  }

  private onClientReady = (client: Client<true>) => {
    this.history = [
      {
        role: "user",
        parts: [
          {
            text: `
              System Prompt: You are a discord bot whose tag is ${client.user.tag}.
              The messages you receive will be prefixed by the user's display name.
              `,
          },
        ],
      },
      { role: "model", parts: [{ text: "Understood" }] },
    ];
    this.resetChat();
  };

  private onInteractionCreate = (interaction: Interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName == "reset")
      this.resetChat();
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
    const parts = await Promise.all(
      message.attachments.map(async (attachment) => {
        const response = await fetch(attachment.url);
        const buffer = await response.arrayBuffer();
        const data = Buffer.from(buffer).toString("base64");
        return {
          inlineData: {
            data: data,
            mimeType: attachment.contentType ?? "text/plain",
          },
        };
      }),
    );
    console.info(`Gemini request: (${parts.length} attachments) ${request}`);
    try {
      const result = await this.chat.sendMessage([request, ...parts]);
      const response = result.response;
      const blockReason = response.promptFeedback?.blockReason;
      const blockReasonMessage = response.promptFeedback?.blockReasonMessage;
      if (blockReason) {
        if (blockReasonMessage) {
          console.warn(blockReasonMessage);
          await message.reply(blockReasonMessage);
        } else {
          await message.reply(`Request blocked due to ${blockReason}`);
        }
      } else {
        const text = response.text();
        console.info(`Gemini response: ${text}`);
        await message.reply(text);
      }
    } catch (e) {
      console.error(e);
      this.resetChat();
      if (e instanceof Error) {
        await message.reply(e.message);
      }
    }
  };
}
