import { StorageProvider } from './StorageProvider';

/**
 * Prod storage: AWS S3 with SSE-KMS (AES-256 / 256-Bit at rest).
 * Bucket is private (Block Public Access). Access only via signed URLs (TTL 60-120s).
 *
 * TODO: Implement using @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner.
 *       Configure SSE-KMS via ServerSideEncryption: 'aws:kms' + SSEKMSKeyId.
 *       See: security/SECURITY_BASELINE_AWS.md
 */
export class S3Provider implements StorageProvider {
  async putObject(_key: string, _body: Buffer, _contentType: string): Promise<void> {
    throw new Error('S3Provider not implemented. Use MinioProvider in dev.');
  }

  async getSignedDownloadUrl(_key: string, _ttlSeconds = 60): Promise<string> {
    throw new Error('S3Provider not implemented. Use MinioProvider in dev.');
  }

  async deleteObject(_key: string): Promise<void> {
    throw new Error('S3Provider not implemented. Use MinioProvider in dev.');
  }
}
