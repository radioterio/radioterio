import { getEnvStringValue } from "@radioterio/common/utils/config";

type EnvLike = { [key: string]: string | undefined };

// Plain object type for client components (serializable)
export interface ConfigData {
  readonly apiServerUrl: string;
  readonly playbackServerUrl: string;
}

export class Config {
  readonly apiServerUrl: string;
  readonly playbackServerUrl: string;

  constructor(env: EnvLike) {
    this.apiServerUrl = getEnvStringValue(env, "API_SERVER_URL");
    this.playbackServerUrl = getEnvStringValue(env, "PLAYBACK_SERVER_URL");
  }

  static fromEnv(): Config {
    return new Config(process.env);
  }
}

