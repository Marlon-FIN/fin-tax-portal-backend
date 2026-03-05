import rateLimit from 'express-rate-limit';

const max = parseInt(process.env.DOWNLOAD_RATE_LIMIT_MAX ?? '100', 10);

/**
 * Rate limit for document download endpoints.
 * Default: 100 signed-URL requests per 15 minutes per IP.
 * Configurable via DOWNLOAD_RATE_LIMIT_MAX env var (e.g. set to 2 in tests).
 */
export const downloadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TOO_MANY_REQUESTS' },
  statusCode: 429,
});
