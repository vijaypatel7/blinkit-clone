/**
 * Response/request helpers used across modules.
 */

/** Send a consistent success envelope. */
export function ok(res, data, meta = undefined, statusCode = 200) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

/** Send a created (201) envelope. */
export function created(res, data, meta = undefined) {
  return ok(res, data, meta, 201);
}

/**
 * Build a cursor-based pagination object.
 * `items` are the page results, `nextCursor` is the opaque cursor to request
 * the next page (null when there are no more results).
 */
export function paginated(items, { nextCursor, limit }) {
  return {
    items,
    nextCursor,
    hasMore: nextCursor != null,
    limit,
  };
}

/** Decode an opaque cursor (base64url JSON) into its parts. */
export function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Encode cursor parts into an opaque base64url token. */
export function encodeCursor(parts) {
  return Buffer.from(JSON.stringify(parts)).toString('base64url');
}
