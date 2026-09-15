/**
 * Request-body validation helper built on Zod.
 *
 * Modules define a Zod schema in their `*.validation.js` and pass it here so
 * every validation failure becomes a uniform 422 ValidationError.
 */
import { ZodError } from 'zod';
import { ValidationError } from '../errors/AppError.js';

/**
 * Parse `input` against a Zod schema and throw a ValidationError on failure.
 * @param {import('zod').ZodTypeAny} schema
 * @param {unknown} input
 * @param {object} [opts]
 */
export function validate(schema, input, opts = {}) {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  const details = formatZodIssues(result.error);
  throw new ValidationError(opts.message || 'Validation failed', details);
}

/** Parse `input` against a schema, returning { ok, data?, errors? } instead of throwing. */
export function safeValidate(schema, input) {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, errors: formatZodIssues(result.error) };
}

function formatZodIssues(error) {
  const issues = error instanceof ZodError ? error.issues : [];
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}
