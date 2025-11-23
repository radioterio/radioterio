import { injectable, inject } from "inversify";
import { StatusCodes } from "http-status-codes";
import express from "express";
import z from "zod";

import { AppRequest, RouteHandler } from "../route-handler.js";
import { RedisService } from "../../redis/client.js";
import { getConfig } from "../../app.js";

interface RequestBody {
  event: string;
  data: unknown;
}

interface ResponseBody {
  success: boolean;
}

const RequestBodySchema = z.object({
  event: z.string().min(1),
  data: z.unknown(),
});

@injectable()
export class PublishEventRouteHandler extends RouteHandler<ResponseBody> {
  constructor(@inject(RedisService) private readonly redisService: RedisService) {
    super();
  }

  async handle(req: AppRequest, res: express.Response<ResponseBody>): Promise<void> {
    const userId = req.params.userId;
    if (!userId || typeof userId !== "string") {
      res.status(StatusCodes.BAD_REQUEST).json({ success: false });
      return;
    }

    const bodyResult = RequestBodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ success: false });
      return;
    }

    const { event, data } = bodyResult.data;

    const config = getConfig(req.app);
    const channel = `${config.redisPrefix}:events:user:${userId}`;
    const message = JSON.stringify({ event, data, userId, timestamp: Date.now() });

    await this.redisService.getPublisher().publish(channel, message);

    res.status(StatusCodes.OK).json({ success: true });
  }
}

