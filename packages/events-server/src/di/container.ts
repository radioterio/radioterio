import { Container } from "inversify";

import { Config } from "../config.js";
import { RedisService, createRedisService } from "../redis/client.js";
import { RedisPubSubService } from "../redis/pubsub.js";

export function createContainer(config: Config) {
  const container = new Container();

  // Services
  container.bind(RedisService).toConstantValue(createRedisService(config));
  container.bind(RedisPubSubService).toSelf().inSingletonScope();

  return container;
}

