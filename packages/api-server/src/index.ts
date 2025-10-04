import { main } from "./main.js";

import makeDebug from "debug";

const debug = makeDebug("app:index");

try {
  await main();
} catch (e) {
  debug("Unhandled errors in main(): %O", e);
  process.exit(1);
}
