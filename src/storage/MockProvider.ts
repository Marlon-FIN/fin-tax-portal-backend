import { StorageProvider } from './StorageProvider';

/**
 * Mock storage for tests (CI/CD, unit tests).
 * Returns deterministic fake URLs without requiring MinIO or AWS.
 * STORAGE_PROVIDER=mock in vitest.config.ts
 */
export class MockProvider implements StorageProvider {
  async putObject(_key: string, _body: Buffer, _contentType: string): Promise<void> {
    // no-op
  }

  async getSignedDownloadUrl(key: string, ttlSeconds = 60): Promise<string> {
    return `https://mock-storage.local/fin-docs-dev/${key}?X-Amz-Expires=${ttlSeconds}&X-Amz-SignedHeaders=host&X-Amz-Signature=mocksig`;
  }

  async deleteObject(_key: string): Promise<void> {
    // no-op
  }
}
