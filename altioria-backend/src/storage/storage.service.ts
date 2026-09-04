import {
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value === '') {
    throw new Error(`${name} is not specified`);
  }

  return value;
}

@Injectable()
export class StorageService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly bucket = requireEnv('S3_BUCKET');

  private readonly publicUrl = requireEnv('S3_PUBLIC_URL').replace(
    /\/+$/,
    '',
  );

  private readonly client = new S3Client({
    endpoint: requireEnv('S3_ENDPOINT'),
    region: process.env.S3_REGION ?? 'us-east-1',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: {
      accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY'),
    },
  });

  async onModuleInit(): Promise<void> {
    await this.client.send(
      new HeadBucketCommand({
        Bucket: this.bucket,
      }),
    );
  }

  onModuleDestroy(): void {
    this.client.destroy();
  }

  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}