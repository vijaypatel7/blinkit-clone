/**
 * Cursor-based pagination engine.
 *
 * We intentionally AVOID `skip(n)` on large collections — skip becomes
 * linearly more expensive as the offset grows. Instead we page using an opaque
 * cursor built from `createdAt + _id`, which keeps queries O(log n) via indexes.
 */
import { decodeCursor, encodeCursor } from '../utils/response.js';

/**
 * Build a Mongo filter for the "next page" given a cursor.
 * Cursor format: { createdAt: ISOString, _id: hexString }.
 *
 * For a descending `createdAt` sort, the next page is all docs strictly older
 * than the cursor (or same timestamp but smaller _id).
 */
export function buildCursorFilter(cursor, sortDirection = 'desc') {
  const decoded = decodeCursor(cursor);
  if (!decoded || !decoded.createdAt || !decoded._id) return {};

  const createdAt = new Date(decoded.createdAt);
  if (Number.isNaN(createdAt.getTime())) return {};

  if (sortDirection === 'desc') {
    return {
      $or: [
        { createdAt: { $lt: createdAt } },
        { createdAt, _id: { $lt: decoded._id } },
      ],
    };
  }
  return {
    $or: [
      { createdAt: { $gt: createdAt } },
      { createdAt, _id: { $gt: decoded._id } },
    ],
  };
}

/** Build the next cursor from the last item in a page. */
export function buildNextCursor(items, sortDirection = 'desc') {
  if (!items || items.length === 0) return null;
  const last = items[items.length - 1];
  return encodeCursor({
    createdAt: last.createdAt instanceof Date
      ? last.createdAt.toISOString()
      : last.createdAt,
    _id: String(last._id),
  });
}

/** Convenience: run a repository query page and return { items, nextCursor }. */
export async function paginateWithCursor({
  query = {},
  sortDirection = 'desc',
  sortField = 'createdAt',
  limit = 20,
  cursor,
  runQuery, // async (filter, sort, limitPlusOne) => items
}) {
  const filter = { ...query, ...buildCursorFilter(cursor, sortDirection) };
  const dir = sortDirection === 'desc' ? -1 : 1;

  // Fetch one extra item so we know whether another page exists.
  const items = await runQuery(filter, { [sortField]: dir }, limit + 1);
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;

  return {
    items: page,
    nextCursor: hasMore ? buildNextCursor(page, sortDirection) : null,
    hasMore,
  };
}
