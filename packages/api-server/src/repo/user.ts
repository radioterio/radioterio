import { inject, injectable } from "inversify";

import { KnexClient } from "../db/knex.js";

const TABLE_NAME = "r_users";
const ROW_FIELDS = ["uid", "mail", "login", "password", "is_enabled", "avatar"] as const;
type RowFields = (typeof ROW_FIELDS)[number];

interface UserRow {
  readonly uid: number;
  readonly mail: string;
  readonly login: string;
  readonly password: string;
  readonly avatar: string | null;
  readonly is_enabled: boolean;
}

export interface User {
  readonly id: number;
  readonly email: string;
  readonly avatarFile: string | null;
  readonly passwordHash: string;
}

const mapUser = (row: Pick<UserRow, RowFields>): User => ({
  id: row.uid,
  email: row.mail,
  passwordHash: row.password,
  avatarFile: row.avatar,
});

@injectable()
export class UserRepository {
  constructor(@inject(KnexClient) private readonly knex: KnexClient) {}

  async findOneById(userId: number): Promise<User | null> {
    const userRow = await this.knex
      .client<UserRow>(TABLE_NAME)
      .where("uid", userId)
      .where("is_enabled", true)
      .select(...ROW_FIELDS)
      .first();

    if (!userRow) {
      return null;
    }

    return mapUser(userRow);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const userRow = await this.knex
      .client<UserRow>(TABLE_NAME)
      .where("mail", email)
      .where("is_enabled", true)
      .select(...ROW_FIELDS)
      .first();

    if (!userRow) {
      return null;
    }

    return mapUser(userRow);
  }
}
