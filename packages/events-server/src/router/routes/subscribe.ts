import { injectable, inject } from "inversify";
import express from "express";

import { AppRequest, RouteHandler } from "../route-handler.js";
import { RedisService } from "../../redis/client.js";
import { getConfig } from "../../app.js";

@injectable()
export class SubscribeEventRouteHandler extends RouteHandler<void> {
  constructor(@inject(RedisService) private readonly redisService: RedisService) {
    super();
  }

  async handle(req: AppRequest, res: express.Response<void>): Promise<void> {
    const userId = req.params.userId;
    if (!userId || typeof userId !== "string") {
      res.status(400).end();
      return;
    }

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

    // Send initial connection message
    res.write(`: connected\n\n`);

    const config = getConfig(req.app);
    const channel = `${config.redisPrefix}:events:user:${userId}`;
    const subscriber = this.redisService.getSubscriber();

    // Subscribe to the channel
    await subscriber.subscribe(channel);

    // Set up message handler
    const messageHandler = (ch: string, message: string) => {
      if (ch === channel) {
        try {
          const eventData = JSON.parse(message);
          res.write(`event: ${eventData.event}\n`);
          res.write(`data: ${JSON.stringify(eventData)}\n\n`);
        } catch (error) {
          // Ignore parse errors, but log them
          console.error("Error parsing event message:", error);
        }
      }
    };

    subscriber.on("message", messageHandler);

    // Keep connection alive with periodic ping
    const pingInterval = setInterval(() => {
      if (!res.writableEnded) {
        res.write(`: ping\n\n`);
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Send ping every 30 seconds

    // Handle client disconnect
    req.on("close", () => {
      clearInterval(pingInterval);
      subscriber.removeListener("message", messageHandler);
      subscriber.unsubscribe(channel).catch((err: unknown) => {
        console.error("Error unsubscribing from channel:", err);
      });
      res.end();
    });
  }
}

