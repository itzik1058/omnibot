import {
  ChatSession,
  GenerativeModel,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  StartChatParams,
} from "@google/generative-ai";
import {
  Client,
  Events,
  Interaction,
  Message,
  MessageType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";
import config from "../config.js";
import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";

export default class Gemini extends OmnibotModule {
  private gemini: GenerativeModel;
  private startChatParams?: StartChatParams;
  private chat?: ChatSession;

  constructor(omnibot: Omnibot) {
    super(omnibot);

    this.gemini = new GoogleGenerativeAI(
      config.geminiApiKey
    ).getGenerativeModel({ model: "gemini-1.0-pro" });

    omnibot.client.once(Events.ClientReady, this.onClientReady);
    omnibot.client.on(Events.InteractionCreate, this.onInteractionCreate);
    omnibot.client.on(Events.MessageCreate, this.onMessageCreate);
  }

  public commands(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return [
      new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Reset chat")
        .setDMPermission(false)
        .toJSON(),
    ];
  }

  private onClientReady = (client: Client<true>) => {
    this.startChatParams = {
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
      history: [
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
      ],
    };
    this.chat = this.gemini.startChat(this.startChatParams);
  };

  private onInteractionCreate = (interaction: Interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName == "reset")
      this.chat = this.gemini.startChat(this.startChatParams);
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
    console.info(`Gemini request: ${request}`);
    try {
      const result = await this.chat.sendMessage(request);
      const response = result.response;
      const blockReason = response.promptFeedback?.blockReason;
      const blockReasonMessage = response.promptFeedback?.blockReasonMessage;
      if (blockReason) {
        console.warn(blockReason);
        if (blockReasonMessage) {
          console.warn(blockReasonMessage);
          await message.reply(blockReasonMessage);
        }
      }
      const text = response.text();
      console.info(`Gemini response: ${text}`);

      await message.reply(text);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) await message.reply(e.message);
    }
  };
}
