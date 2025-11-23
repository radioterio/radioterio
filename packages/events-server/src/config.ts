import { string } from "zod";
import { getEnvNumberValue, getEnvStringValue, getEnvValue } from "@radioterio/common/utils/config";

type EnvLike = { [key: string]: string | undefined };

export class Config {
  // Misc
  readonly build: string | null;
  readonly port: number;

  // Redis
  readonly redisHost: string;
  readonly redisPort: number;
  readonly redisPrefix: string;

  constructor(env: EnvLike) {
    this.build = getEnvValue(env, "BUILD", string().nullish().default(null));
    this.port = getEnvNumberValue(env, "PORT", 4003);

    this.redisHost = getEnvStringValue(env, "REDIS_HOST", "localhost");
    this.redisPort = getEnvNumberValue(env, "REDIS_PORT", 6379);
    this.redisPrefix = getEnvStringValue(env, "REDIS_PREFIX", "radioterio");
  }

  static fromEnv(): Config {
    return new Config(process.env);
  }
}

