import { Container } from "inversify";

import { Config } from "../config.js";
import { createKnex, KnexClient } from "../db/knex.js";

export function createContainer(config: Config) {
  const container = new Container();

  container.bind(KnexClient).toConstantValue(createKnex(config));

  return container;
}
