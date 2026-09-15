import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeCursor, decodeCursor } from '../../src/common/utils/response.js';
import { buildCursorFilter, buildNextCursor } from '../../src/common/pagination/index.js';

/**
 * Unit tests — cursor pagination.
 */
test('cursor round-trips through base64url', () => {
  const cursor = encodeCursor({ createdAt: '2026-08-31T10:00:00.000Z', _id: 'abc123' });
  const decoded = decodeCursor(cursor);
  assert.deepEqual(decoded, { createdAt: '2026-08-31T10:00:00.000Z', _id: 'abc123' });
});

test('buildCursorFilter produces a bounded "older than" filter (desc)', () => {
  const cursor = encodeCursor({ createdAt: '2026-08-31T10:00:00.000Z', _id: 'abc123' });
  const filter = buildCursorFilter(cursor, 'desc');
  assert.ok(filter.$or, 'should use $or for the createdAt+_id tiebreak');
  assert.equal(filter.$or[0].createdAt.$lt instanceof Date, true);
});

test('buildNextCursor returns null for an empty page', () => {
  assert.equal(buildNextCursor([]), null);
});

test('buildNextCursor encodes the last item', () => {
  const items = [{ _id: 'x1', createdAt: new Date('2026-08-31T10:00:00Z') }];
  const next = buildNextCursor(items);
  assert.ok(next);
  assert.equal(decodeCursor(next)._id, 'x1');
});

test('decodeCursor returns null for garbage input', () => {
  assert.equal(decodeCursor('not-valid'), null);
  assert.equal(decodeCursor(null), null);
});
