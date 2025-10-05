import { inject, injectable } from "inversify";
import { KnexClient } from "../db/knex.js";

const tableName = "r_streams";

interface StreamRow {
  readonly sid: number;
  readonly uid: number;
  readonly name: string;
  readonly status: number; // 0, 1, 2
  readonly started: number | null; // timestamp
  readonly started_from: number | null; // position
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

const mapChannel = (row: StreamRow): Channel => ({
  id: row.sid,
  title: row.name,
  status: mapStatus(row.status),
  // when the stream started
  startedAt: row.started !== null ? new Date(row.started) : null,
  // milliseconds offset in the playlist
  startedFromPosition: row.started_from,
});

@injectable()
export class ChannelRepository {
  constructor(@inject(KnexClient) private readonly knex: KnexClient) {}

  async getChannelsByUserId(userId: number): Promise<Channel[]> {
    const rows = await this.knex
      .client<StreamRow>(tableName)
      .where("uid", userId)
      .select("sid", "uid", "name", "status", "started_from", "started");

    return rows.map(mapChannel);
  }

  async getChannel(channelId: number, userId: number): Promise<Channel | null> {
    const row = await this.knex
      .client<StreamRow>(tableName)
      .where("sid", channelId)
      .where("uid", userId)
      .select("sid", "uid", "name", "status", "started_from", "started")
      .first();

    if (!row) {
      return null;
    }

    return mapChannel(row);
  }
}
