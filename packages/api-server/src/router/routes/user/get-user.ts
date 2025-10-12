import express from "express";
import { inject, injectable } from "inversify";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { UserRepository } from "../../../repo/user.js";
import { ChannelRepository } from "../../../repo/channel.js";
import { TrackRepository } from "../../../repo/track.js";
import { ErrorKind } from "../../../error/error-kind.js";
import { ok } from "../../../error/assert.js";
import { S3Client } from "../../../fs/s3.js";
import { getAvatarPath } from "../../../fs/filepath-mapper.js";
import { getConfig } from "../../../app.js";

interface UserStatsOutput {
  readonly channelCount: number;
  readonly trackCount: number;
}

interface UserOutput {
  readonly id: number;
  readonly email: string;
  readonly avatarFileUrl: string | null;
  readonly stats: UserStatsOutput;
}

@injectable()
export class GetUserController extends AuthRouteHandler<UserOutput> {
  constructor(
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(ChannelRepository) private readonly channelRepository: ChannelRepository,
    @inject(TrackRepository) private readonly trackRepository: TrackRepository,
    @inject(S3Client) private readonly s3Client: S3Client,
  ) {
    super();
  }

  async handle(req: AppAuthRequest, res: express.Response<UserOutput>): Promise<void> {
    const [user, channelCount, trackCount] = await Promise.all([
      this.userRepository.findOneById(req.auth.userId),
      this.channelRepository.getChannelCountByUserId(req.auth.userId),
      this.trackRepository.getTrackCountByUserId(req.auth.userId),
    ]);
    ok(user, ErrorKind.UserNotFound);

    const config = getConfig(req.app);

    res.json({
      id: user.id,
      email: user.email,
      avatarFileUrl: await this.s3Client.getObjectUrl(config.awsS3Bucket, getAvatarPath(user)),
      stats: { channelCount, trackCount },
    });
  }
}
