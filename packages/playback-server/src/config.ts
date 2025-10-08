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

  readonly apiServerUrl: string;

  constructor(env: EnvLike) {
    this.build = getEnvValue(env, "BUILD", string().nullish().default(null));
    this.port = getEnvNumberValue(env, "PORT", 4002);

    this.jwtSecret = getEnvValue(env, "JWT_SECRET", string().transform(toUintArray));

    this.apiServerUrl = getEnvStringValue(env, "API_SERVER_URL");
  }

  static fromEnv(): Config {
    return new Config(process.env);
  }
}
