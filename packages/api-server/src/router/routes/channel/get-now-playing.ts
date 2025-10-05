import z from "zod";
import express from "express";
import { inject, injectable } from "inversify";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { Channel, ChannelRepository, ChannelStatus } from "../../../repo/channel.js";
import { ErrorKind } from "../../../error/error-kind.js";
import { ok } from "../../../error/assert.js";
import { ChannelTrack, ChannelTrackRepository } from "../../../repo/channel-track.js";
import { AppError } from "../../../error/app-error.js";
import { S3Client } from "../../../fs/s3.js";
import { getTrackPath } from "../../../fs/filepath-mapper.js";
import { getConfig } from "../../../app.js";

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
    @inject(S3Client) private readonly s3Client: S3Client,
  ) {
    super();
  }

  async handle(req: AppAuthRequest, res: express.Response<NowPlaying>): Promise<void> {
    const { channelId, timestamp } = RouteParamsSchema.parse(req.params);
    const { userId } = req.auth;

    const [channel, lastTrack] = await Promise.all([
      this.channelRepository.getChannel(channelId, userId),
      this.channelTrackRepository.getLastTrack(channelId, userId),
    ]);
    ok(channel, ErrorKind.ChannelNotFound);
    ok(lastTrack, ErrorKind.ChannelNotPlaying, "Missing last track");

    let playlistPos;

    if (channel.status === ChannelStatus.Started) {
      ok(channel.startedAt, ErrorKind.ChannelNotPlaying, "Missing channel start time");
      ok(
        channel.startedFromPosition !== null,
        ErrorKind.ChannelNotPlaying,
        "Missing channel start position",
      );

      const timestampMillis = timestamp.getTime();
      const startedAtMillis = channel.startedAt.getTime();
      const playlistDuration = lastTrack.offset + lastTrack.duration;
      const absolutePos = timestampMillis - startedAtMillis + channel.startedFromPosition;

      playlistPos = absolutePos % playlistDuration;
    } else if (channel.status === ChannelStatus.Paused) {
      ok(
        channel.startedFromPosition !== null,
        ErrorKind.ChannelNotPlaying,
        "Missing channel start position",
      );

      playlistPos = channel.startedFromPosition;
    } else {
      throw AppError.fromErrorKind(ErrorKind.ChannelNotPlaying);
    }

    const currentTrack = await this.channelTrackRepository.getTrackAtPosition(
      playlistPos,
      channelId,
      userId,
    );
    ok(currentTrack, ErrorKind.ChannelNotPlaying, "Missing current track");

    const trackPosition = playlistPos - currentTrack.offset;
    const config = getConfig(req.app);

    res.json({
      channel: { title: channel.title, status: channel.status },
      track: {
        filename: currentTrack.filename,
        title: currentTrack.title,
        artist: currentTrack.artist,
        duration: currentTrack.duration,
        trackUrl: await this.s3Client.getObjectUrl(config.awsS3Bucket, getTrackPath(currentTrack)),
      },
      position: trackPosition,
    });
  }
}
