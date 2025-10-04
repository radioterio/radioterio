import { string } from "zod";
import { getEnvNumberValue, getEnvStringValue, getEnvValue } from "@radioterio/common/utils/config";

type EnvLike = { [key: string]: string | undefined };

const toUintArray = (str: string) => new TextEncoder().encode(str);

export class Config {
  // Misc
  readonly build: string | null;
  readonly port: number;

  // Auth
  readonly jwtSecret: Uint8Array;

  // Db
  readonly databaseUrl: string;
  readonly databaseClient: string;
  readonly databasePoolMin: number;
  readonly databasePoolMax: number;

  // AWS
  readonly awsAccessKeyId: string;
  readonly awsSecretAccessKey: string;
  readonly awsS3Bucket: string;

  constructor(env: EnvLike) {
    this.build = getEnvValue(env, "BUILD", string().nullish().default(null));
    this.port = getEnvNumberValue(env, "PORT", 4001);

    this.jwtSecret = getEnvValue(env, "JWT_SECRET", string().transform(toUintArray));

    this.databaseUrl = getEnvStringValue(env, "DATABASE_URL");
    this.databaseClient = getEnvStringValue(env, "DATABASE_CLIENT");
    this.databasePoolMin = getEnvNumberValue(env, "DATABASE_POOL_MIN", 0);
    this.databasePoolMax = getEnvNumberValue(env, "DATABASE_POOL_MAX", 10);

    this.awsAccessKeyId = getEnvStringValue(env, "AWS_ACCESS_KEY_ID");
    this.awsSecretAccessKey = getEnvStringValue(env, "AWS_SECRET_ACCESS_KEY");
    this.awsS3Bucket = getEnvStringValue(env, "AWS_S3_BUCKET");
  }

  static fromEnv(): Config {
    return new Config(process.env);
  }
}
