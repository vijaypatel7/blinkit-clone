/**
 * Distance helpers for geo / store-selection logic.
 */

/**
 * Haversine distance between two lat/lng points, in meters.
 * Used when we need an exact distance without a DB geo query.
 */
export function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Format a location zone key used for cache keys, e.g. "zone:380001:cg-road". */
export function zoneKey({ lat, lng, radiusMeters = 5000 }) {
  // Bucket coordinates so nearby users share the same cache key.
  const latBucket = (Math.round(lat * 100) / 100).toFixed(2);
  const lngBucket = (Math.round(lng * 100) / 100).toFixed(2);
  const radiusBucket = Math.round(radiusMeters / 500) * 500;
  return `zone:${latBucket}:${lngBucket}:${radiusBucket}`;
}
