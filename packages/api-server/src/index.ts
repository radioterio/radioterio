import makeDebug from "debug";

const debug = makeDebug("api-server");

async function main() {
  throw new TypeError("Bummer!");
}

main().catch((error) => {
  debug("Unhandled error in main(): %O", error);
  process.exit(1);
});
