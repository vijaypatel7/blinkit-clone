import mongoose from 'mongoose';
import { env } from './environment.js';
import { logger } from '../common/utils/logger.js';

/**
 * MongoDB connection manager.
 *
 * IMPORTANT: the connection pool is created ONCE when the app boots and reused
 * for the lifetime of the process. We never create a connection per request —
 * that would exhaust file descriptors and tank p99 latency under load.
 *
 * Pool size should be sized from load tests, not blindly set high. MongoDB's
 * default is 100; we default lower and expose it via env.
 */
export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  // Apply query middleware to protect against unbounded reads (safety net).
  applyQuerySafeguards();

  const options = {
    maxPoolSize: env.mongodb.poolSize,
    minPoolSize: env.mongodb.minPoolSize,
    maxIdleTimeMS: env.mongodb.maxIdleTimeMs,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    autoIndex: env.isProduction === false, // index in migrations in prod
  };

  try {
    await mongoose.connect(env.mongodb.uri, options);
    logger.info({ poolSize: env.mongodb.poolSize }, 'MongoDB connected');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
    throw err;
  }

  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB error'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

/**
 * Defensive guard: log a warning if a query is built without a limit on a
 * collection that is expected to be large. This is a safety net — developers
 * should still write bounded queries explicitly.
 */
function applyQuerySafeguards() {
  const UNBOUNDED_WARNING_SIZE = 1000;
  const originalExec = mongoose.Query.prototype.exec;

  mongoose.Query.prototype.exec = function execWithGuard(...args) {
    const query = this;

    // Only warn for find-type operations missing an explicit limit.
    if (
      query.op === 'find' &&
      query.options.limit == null &&
      typeof query._warnedUnbounded === 'undefined'
    ) {
      query._warnedUnbounded = true;
      logger.warn(
        { collection: query.model?.collection?.name },
        'Find query executed without .limit() — prefer bounded/cursor-paginated queries'
      );
    }

    // Attach a metadata hint for future instrumentation.
    void UNBOUNDED_WARNING_SIZE;
    return originalExec.apply(query, args);
  };
}
