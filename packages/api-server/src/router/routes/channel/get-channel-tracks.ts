import express from "express";
import { inject, injectable } from "inversify";
import z from "zod";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { ChannelTrackRepository } from "../../../repo/channel-track.js";
import { S3Client } from "../../../fs/s3.js";
import { getConfig } from "../../../app.js";
import { getTrackPath } from "../../../fs/filepath-mapper.js";

const RouteParamsSchema = z.object({
  channelId: z.coerce.number().int(),
});

const QueryParamsSchema = z.object({
  offset: z.coerce
    .number({ message: "Should be a number" })
    .int({ message: "Should be an integer" })
    .nonnegative({ message: "Should be >= 0" })
    .default(0),
  limit: z.coerce
    .number({ message: "Should be a number" })
    .int({ message: "Should be an integer" })
    .nonnegative({ message: "Should be >= 0" })
    .max(100, { message: "Should be <= 100" })
    .default(100),
});

interface ChannelTrackOutput {
  readonly id: number;
  readonly filename: string;
  readonly extension: string;
  readonly title: string;
  readonly artist: string;
  readonly duration: number;
  readonly trackUrl: string;
}

@injectable()
export class GetChannelsTracksController extends AuthRouteHandler<readonly ChannelTrackOutput[]> {
  constructor(
    @inject(ChannelTrackRepository) private readonly channelTrackRepository: ChannelTrackRepository,
    @inject(S3Client) private readonly s3Client: S3Client,
  ) {
    super();
  }

  async handle(
    req: AppAuthRequest,
    res: express.Response<readonly ChannelTrackOutput[]>,
  ): Promise<void> {
    const { userId } = req.auth;
    const { channelId } = RouteParamsSchema.parse(req.params);
    const { limit, offset } = QueryParamsSchema.parse(req.query);

    const config = getConfig(req.app);
    const channelTracks = await this.channelTrackRepository.getTracks(
      channelId,
      userId,
      offset,
      limit,
    );

    res.json(
      await Promise.all(
        channelTracks.map(async (track) => ({
          id: track.id,
          filename: track.filename,
          extension: track.extension,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          trackUrl: await this.s3Client.getObjectUrl(config.awsS3Bucket, getTrackPath(track)),
        })),
      ),
    );
  }
}
