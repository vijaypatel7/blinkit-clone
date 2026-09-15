/**
 * Response serialization helpers.
 *
 * We never return raw Mongoose documents to the client. Instead we run them
 * through a serializer so the payload contains ONLY what the UI needs (smaller
 * payload = less serialization + network + browser work).
 */

/** Convert a Mongoose doc to a plain object. */
export function toPlain(doc) {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
}

/** Serialize a single entity. */
export function serializeOne(doc, fn) {
  if (!doc) return null;
  return fn(toPlain(doc));
}

/** Serialize an array of entities. */
export function serializeMany(docs, fn) {
  return docs.map((doc) => fn(toPlain(doc)));
}
