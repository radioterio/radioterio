import { injectable, inject } from "inversify";
import express from "express";

import { AppRequest, RouteHandler } from "../route-handler.js";
import { RedisPubSubService } from "../../redis/pubsub.js";
import { getConfig } from "../../app.js";

@injectable()
export class SubscribeEventRouteHandler extends RouteHandler<void> {
  constructor(@inject(RedisPubSubService) private readonly pubSubService: RedisPubSubService) {
    super();
  }

  async handle(req: AppRequest, res: express.Response<void>): Promise<void> {
    const userId = req.params.userId;

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

    // Send initial connection message
    res.write(`: connected\n\n`);

    const config = getConfig(req.app);
    const channel = `${config.redisPrefix}:events:user:${userId}`;

    // Set up message handler
    const messageHandler = (message: string) => {
      try {
        const eventData = JSON.parse(message);
        res.write(`event: ${eventData.event}\n`);
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      } catch (error) {
        // Ignore parse errors, but log them
        console.error("Error parsing event message:", error);
      }
    };

    // Subscribe to the channel using pubsub service
    const unsubscribe = await this.pubSubService.subscribe(channel, messageHandler);

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
      unsubscribe();
      res.end();
    });
  }
}

