import { Redis } from "ioredis";
import { injectable } from "inversify";

import { Config } from "../config.js";

export const RedisClient = Symbol("RedisClient");
export const RedisSubscriber = Symbol("RedisSubscriber");

@injectable()
export class RedisService {
  private publisher: Redis;
  private subscriber: Redis;

  constructor(config: Config) {
    const redisOptions = {
      host: config.redisHost,
      port: config.redisPort,
    };

    this.publisher = new Redis(redisOptions);
    this.subscriber = new Redis(redisOptions);
  }

  getPublisher(): Redis {
    return this.publisher;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async disconnect(): Promise<void> {
    await Promise.all([this.publisher.quit(), this.subscriber.quit()]);
  }
}

export function createRedisService(config: Config): RedisService {
  return new RedisService(config);
}

