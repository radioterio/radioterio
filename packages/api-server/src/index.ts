import { main } from "./main.js";

try {
  await main();
} catch (e) {
  console.error("Unhandled error in main(): %O", e);
  process.exit(1);
}
