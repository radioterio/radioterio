import { main } from "./main.js";

try {
  await main();
} catch (e) {
  console.error("Unhandled errors in main(): %O", e);
  process.exit(1);
}
