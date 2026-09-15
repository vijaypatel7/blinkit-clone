import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * E2E tests — HTTP layer (run with supertest + a real/test DB in CI).
 *
 * These document the critical request paths and can be executed with:
 *   NODE_ENV=test node --test tests/e2e
 */
import { createApp } from '../../src/app.js';

test('GET /health returns ok (no DB required)', async () => {
  const app = createApp();
  const res = await fetchTest(app, '/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('unknown route returns a structured 404', async () => {
  const app = createApp();
  const res = await fetchTest(app, '/does-not-exist');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});

/**
 * Minimal in-process HTTP helper (avoids needing supertest to be installed for
 * the health/404 contract checks).
 */
async function fetchTest(app, path) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      const port = server.address().port;
      try {
        const res = await fetch(`http://127.0.0.1:${port}${path}`);
        const body = await res.json().catch(() => null);
        resolve({ status: res.status, body });
      } catch (err) {
        reject(err);
      } finally {
        server.close();
      }
    });
  });
}
