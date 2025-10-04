import { injectable } from "inversify";
import { S3Client as AwsS3Client } from "@aws-sdk/client-s3";

import { Config } from "../config.js";

@injectable()
export class S3Client {
  constructor(readonly client: AwsS3Client) {}
}

export function createS3Client(config: Config) {
  const client = new AwsS3Client([
    {
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    },
  ]);

  return new S3Client(client);
}
