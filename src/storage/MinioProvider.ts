import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from './StorageProvider';

/**
 * Dev storage: MinIO (S3-compatible, runs via docker-compose).
 * Simulates the same S3 access pattern as Prod (private bucket + signed URLs).
 * Prod equivalent: S3Provider with SSE-KMS (AES-256).
 */
export class MinioProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'fin_dev',
        secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'fin_dev_secret_change_me',
      },
      forcePathStyle: true,
    });
    this.bucket = process.env.STORAGE_BUCKET ?? 'fin-docs-dev';
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }),
    );
  }

  async getSignedDownloadUrl(key: string, ttlSeconds = 60): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: ttlSeconds },
    );
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
