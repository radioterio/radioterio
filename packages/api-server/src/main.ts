import makeDebug from "debug";

import { Config } from "./config.js";
import { createApp } from "./app.js";
import { createContainer } from "./di/container.js";

const debug = makeDebug("app:main");

export async function main() {
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
