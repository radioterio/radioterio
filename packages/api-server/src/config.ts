import { string } from "zod";
import { getEnvNumberValue, getEnvStringValue, getEnvValue } from "@radioterio/common/utils/config";

type EnvLike = { [key: string]: string | undefined };

export class Config {
  readonly build: string | null;
  readonly port: number;

  readonly databaseUrl: string;
  readonly databaseClient: string;
  readonly databasePoolMin: number;
  readonly databasePoolMax: number;

  constructor(env: EnvLike) {
    this.build = getEnvValue(env, "BUILD", string().nullish().default(null));
    this.port = getEnvNumberValue(env, "PORT", 4001);

    this.databaseUrl = getEnvStringValue(env, "DATABASE_URL");

    this.databaseClient = getEnvStringValue(env, "DATABASE_CLIENT");
    this.databasePoolMin = getEnvNumberValue(env, "DATABASE_POOL_MIN", 0);
    this.databasePoolMax = getEnvNumberValue(env, "DATABASE_POOL_MAX", 10);
  }

  static fromEnv(): Config {
    return new Config(process.env);
  }
}
