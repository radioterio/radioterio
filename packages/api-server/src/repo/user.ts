import { inject, injectable } from "inversify";

import { KnexClient } from "../db/knex.js";

const tableName = "r_users";

interface UserRow {
  readonly uid: number;
  readonly mail: string;
  readonly login: string;
  readonly password: string;
  readonly is_enabled: boolean;
}

export interface User {
  readonly id: number;
  readonly email: string;
}

const mapUser = (row: UserRow): User => ({ id: row.uid, email: row.mail });

@injectable()
export class UserRepository {
  constructor(@inject(KnexClient) private readonly knex: KnexClient) {}

  async findOneById(userId: number): Promise<User | null> {
    const userRow = await this.knex
      .client<UserRow>(tableName)
      .where("uid", userId)
      .where("is_enabled", true)
      .select("uid", "mail", "login", "password", "is_enabled")
      .first();

    if (!userRow) {
      return null;
    }

    return mapUser(userRow);
  }
}
