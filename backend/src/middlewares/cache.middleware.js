import { getCache } from '../common/cache/index.js';
import { logger } from '../common/utils/logger.js';

/**
 * Optional HTTP-level response cache middleware.
 *
 * For endpoints with a stable response, this caches the final JSON under a key
 * derived from the URL (and optionally the authenticated user id). It is a
 * generic fallback; module services already cache at the data layer, which is
 * preferred because it is aware of TTLs and invalidation.
 */
export function httpCache({ ttlSeconds = 60, perUser = false, keyPrefix = 'http' } = {}) {
  return async (req, res, next) => {
    const userPart = perUser && req.user ? `:u${req.user.id}` : '';
    const key = `${keyPrefix}:${req.method}:${req.originalUrl}${userPart}`;

    try {
      const cached = await getCache(key);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }

      // Wrap res.json to store the response on the way out.
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // fire-and-forget write
          import('../common/cache/index.js').then(({ setCache }) =>
            setCache(key, body, ttlSeconds)
          );
        }
        return originalJson(body);
      };
      res.set('X-Cache', 'MISS');
      next();
    } catch (err) {
      logger.warn({ err }, 'httpCache error, skipping');
      next();
    }
  };
}
