import express from "express";
import { Config } from "./config.js";
import makeDebug from "debug";
import * as process from "node:process";
import { setupRoutes } from "./routes.js";

const debug = makeDebug("app:main");

export async function main() {
  const config = Config.fromEnv();
  const app = express();

  setupRoutes(app, config);

  const { port } = config;

  app.listen(port, (err) => {
    if (err) {
      debug("Failed to start server: %s", err.message);
      process.exit(1);
    }

    debug("Server successfully started on port %d", port);
  });

  // TODO: Graceful shutdown
}
