import crypto from 'node:crypto';
import { createApp } from './app.js';
import { env, assertRequiredConfig } from './config/environment.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { logger } from './common/utils/logger.js';
import { startWorkers, stopWorkers } from './workers/index.js';

/**
 * Application entry point.
 *
 * Boot order:
 *   1. validate config
 *   2. connect MongoDB (connection pool created once)
 *   3. connect Redis
 *   4. start queue workers
 *   5. start HTTP server
 */
async function bootstrap() {
  assertRequiredConfig();

  await connectDatabase();
  await connectRedis();
  await startWorkers();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info({ port: env.port, env: env.nodeEnv }, 'API server listening');
  });

  // Graceful shutdown: stop accepting connections, drain, then close resources.
  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down');
    server.close(async () => {
      try {
        await stopWorkers();
        await disconnectRedis();
        await disconnectDatabase();
        logger.info('Shutdown complete');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
    });

    // Force-exit if we can't drain within 15s.
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 15000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

// Only auto-start when run directly (not when imported by tests).
const isMain = process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href;
if (isMain) {
  bootstrap().catch((err) => {
    logger.error({ err }, 'Failed to bootstrap');
    process.exit(1);
  });
}
