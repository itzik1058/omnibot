import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { glob } from "glob";
import path from "node:path";
import config from "../core/config.js";
import Omnibot from "../core/omnibot.js";
import { ErlangScheduledOmnibotTask } from "../core/task.js";

export default class MimicTask extends ErlangScheduledOmnibotTask {
  private audio: Array<string>;
  private queue: Array<string>;

  constructor(omnibot: Omnibot) {
    super(omnibot, 2 * 60 * 60 * 1000); // 1 hour

    this.audio = [];
    this.queue = [];
  }

  async setup() {
    super.setup();

    const mimic = await glob(path.join(config.dataPath, "audio/mimic/**/*.*"));
    const terraria = await glob(
      path.join(config.dataPath, "audio/terraria/**/*.*")
    );
    this.audio = [...mimic, ...terraria].map((resource) =>
      path.relative(config.dataPath, resource)
    );
  }

  execute() {
    if (this.queue.length == 0) {
      this.queue = [...this.audio];
      this.queue.sort(() => Math.random() - 0.5); // shuffle
    }
    const resource = this.queue.pop() as string;
    const channel = this.omnibot.client.channels.cache
      .filter((channel) => channel.isVoiceBased() && channel.members.size > 0)
      .random() as VoiceBasedChannel | undefined;
    if (!channel) {
      console.info("MimicTask skipped because voice channels are empty");
      return;
    }

    console.info(`MimicTask with resource ${resource}`);
    this.play(channel, resource);
  }

  public play(channel: VoiceBasedChannel, resource: string) {
    getVoiceConnection(channel.guildId)?.destroy();
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
    connection.subscribe(player);
    player.play(createAudioResource(path.join(config.dataPath, resource)));
  }

  public resources() {
    return this.audio;
  }
}
