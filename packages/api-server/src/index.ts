import makeDebug from "debug";

import { Config } from "./config.js";
import { makeApp } from "./app.js";

const debug = makeDebug("api-server");

async function main() {
  const config = Config.fromEnv();
  const app = makeApp(config);

  const server = app.listen(config.port, (error) => {
    if (error) {
      debug("Unable to start server: %O", error);
      return;
    }

    debug("Server started on port", config.port);
  });

  // TODO: wait shutdown signal
  // TODO: gracefully shutdown server

  void server;
}

main().catch((error) => {
  debug("Unhandled error in main(): %O", error);
  process.exit(1);
});
