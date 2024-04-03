import {
  Events,
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";
import { glob } from "glob";
import path from "node:path";
import config from "../config.js";
import { OmnibotModule } from "../module.js";
import Omnibot from "../omnibot.js";
import { ErlangScheduledTask } from "../task.js";

export default class Meme extends OmnibotModule {
  private attachments: Array<string>;
  private queue: Array<string>;
  private task: ErlangScheduledTask;

  constructor(omnibot: Omnibot) {
    super(omnibot);

    this.attachments = [];
    this.queue = [];
    this.task = new ErlangScheduledTask(
      this.sendMeme.bind(this),
      7 * 24 * 60 * 60 * 1000
    );

    omnibot.client.once(Events.ClientReady, this.onClientReady);
    omnibot.client.on(Events.InteractionCreate, this.onInteractionCreate);
  }

  public commands(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return [
      new SlashCommandBuilder().setName("meme").setDescription("Meme").toJSON(),
    ];
  }

  private onClientReady = async () => {
    const fsd = await glob(path.join(config.dataPath, "attachments/fsd/*.*"));
    const sign = await glob(path.join(config.dataPath, "attachments/sign/*.*"));
    this.attachments = [...fsd, ...sign].map((attachment) =>
      path.relative(config.dataPath, attachment)
    );
    this.task.start();
  };

  private onInteractionCreate = async (interaction: Interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName == "meme") {
      await this.sendMeme();
    }
  };

  private async sendMeme() {
    if (this.queue.length == 0) {
      this.queue = [...this.attachments];
      this.queue.sort(() => Math.random() - 0.5); // shuffle
    }
    const attachment = this.queue.pop() as string;
    const channel = this.omnibot.client.channels.cache.get(config.channelId);
    if (channel?.isTextBased())
      await channel.send({
        files: [{ attachment: path.join(config.dataPath, attachment) }],
      });
    console.info(`sendMeme with attachment ${attachment}`);
  }
}
