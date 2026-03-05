import { StorageProvider } from './StorageProvider';
import { MinioProvider } from './MinioProvider';
import { S3Provider } from './S3Provider';
import { MockProvider } from './MockProvider';

function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? 'minio';
  switch (provider) {
    case 's3':
      return new S3Provider();
    case 'mock':
      return new MockProvider();
    case 'minio':
    default:
      return new MinioProvider();
  }
}

export const storage = createStorageProvider();
