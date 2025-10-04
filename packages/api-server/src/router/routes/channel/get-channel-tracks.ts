import express from "express";
import { inject, injectable } from "inversify";
import z from "zod";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { ChannelTrack, ChannelTrackRepository } from "../../../repo/channel-track.js";

const RouteParamsSchema = z.object({
  channelId: z.coerce.number().int(),
});

@injectable()
export class GetChannelsTracksController extends AuthRouteHandler<readonly ChannelTrack[]> {
  constructor(
    @inject(ChannelTrackRepository) private readonly channelTrackRepository: ChannelTrackRepository,
  ) {
    super();
  }

  async handle(req: AppAuthRequest, res: express.Response<readonly ChannelTrack[]>): Promise<void> {
    const { channelId } = RouteParamsSchema.parse(req.params);

    const channels = await this.channelTrackRepository.getTracksByChannelIdAndUserId(
      channelId,
      req.auth.userId,
    );

    res.json(channels);
  }
}
