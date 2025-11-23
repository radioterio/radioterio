import express from "express";
import { inject, injectable } from "inversify";
import z from "zod";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { ChannelRepository, ChannelStatus } from "../../../repo/channel.js";
import { ChannelTrackRepository } from "../../../repo/channel-track.js";
import { ErrorKind } from "../../../error/error-kind.js";
import { ok } from "../../../error/assert.js";
import { S3Client } from "../../../fs/s3.js";
import { getConfig } from "../../../app.js";
import { getCoverPath } from "../../../fs/filepath-mapper.js";

const RouteParamsSchema = z.object({
  channelId: z.coerce.number().int(),
});

interface ChannelOutput {
  readonly id: number;
  readonly title: string;
  readonly status: ChannelStatus;
  readonly coverFileUrl: string | null;
  readonly coverBackgroundColor: string | null;
  readonly totalTrackCount: number;
}

@injectable()
export class GetChannelController extends AuthRouteHandler<ChannelOutput> {
  constructor(
    @inject(ChannelRepository) private readonly channelRepository: ChannelRepository,
    @inject(ChannelTrackRepository) private readonly channelTrackRepository: ChannelTrackRepository,
    @inject(S3Client) private readonly s3Client: S3Client,
  ) {
    super();
  }

  async handle(req: AppAuthRequest, res: express.Response<ChannelOutput>): Promise<void> {
    const { userId } = req.auth;
    const { channelId } = RouteParamsSchema.parse(req.params);

    const config = getConfig(req.app);

    const [channel, totalTrackCount] = await Promise.all([
      this.channelRepository.getChannel(channelId, userId),
      this.channelTrackRepository.getTrackCount(channelId, userId),
    ]);

    ok(channel, ErrorKind.ChannelNotFound);

    res.json({
      id: channel.id,
      title: channel.title,
      status: channel.status,
      coverFileUrl: await this.s3Client.getObjectUrl(config.awsS3Bucket, getCoverPath(channel)),
      coverBackgroundColor: channel.coverBackgroundColor,
      totalTrackCount,
    });
  }
}
