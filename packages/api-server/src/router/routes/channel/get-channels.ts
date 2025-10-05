import express from "express";
import { inject, injectable } from "inversify";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { ChannelRepository, ChannelStatus } from "../../../repo/channel.js";
import { S3Client } from "../../../fs/s3.js";
import { getConfig } from "../../../app.js";
import { getCoverPath } from "../../../fs/filepath-mapper.js";

interface ChannelOutput {
  readonly id: number;
  readonly title: string;
  readonly status: ChannelStatus;
  readonly coverFileUrl: string | null;
  readonly coverBackgroundColor: string | null;
}

@injectable()
export class GetChannelsController extends AuthRouteHandler<readonly ChannelOutput[]> {
  constructor(
    @inject(ChannelRepository) private readonly channelRepository: ChannelRepository,
    @inject(S3Client) private readonly s3Client: S3Client,
  ) {
    super();
  }

  async handle(
    req: AppAuthRequest,
    res: express.Response<readonly ChannelOutput[]>,
  ): Promise<void> {
    const config = getConfig(req.app);

    const channels = await this.channelRepository.getChannelsByUserId(req.auth.userId);
    const channelsOutput = await Promise.all(
      channels.map(async (channel) => ({
        id: channel.id,
        title: channel.title,
        status: channel.status,
        coverFileUrl: await this.s3Client.getObjectUrl(config.awsS3Bucket, getCoverPath(channel)),
        coverBackgroundColor: channel.coverBackgroundColor,
      })),
    );

    res.json(channelsOutput);
  }
}
