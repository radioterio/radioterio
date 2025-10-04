import makeDebug from "debug";

import { Config } from "./config.js";
import { createApp } from "./app.js";
import { createContainer } from "./di/container.js";

const debug = makeDebug("api-server");

async function main() {
  const config = Config.fromEnv();
  const container = createContainer(config);
  const app = createApp(config, container);

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
  debug("Unhandled errors in main(): %O", error);
  process.exit(1);
});
