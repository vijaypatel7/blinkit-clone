import { validate } from '../common/validators/index.js';

/**
 * Request validation middleware factory.
 *
 * Usage: `router.post('/', validateRequest({ body: productSchema }), handler)`.
 * Validates `body`, `query`, and `params` against Zod schemas and replaces the
 * request fields with the parsed (coerced) values.
 */
export function validateRequest(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = validate(schemas.body, req.body, { message: 'Invalid body' });
      if (schemas.query) req.query = validate(schemas.query, req.query, { message: 'Invalid query' });
      if (schemas.params) req.params = validate(schemas.params, req.params, { message: 'Invalid params' });
      next();
    } catch (err) {
      next(err);
    }
  };
}
