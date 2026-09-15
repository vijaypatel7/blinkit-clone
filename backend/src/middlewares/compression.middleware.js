import compression from 'compression';

/**
 * Response compression.
 *
 * Gzip/br compression is applied to JSON responses above a size threshold,
 * which measurably reduces bandwidth on large listing payloads. Compression is
 * CPU work, so we keep the threshold low enough to skip tiny responses (where
 * compressing costs more than it saves).
 */
export const compressionMiddleware = compression({
  threshold: 1024, // compress only responses > 1KB
  filter: (req, res) => {
    // Never compress already-compressed/streaming content.
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
});
