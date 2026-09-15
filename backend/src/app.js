import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/environment.js';
import { logger } from './common/utils/logger.js';
import { registerRoutes } from './routes/index.js';
import { compressionMiddleware } from './middlewares/compression.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

/**
 * Express application factory.
 *
 * We separate app construction (this file) from bootstrapping (server.js) so
 * tests can import the app and run it with supertest without binding a port.
 */
export function createApp() {
  const app = express();

  // Disable the default header and set a realistic trust proxy for rate limiting.
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // ------------------------------------------------------------------
  // Global middleware (order matters)
  // ------------------------------------------------------------------

  // Structured HTTP request logging (fast, JSON).
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
      customLogLevel: (req, res) =>
        res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      autoLogging: { ignore: (req) => req.url === '/health' },
    })
  );

  // Security headers.
  app.use(helmet());

  // CORS — restricted to configured origins.
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  // JSON body parsing with a sane size limit (prevents abuse).
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Response compression.
  app.use(compressionMiddleware);

  // Health check (no auth, no rate limit).
  app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  // Register all /api/v1 routes.
  registerRoutes(app);

  // 404 + error handling (must be last).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
