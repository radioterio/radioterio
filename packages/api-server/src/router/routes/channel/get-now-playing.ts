import z from "zod";
import express from "express";
import { inject, injectable } from "inversify";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { ChannelRepository, ChannelStatus } from "../../../repo/channel.js";
import { ErrorKind } from "../../../error/error-kind.js";
import { ok } from "../../../error/assert.js";
import { ChannelTrackRepository } from "../../../repo/channel-track.js";
import { S3Client } from "../../../fs/s3.js";
import { getTrackPath } from "../../../fs/filepath-mapper.js";
import { getConfig } from "../../../app.js";
import { NowPlayingService } from "../../../service/now-playing.js";

const RouteParamsSchema = z.object({
  channelId: z.coerce.number().int(),
  timestamp: z.coerce.number().transform((ts) => new Date(ts)),
});

interface NowPlayingChannel {
  readonly title: string;
  readonly status: ChannelStatus;
}

interface NowPlayingTrack {
  readonly filename: string;
  readonly title: string;
  readonly artist: string;
  readonly duration: number;
  readonly trackUrl: string;
}

interface NowPlaying {
  readonly channel: NowPlayingChannel;
  readonly track: NowPlayingTrack;
  readonly position: number;
}

@injectable()
export class GetNowPlayingController extends AuthRouteHandler<NowPlaying> {
  constructor(
    @inject(ChannelRepository) private readonly channelRepository: ChannelRepository,
    @inject(ChannelTrackRepository) private readonly channelTrackRepository: ChannelTrackRepository,
    @inject(NowPlayingService) private readonly nowPlayingService: NowPlayingService,
    @inject(S3Client) private readonly s3Client: S3Client,
  ) {
    super();
  }

  async handle(req: AppAuthRequest, res: express.Response<NowPlaying>): Promise<void> {
    const { channelId, timestamp } = RouteParamsSchema.parse(req.params);
    const { userId } = req.auth;

    const nowPlaying = await this.nowPlayingService.getNowPlaying(channelId, userId, timestamp);
    ok(nowPlaying, ErrorKind.ChannelNotPlaying);
    const config = getConfig(req.app);

    res.json({
      channel: {
        title: nowPlaying.channel.title,
        status: nowPlaying.channel.status,
      },
      track: {
        filename: nowPlaying.track.filename,
        title: nowPlaying.track.title,
        artist: nowPlaying.track.artist,
        duration: nowPlaying.track.duration,
        trackUrl: await this.s3Client.getObjectUrl(
          config.awsS3Bucket,
          getTrackPath(nowPlaying.track),
        ),
      },
      position: nowPlaying.position,
    });
  }
}
