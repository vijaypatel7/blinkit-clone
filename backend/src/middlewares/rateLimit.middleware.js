import { sessionClient } from '../config/redis.js';
import { env } from '../config/environment.js';
import { TooManyRequestsError } from '../common/errors/AppError.js';

/**
 * Sliding-window rate limiter backed by Redis.
 *
 * Uses a sorted set of timestamps per (IP + route). Redis gives us atomic
 * increments so the limiter is correct across multiple app instances — a
 * requirement when running several Node.js processes for 10k concurrent users.
 */
export function rateLimit({
  windowSeconds = env.rateLimit.windowSeconds,
  maxRequests = env.rateLimit.maxRequests,
  keyPrefix = 'rl',
} = {}) {
  return async (req, _res, next) => {
    try {
      const identifier = req.user?.id || req.ip || 'anonymous';
      const route = req.baseUrl + (req.route?.path || req.path);
      const key = `${keyPrefix}:${identifier}:${route}`;
      const now = Date.now();
      const windowStart = now - windowSeconds * 1000;

      // Atomic: drop old entries and add current request.
      const pipeline = sessionClient.multi();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      pipeline.zcard(key);
      pipeline.expire(key, windowSeconds);
      const results = await pipeline.exec();

      const count = results?.[2]?.[1] ?? 0;
      if (count > maxRequests) {
        const retryAfter = windowSeconds;
        const err = new TooManyRequestsError('Rate limit exceeded');
        err.retryAfter = retryAfter;
        return next(err);
      }

      // Expose limit info as response headers.
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - count)));
      next();
    } catch (err) {
      // Fail open if Redis is briefly unavailable (don't block traffic).
      next();
    }
  };
}
