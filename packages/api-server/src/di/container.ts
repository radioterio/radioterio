import { Container } from "inversify";

import { Config } from "../config.js";
import { createKnex, KnexClient } from "../db/knex.js";
import { UserRepository } from "../repo/user.js";
import { ChannelRepository } from "../repo/channel.js";
import { ChannelTrackRepository } from "../repo/channel-track.js";
import { createS3Client, S3Client } from "../fs/s3.js";

export function createContainer(config: Config) {
  const container = new Container();

  container.bind(KnexClient).toConstantValue(createKnex(config));
  container.bind(S3Client).toConstantValue(createS3Client(config));

  // Repo
  container.bind(UserRepository).toSelf().inSingletonScope();
  container.bind(ChannelRepository).toSelf().inSingletonScope();
  container.bind(ChannelTrackRepository).toSelf().inSingletonScope();

  return container;
}
