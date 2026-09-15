/**
 * Store mappers.
 */
export function toStoreResponse(store, extra = {}) {
  if (!store) return null;
  const s = store.toObject ? store.toObject() : store;
  return {
    id: s._id,
    name: s.name,
    code: s.code,
    address: s.address,
    status: s.status,
    timings: s.timings,
    isDeliveryEnabled: s.isDeliveryEnabled,
    deliveryRadiusMeters: s.deliveryRadiusMeters,
    minOrderValue: s.minOrderValue,
    rating: s.rating,
    ...extra,
  };
}
