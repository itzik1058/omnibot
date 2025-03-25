import {
  Events,
  type Interaction,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";

import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";

export default class PrntSc extends OmnibotModule {
  constructor(omnibot: Omnibot) {
    super(omnibot);

    omnibot.client.on(Events.InteractionCreate, (interaction) => {
      this.onInteractionCreate(interaction).catch((e) => console.error(e));
    });
  }

  public commands(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return [
      new SlashCommandBuilder()
        .setName("prntsc")
        .setDescription("Random prnt.sc")
        .toJSON(),
    ];
  }

  private onInteractionCreate = async (interaction: Interaction) => {
    if (
      interaction.isChatInputCommand() &&
      interaction.commandName == "prntsc"
    ) {
      const key = Math.random().toString(36).substring(2, 8);
      await interaction.reply(`https://prnt.sc/${key}`);
    }
  };
}
