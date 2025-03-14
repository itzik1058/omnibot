import {
  Events,
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";
import config from "../config.js";
import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";

export default class Echo extends OmnibotModule {
  constructor(omnibot: Omnibot) {
    super(omnibot);

    omnibot.client.on(Events.InteractionCreate, this.onInteractionCreate);
  }

  public commands(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return [
      new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Echo")
        .setDMPermission(false)
        .addStringOption((option) =>
          option.setName("content").setDescription("content").setRequired(true)
        )
        .toJSON(),
    ];
  }

  private onInteractionCreate = async (interaction: Interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName == "echo") {
      await interaction.deferReply();
      await interaction.deleteReply();
      const content = interaction.options.getString("content");
      const channel = this.omnibot.client.channels.cache.get(config.channelId);
      if (channel?.isSendable() && content !== null)
        await channel.send({ content: content });
    }
  };
}
