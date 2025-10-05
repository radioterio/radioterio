import express from "express";
import { inject, injectable } from "inversify";
import z from "zod";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { ChannelTrack, ChannelTrackRepository } from "../../../repo/channel-track.js";
import { S3Client } from "../../../fs/s3.js";
import { getConfig } from "../../../app.js";
import { getTrackPath } from "../../../fs/filepath-mapper.js";

const RouteParamsSchema = z.object({
  channelId: z.coerce.number().int(),
});

interface ChannelTrackWithUrl extends ChannelTrack {
  readonly trackUrl: string;
}

@injectable()
export class GetChannelsTracksController extends AuthRouteHandler<readonly ChannelTrackWithUrl[]> {
  constructor(
    @inject(ChannelTrackRepository) private readonly channelTrackRepository: ChannelTrackRepository,
    @inject(S3Client) private readonly s3Client: S3Client,
  ) {
    super();
  }

  async handle(
    req: AppAuthRequest,
    res: express.Response<readonly ChannelTrackWithUrl[]>,
  ): Promise<void> {
    const { channelId } = RouteParamsSchema.parse(req.params);

    const config = getConfig(req.app);
    const channelTracks = await this.channelTrackRepository.getTracksByChannelIdAndUserId(
      channelId,
      req.auth.userId,
    );

    res.json(
      await Promise.all(
        channelTracks.map(async (track) => ({
          ...track,
          trackUrl: await this.s3Client.getObjectUrl(config.awsS3Bucket, getTrackPath(track)),
        })),
      ),
    );
  }
}
