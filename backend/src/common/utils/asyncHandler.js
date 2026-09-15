/**
 * Async error wrapper — lets controllers/services use async/await without
 * repeating try/catch, while ensuring rejected promises reach the error handler.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Retry an async function with exponential backoff.
 * Used for idempotent external calls (e.g. payment gateway).
 */
export async function retry(fn, { retries = 3, baseDelayMs = 200, shouldRetry = () => true } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries || !shouldRetry(err)) throw err;
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt));
    }
  }
  throw lastError;
}
