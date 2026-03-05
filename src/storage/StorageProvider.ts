/**
 * Storage abstraction — swappable between Dev (MinIO) and Prod (AWS S3).
 * Prod: S3 SSE-KMS (AES-256 / 256-Bit at rest) — see security/SECURITY_BASELINE_AWS.md
 */
export interface StorageProvider {
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Returns a pre-signed download URL valid for ttlSeconds (default: 60). */
  getSignedDownloadUrl(key: string, ttlSeconds?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}
