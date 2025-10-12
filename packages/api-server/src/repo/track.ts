import { inject, injectable } from "inversify";
import { KnexClient } from "../db/knex.js";

const TABLE_NAME = "r_tracks";
const ROW_FIELDS = ["tid", "uid", "filename"] as const;
type RowFields = (typeof ROW_FIELDS)[number];

interface TrackRow {
  readonly tid: number;
  readonly uid: number;
  readonly filename: string;
}

export interface Track {
  readonly id: number;
  readonly filename: string;
}

const mapTrack = (row: Pick<TrackRow, RowFields>): Track => ({
  id: row.tid,
  filename: row.filename,
});

@injectable()
export class TrackRepository {
  constructor(@inject(KnexClient) private readonly knex: KnexClient) {}

  async getTrack(trackId: number, userId: number): Promise<Track | null> {
    const row = await this.knex
      .client<TrackRow>(TABLE_NAME)
      .where("tid", trackId)
      .where("uid", userId)
      .select(...ROW_FIELDS)
      .first();

    if (!row) {
      return null;
    }

    return mapTrack(row);
  }

  async getTrackCountByUserId(userId: number): Promise<number> {
    const result = await this.knex
      .client<TrackRow>(TABLE_NAME)
      .where("uid", userId)
      .count<{ count: number }>("tid as count")
      .first();

    return Number(result?.count ?? 0);
  }
}
