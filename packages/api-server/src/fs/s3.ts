import { injectable } from "inversify";
import { S3Client as AwsS3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { Config } from "../config.js";

export const PRESIGNED_URL_EXPIRES_IN_SECONDS = 3600; // 1 hr

@injectable()
export class S3Client {
  constructor(readonly client: AwsS3Client) {}

  public getObjectUrl(bucket: string, key: string, expiresIn?: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresIn ?? PRESIGNED_URL_EXPIRES_IN_SECONDS,
    });
  }
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
