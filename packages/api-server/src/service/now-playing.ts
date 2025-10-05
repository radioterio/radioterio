import { inject, injectable } from "inversify";
import { ChannelTrack, ChannelTrackRepository } from "../repo/channel-track.js";
import { Channel, ChannelRepository, ChannelStatus } from "../repo/channel.js";

export interface NowPlaying {
  channel: Channel;
  track: ChannelTrack;
  position: number;
}

@injectable()
export class NowPlayingService {
  constructor(
    @inject(ChannelRepository) private readonly channelRepository: ChannelRepository,
    @inject(ChannelTrackRepository) private readonly channelTrackRepository: ChannelTrackRepository,
  ) {}

  async getNowPlaying(
    channelId: number,
    userId: number,
    timestamp: Date,
  ): Promise<NowPlaying | null> {
    const channel = await this.channelRepository.getChannel(channelId, userId);
    if (!channel) {
      return null;
    }

    const playlistPosition = await this.getPlaylistPosition(channel, userId, timestamp);
    if (!playlistPosition) {
      return null;
    }

    const track = await this.channelTrackRepository.getTrackAtPosition(
      playlistPosition,
      channelId,
      userId,
    );

    if (!track) {
      return null;
    }

    const position = playlistPosition - track.offset;

    return { position, track, channel };
  }

  private async getPlaylistPosition(channel: Channel, userId: number, timestamp: Date) {
    const lastTrack = await this.channelTrackRepository.getLastTrack(channel.id, userId);
    if (!lastTrack) {
      return null;
    }

    if (
      channel.status === ChannelStatus.Started &&
      channel.startedAt !== null &&
      channel.startedFromPosition !== null
    ) {
      const timestampMillis = timestamp.getTime();
      const startedAtMillis = channel.startedAt.getTime();
      const playlistDuration = lastTrack.offset + lastTrack.duration;
      const absolutePos = timestampMillis - startedAtMillis + channel.startedFromPosition;

      return absolutePos % playlistDuration;
    }

    if (channel.status === ChannelStatus.Paused && channel.startedFromPosition !== null) {
      return channel.startedFromPosition;
    }

    return null;
  }
}
