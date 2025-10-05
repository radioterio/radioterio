import { inject, injectable } from "inversify";
import { KnexClient } from "../db/knex.js";

const linksTableName = "r_link";
const tracksTableName = "r_tracks";

interface TrackRow {
  readonly tid: number;
  readonly filename: string;
  readonly ext: string;
  readonly hash: string;
  readonly artist: string;
  readonly title: string;
  readonly duration: number;
}

interface LinkRow {
  readonly id: number;
  readonly stream_id: number;
  readonly track_id: number;
  readonly t_order: number;
  readonly time_offset: number;
}

export interface ChannelTrack {
  readonly id: number;
  readonly filename: string;
  readonly hash: string;
  readonly extension: string;
  readonly title: string;
  readonly artist: string;
  readonly duration: number;
  readonly offset: number;
}

const FIELDS = [
  "tid",
  "filename",
  "ext",
  "hash",
  "artist",
  "title",
  "duration",
  "time_offset",
] as const;
type Fields = (typeof FIELDS)[number];

const mapChannelTrack = (row: Pick<TrackRow & LinkRow, Fields>) => ({
  id: row.tid,
  filename: row.filename,
  extension: row.ext,
  title: row.title,
  artist: row.artist,
  duration: row.duration,
  offset: row.time_offset,
  hash: row.hash,
});

@injectable()
export class ChannelTrackRepository {
  constructor(@inject(KnexClient) private readonly knex: KnexClient) {}

  async getTracks(
    channelId: number,
    userId: number,
    offset: number,
    limit: number,
  ): Promise<ChannelTrack[]> {
    const rows = await this.knex
      .client<TrackRow>(tracksTableName)
      .join<LinkRow>(linksTableName, `track_id`, `tid`)
      .where("uid", userId)
      .where("stream_id", channelId)
      .orderBy("t_order", "asc")
      .offset(offset)
      .limit(limit)
      .select(...FIELDS);

    return rows.map(mapChannelTrack);
  }

  async getLastTrack(channelId: number, userId: number): Promise<ChannelTrack | null> {
    const row = await this.knex
      .client<TrackRow>(tracksTableName)
      .join<LinkRow>(linksTableName, `track_id`, `tid`)
      .where("uid", userId)
      .where("stream_id", channelId)
      .orderBy("t_order", "desc")
      .select(...FIELDS)
      .first();

    if (!row) {
      return null;
    }

    return mapChannelTrack(row);
  }

  async getTrackAtPosition(
    position: number,
    channelId: number,
    userId: number,
  ): Promise<ChannelTrack | null> {
    const row = await this.knex
      .client<TrackRow>(tracksTableName)
      .join<LinkRow>(linksTableName, `track_id`, `tid`)
      .where("uid", userId)
      .where("stream_id", channelId)
      .where("time_offset", "<=", position)
      .orderBy("t_order", "desc")
      .select(...FIELDS)
      .first();

    if (!row) {
      return null;
    }

    return mapChannelTrack(row);
  }
}
