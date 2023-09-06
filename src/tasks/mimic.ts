import Omnibot from "../core/omnibot";
import { ErlangScheduledOmnibotTask } from "../core/task";

export default class MimicTask extends ErlangScheduledOmnibotTask {
  constructor(omnibot: Omnibot) {
    super(omnibot, 12 * 60 * 60 * 1000);
  }

  execute() {
    console.log("MimicTask execute");
  }
}
