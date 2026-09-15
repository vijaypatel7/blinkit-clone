import pino from 'pino';
import { env } from '../../config/environment.js';

/**
 * Application logger.
 *
 * We use pino (fast, structured JSON logging) instead of console.log so logs
 * are machine-parseable and cheap enough to leave on in production.
 */
export const logger = pino({
  level: env.logLevel,
  base: { service: 'blinkit-backend' },
  redact: ['req.headers.authorization', 'password', 'token', 'otp'],
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: env.isProduction
    ? undefined
    : { target: 'pino-pretty', options: { colorize: true } },
});

/** Log a request-scoped child logger (attach request id if present). */
export function childLogger(bindings) {
  return logger.child(bindings);
}
