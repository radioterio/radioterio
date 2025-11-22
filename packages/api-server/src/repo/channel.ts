import { inject, injectable } from "inversify";
import { KnexClient } from "../db/knex.js";

const TABLE_NAME = "r_streams";
const ROW_FIELDS = [
  "sid",
  "uid",
  "name",
  "cover",
  "cover_background",
  "status",
  "started_from",
  "started",
] as const;
type RowFields = (typeof ROW_FIELDS)[number];

interface StreamRow {
  readonly sid: number;
  readonly uid: number;
  readonly name: string;
  readonly status: number; // 0, 1, 2
  readonly started: number | null; // timestamp
  readonly started_from: number | null; // position
  readonly cover: string | null;
  readonly cover_background: string | null;
}

export enum ChannelStatus {
  Stopped = "Stopped", // 0
  Started = "Started", // 1
  Paused = "Paused", // 2
  Unknown = "Unknown", // ?
}

export interface Channel {
  readonly id: number;
  readonly title: string;
  readonly status: ChannelStatus;
  readonly startedAt: Date | null;
  readonly startedFromPosition: number | null;
  readonly coverFile: string | null;
  readonly coverBackgroundColor: string | null;
}

const mapStatus = (status: number) => {
  switch (status) {
    case 0:
      return ChannelStatus.Stopped;
    case 1:
      return ChannelStatus.Started;
    case 2:
      return ChannelStatus.Paused;
    default:
      return ChannelStatus.Unknown;
  }
};

const mapChannel = (row: Pick<StreamRow, RowFields>): Channel => ({
  id: row.sid,
  title: row.name,
  status: mapStatus(row.status),
  // when the stream started
  startedAt: row.started !== null ? new Date(row.started) : null,
  // milliseconds offset in the playlist
  startedFromPosition: row.started_from,
  coverFile: row.cover,
  coverBackgroundColor: row.cover_background,
});

@injectable()
export class ChannelRepository {
  constructor(@inject(KnexClient) private readonly knex: KnexClient) {}

  async getChannelsByUserId(userId: number): Promise<Channel[]> {
    const rows = await this.knex
      .client<StreamRow>(TABLE_NAME)
      .where("uid", userId)
      .select(...ROW_FIELDS);

    return rows.map(mapChannel);
  }

  async getChannel(channelId: number, userId: number): Promise<Channel | null> {
    const row = await this.knex
      .client<StreamRow>(TABLE_NAME)
      .where("sid", channelId)
      .where("uid", userId)
      .select(...ROW_FIELDS)
      .first();

    if (!row) {
      return null;
    }

    return mapChannel(row);
  }

  async getChannelCountByUserId(userId: number): Promise<number> {
    const result = await this.knex
      .client<StreamRow>(TABLE_NAME)
      .where("uid", userId)
      .count<{ count: number }>("sid as count")
      .first();

    return Number(result?.count ?? 0);
  }

  async stopChannel(channelId: number, userId: number): Promise<void> {
    await this.knex
      .client<StreamRow>(TABLE_NAME)
      .where("sid", channelId)
      .where("uid", userId)
      .update({
        status: 0, // Stopped
        started: null,
        started_from: null,
      });
  }
}
