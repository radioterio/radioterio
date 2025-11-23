import express from "express";
import { inject, injectable } from "inversify";
import z from "zod";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { ChannelRepository } from "../../../repo/channel.js";
import { ErrorKind } from "../../../error/error-kind.js";
import { ok } from "../../../error/assert.js";
import { StatusCodes } from "http-status-codes";

const RouteParamsSchema = z.object({
  channelId: z.coerce.number().int(),
});

@injectable()
export class StopChannelController extends AuthRouteHandler<void> {
  constructor(@inject(ChannelRepository) private readonly channelRepository: ChannelRepository) {
    super();
  }

  async handle(req: AppAuthRequest, res: express.Response<void>): Promise<void> {
    const { userId } = req.auth;
    const { channelId } = RouteParamsSchema.parse(req.params);

    const channel = await this.channelRepository.getChannel(channelId, userId);
    ok(channel, ErrorKind.ChannelNotFound);

    await this.channelRepository.stopChannel(channelId, userId);

    res.status(StatusCodes.NO_CONTENT).send();
  }
}
