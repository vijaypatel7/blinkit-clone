import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { UnauthorizedError, ForbiddenError } from '../common/errors/AppError.js';
import { ROLES } from '../common/constants/index.js';

/**
 * Authentication middleware.
 *
 * Verifies the JWT (access token) from the Authorization header and attaches
 * the decoded user to `req.user`. It does NOT hit the database per request —
 * the token itself carries the identity, keeping the auth path fast.
 */
export function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing bearer token');
    }

    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, env.auth.jwtSecret);

    req.user = {
      id: payload.sub,
      role: payload.role,
      phone: payload.phone,
      sessionId: payload.sid,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    next(err);
  }
}

/** Require one or more roles. Usage: `authorize(ROLES.ADMIN)`. */
export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError('Not authenticated'));
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}
