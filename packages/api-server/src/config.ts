import { string } from "zod";
import { getEnvNumberValue, getEnvStringValue, getEnvValue } from "@radioterio/common/utils/config";

type EnvLike = { [key: string]: string | undefined };

export class Config {
  readonly build: string | null;
  readonly port: number;

  readonly databaseUrl: string;
  readonly databaseUsername: string | null;
  readonly databasePassword: string | null;
  readonly databaseClient: string;
  readonly databasePoolMin: number;
  readonly databasePoolMax: number;

  constructor(env: EnvLike) {
    this.build = getEnvValue(env, "BUILD", string().nullish().default(null));
    this.port = getEnvNumberValue(env, "PORT", 4001);

    this.databaseUrl = getEnvStringValue(env, "DATABASE_URL");
    this.databaseUsername = getEnvValue(
      env,
      "DATABASE_USERNAME",
      string().nullable().default(null),
    );
    this.databasePassword = getEnvValue(
      env,
      "DATABASE_PASSWORD",
      string().nullable().default(null),
    );
    this.databaseClient = getEnvStringValue(env, "DATABASE_CLIENT");
    this.databasePoolMin = getEnvNumberValue(env, "DATABASE_POOL_MIN", 0);
    this.databasePoolMax = getEnvNumberValue(env, "DATABASE_POOL_MAX", 10);
  }

  static fromEnv(): Config {
    return new Config(process.env);
  }
}
