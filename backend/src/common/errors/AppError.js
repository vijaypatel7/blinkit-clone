/**
 * Application error hierarchy.
 *
 * A single `AppError` (with subclasses) is thrown throughout services and
 * translated to a consistent JSON envelope by the error middleware.
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // expected errors we can safely expose
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

/** Wraps an unexpected error so it can be logged but not exposed to clients. */
export class InternalError extends AppError {
  constructor(message = 'Internal server error', cause) {
    super(message, 500, 'INTERNAL_ERROR');
    this.cause = cause;
    this.isOperational = false;
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable, please retry') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

export class InsufficientStockError extends AppError {
  constructor(message = 'Insufficient stock', details) {
    super(message, 409, 'INSUFFICIENT_STOCK', details);
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message = 'Payment required', details) {
    super(message, 402, 'PAYMENT_REQUIRED', details);
  }
}
