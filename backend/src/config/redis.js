import { Redis } from 'ioredis';
import { env } from './environment.js';
import { logger } from '../common/utils/logger.js';

/**
 * Redis connection factory.
 *
 * We maintain SEPARATE logical Redis databases for:
 *   - cache     (high-frequency reads, evictable)
 *   - queue     (BullMQ jobs)
 *   - session   (user sessions / OTPs / rate-limit counters)
 *
 * Using distinct DB numbers keeps an aggressive cache eviction from ever
 * displacing queue or auth data.
 */
const createClient = (db) =>
  new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    db,
    maxRetriesPerRequest: db === env.redis.dbQueue ? null : 3,
    enableReadyCheck: true,
    lazyConnect: false,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

/** Cache client — safe for `GET/SET/EXPIRE` and eviction. */
export const cacheClient = createClient(env.redis.dbCache);

/** Queue client — used by BullMQ (must have maxRetriesPerRequest = null). */
export const queueClient = createClient(env.redis.dbQueue);

/** Session client — OTPs, sessions, rate-limit counters. */
export const sessionClient = createClient(env.redis.dbSession);

cacheClient.on('error', (err) => logger.error({ err }, 'Redis (cache) error'));
queueClient.on('error', (err) => logger.error({ err }, 'Redis (queue) error'));
sessionClient.on('error', (err) => logger.error({ err }, 'Redis (session) error'));

export async function connectRedis() {
  await Promise.all([
    cacheClient.ping(),
    queueClient.ping(),
    sessionClient.ping(),
  ]);
  logger.info('Redis connected (cache / queue / session)');
}

export async function disconnectRedis() {
  await Promise.all([
    cacheClient.quit(),
    queueClient.quit(),
    sessionClient.quit(),
  ]);
}
