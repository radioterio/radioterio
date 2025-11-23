import makeDebug from "debug";

import { Config } from "./config.js";
import { createApp } from "./app.js";
import { createContainer } from "./di/container.js";
import { RedisPubSubService } from "./redis/pubsub.js";
import { RedisService } from "./redis/client.js";

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

  // Graceful shutdown handler
  const shutdown = async (signal: string) => {
    debug(`Received ${signal}, starting graceful shutdown...`);

    try {
      // Get services from container
      const pubSubService = container.get(RedisPubSubService);
      const redisService = container.get(RedisService);

      // Send 'end' message to all subscribers
      debug("Sending 'end' message to all subscribers...");
      await pubSubService.sendEndToAllSubscribers();

      // Wait a bit for messages to be sent
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Clean up subscriptions
      debug("Cleaning up subscriptions...");
      await pubSubService.cleanup();

      // Close server
      debug("Closing server...");
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Disconnect Redis
      debug("Disconnecting Redis...");
      await redisService.disconnect();

      debug("Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      debug("Error during graceful shutdown: %O", error);
      process.exit(1);
    }
  };

  // Register shutdown handlers
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return server;
}

