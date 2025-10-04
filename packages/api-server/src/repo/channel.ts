import { inject, injectable } from "inversify";
import { KnexClient } from "../db/knex.js";

const tableName = "r_streams";

interface StreamRow {
  readonly sid: number;
  readonly uid: number;
  readonly name: string;
  readonly status: number; // 0, 1, 2
  readonly started: number; // timestamp
  readonly started_from: number; // position
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
  readonly startedAt: Date;
  readonly startedFromPosition: number;
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
  startedAt: new Date(row.started),
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
}
