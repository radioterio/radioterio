import { Container } from "inversify";

import { Config } from "../config.js";
import { RedisService, createRedisService } from "../redis/client.js";

export function createContainer(config: Config) {
  const container = new Container();

  // Services
  container.bind(RedisService).toConstantValue(createRedisService(config));

  return container;
}

