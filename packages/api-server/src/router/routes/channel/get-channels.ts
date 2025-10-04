import express from "express";
import { inject, injectable } from "inversify";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { Channel, ChannelRepository } from "../../../repo/channel.js";

@injectable()
export class GetChannelsController extends AuthRouteHandler<readonly Channel[]> {
  constructor(@inject(ChannelRepository) private readonly channelRepository: ChannelRepository) {
    super();
  }

  async handle(req: AppAuthRequest, res: express.Response<readonly Channel[]>): Promise<void> {
    const channels = await this.channelRepository.getChannelsByUserId(req.auth.userId);

    res.json(channels);
  }
}
