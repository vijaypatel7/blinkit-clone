import { Redis } from 'ioredis';
import { env } from './environment.js';
import { logger } from '../common/utils/logger.js';

const isTest = env.nodeEnv === 'test';

/**
 * Redis connection factory.
 *
 * In test mode, connections are lazy so importing the application
 * does not create persistent Redis sockets.
 */
const createClient = (db) =>
  new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    db,
    maxRetriesPerRequest: db === env.redis.dbQueue ? null : 3,
    enableReadyCheck: true,

    // Tests should not establish Redis connections automatically.
    lazyConnect: isTest,

    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

export const cacheClient = createClient(env.redis.dbCache);
export const queueClient = createClient(env.redis.dbQueue);
export const sessionClient = createClient(env.redis.dbSession);

cacheClient.on('error', (err) => logger.error({ err }, 'Redis (cache) error'));
queueClient.on('error', (err) => logger.error({ err }, 'Redis (queue) error'));
sessionClient.on('error', (err) => logger.error({ err }, 'Redis (session) error'));

export async function connectRedis() {
  await Promise.all([
    cacheClient.connect(),
    queueClient.connect(),
    sessionClient.connect(),
  ]);
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