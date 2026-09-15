import { AppError } from '../common/errors/AppError.js';
import { logger } from '../common/utils/logger.js';
import { env } from '../config/environment.js';

/**
 * Central error handler — the LAST middleware in the chain.
 *
 * Translates every thrown error into a consistent JSON envelope. Operational
 * errors (our own AppError subclasses) are returned with their status code;
 * unexpected errors are logged with full detail but masked from the client.
 */
export function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

export function errorHandler(err, req, res, _next) {
  // Mongoose validation / cast errors → 422/400.
  if (err.name === 'CastError') {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400, 'INVALID_ID');
  }
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    err = new AppError('Validation failed', 422, 'VALIDATION_ERROR', details);
  }
  if (err.code === 11000) {
    err = new AppError('Duplicate key violation', 409, 'DUPLICATE_KEY');
  }

  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  if (!isOperational) {
    logger.error({ err, reqId: req.id, path: req.originalUrl }, 'Unhandled error');
  } else if (statusCode >= 500) {
    logger.error({ err, reqId: req.id, path: req.originalUrl }, 'Operational error');
  }

  const body = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: isOperational ? err.message : 'Internal server error',
    },
  };

  if (err.details && !env.isProduction) body.error.details = err.details;
  if (err.retryAfter) res.set('Retry-After', String(err.retryAfter));

  res.status(statusCode).json(body);
}
