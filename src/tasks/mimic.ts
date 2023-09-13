import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { glob } from "glob";
import config from "../core/config.js";
import Omnibot from "../core/omnibot.js";
import { ErlangScheduledOmnibotTask } from "../core/task.js";

export default class MimicTask extends ErlangScheduledOmnibotTask {
  private audio: Array<string>;
  private queue: Array<string>;

  constructor(omnibot: Omnibot) {
    super(omnibot, 30 * 60 * 1000); // 30 minutes

    this.audio = [];
    this.queue = [];
  }

  async setup() {
    super.setup();

    const mimic = await glob(`${config.dataPath}/audio/mimic/**/*`);
    const terraria = await glob(`${config.dataPath}/audio/terraria/**/*`);
    this.audio = [...mimic, ...terraria];
  }

  execute() {
    if (this.queue.length == 0) {
      this.queue = [...this.audio];
      this.queue.sort(() => Math.random() - 0.5); // shuffle
    }
    const resourcePath = this.queue.pop() as string;
    const channel = this.omnibot.client.channels.cache
      .filter((channel) => channel.isVoiceBased() && channel.members.size > 0)
      .random() as VoiceBasedChannel | undefined;
    if (!channel) {
      console.info("MimicTask skipped because voice channels are empty");
      return;
    }

    getVoiceConnection(channel.guildId)?.destroy();
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    console.info(`MimicTask with resource ${resourcePath}`);
    const player = createAudioPlayer();
    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
    connection.subscribe(player);
    player.play(createAudioResource(resourcePath));
  }
}
