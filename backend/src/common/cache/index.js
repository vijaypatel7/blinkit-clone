/**
 * Generic Redis cache helper with stampede protection.
 *
 * Under high concurrency, when a cache entry expires, hundreds of requests can
 * simultaneously miss and hammer MongoDB (a "cache stampede"). We prevent this
 * with a short lock: only one request recomputes the value, the rest wait.
 */
import { cacheClient } from '../../config/redis.js';
import { CACHE_LOCK_TTL } from '../../config/performance.js';
import { logger } from '../utils/logger.js';

/**
 * Get-or-compute pattern.
 * @param {string} key           cache key
 * @param {number} ttlSeconds    TTL for the cached value
 * @param {Function} compute     async function returning the value to cache
 */
export async function getOrSet(key, ttlSeconds, compute) {
  const cached = await cacheClient.get(key);
  if (cached != null) {
    return JSON.parse(cached);
  }
  return setWithLock(key, ttlSeconds, compute);
}

/**
 * Compute + set under a lock to prevent stampede.
 */
async function setWithLock(key, ttlSeconds, compute) {
  const lockKey = `lock:${key}`;
  const lockToken = `${process.pid}-${Date.now()}-${Math.random()}`;

  // Try to acquire the recompute lock.
  const acquired = await cacheClient.set(lockKey, lockToken, 'EX', CACHE_LOCK_TTL, 'NX');
  if (acquired === 'OK') {
    try {
      const value = await compute();
      if (value !== undefined && value !== null) {
        await cacheClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      }
      return value;
    } finally {
      // Release only if we still own the lock.
      const owner = await cacheClient.get(lockKey);
      if (owner === lockToken) await cacheClient.del(lockKey);
    }
  }

  // Someone else is recomputing — briefly wait then read the fresh value.
  await new Promise((r) => setTimeout(r, 60));
  const cached = await cacheClient.get(key);
  if (cached != null) return JSON.parse(cached);

  // Lock holder failed — fall through to a direct compute.
  const value = await compute();
  if (value !== undefined && value !== null) {
    await cacheClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }
  return value;
}

/** Invalidate one or more keys (accepts glob patterns via `keys`). */
export async function invalidate(keys) {
  const list = Array.isArray(keys) ? keys : [keys];
  for (const key of list) {
    if (key.includes('*')) {
      const matches = await cacheClient.keys(key);
      if (matches.length) await cacheClient.del(...matches);
    } else {
      await cacheClient.del(key);
    }
  }
  logger.debug({ keys: list }, 'cache invalidated');
}

/** Read a JSON value directly (no compute). */
export async function getCache(key) {
  const value = await cacheClient.get(key);
  return value == null ? null : JSON.parse(value);
}

/** Write a JSON value directly. */
export async function setCache(key, value, ttlSeconds) {
  await cacheClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}
