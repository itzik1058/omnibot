import Omnibot from "../core/omnibot.js";
import { ErlangScheduledOmnibotTask } from "../core/task.js";

export default class MemeTask extends ErlangScheduledOmnibotTask {
  constructor(omnibot: Omnibot) {
    super(omnibot, 12 * 60 * 60 * 1000);
  }

  execute() {
    console.log("MemeTask executed");
  }
}
