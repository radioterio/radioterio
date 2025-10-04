import { injectable } from "inversify";
import knex from "knex";

import { Config } from "../config.js";

@injectable()
export class KnexClient {
  constructor(readonly client: knex.Knex) {}
}

export function createKnex(config: Config) {
  const knexConfig: knex.Knex.Config = {
    client: config.databaseClient,
    connection: config.databaseUrl,
    pool: {
      min: config.databasePoolMin,
      max: config.databasePoolMax,
    },
  };

  const client = knex(knexConfig);

  return new KnexClient(client);
}
