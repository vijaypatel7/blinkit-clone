import { NotFoundError } from '../../common/errors/AppError.js';
import { storeCache } from '../../cache/store.cache.js';
import { cacheKeys } from '../../cache/cacheKeys.js';
import { storeRepository } from './store.repository.js';
import { toStoreResponse } from './store.mapper.js';
import { zoneKey } from '../../common/utils/geo.js';
import { GEO } from '../../config/performance.js';

/**
 * Store service.
 *
 * Location-based store selection is expensive (geo queries), so we cache the
 * result per location zone.
 */
export const storeService = {
  async get(storeId) {
    const store = await storeCache.get(storeId, () => storeRepository.findById(storeId));
    if (!store) throw new NotFoundError('Store not found');
    return toStoreResponse(store);
  },

  /**
   * Resolve the nearest serviceable store for coordinates.
   * Result is cached per zone so repeated requests during a session are cheap.
   */
  async resolveNearest({ lat, lng, radius = GEO.defaultSearchRadiusMeters }) {
    const zone = zoneKey({ lat, lng, radius });
    const store = await storeCache.getNearest(zone, () =>
      storeRepository.findNearest([lng, lat], radius)
    );
    return toStoreResponse(store);
  },

  async listNearby({ lat, lng, radius = GEO.defaultSearchRadiusMeters }) {
    const stores = await storeRepository.findWithin([lng, lat], radius);
    return stores.map((s) => toStoreResponse(s, { distanceMeters: Math.round(s.distance) }));
  },

  /** Fallback store used when an address has no coordinates (e.g. manually added). */
  async getDefaultStore() {
    const stores = await storeRepository.findActive();
    return stores.length ? toStoreResponse(stores[0]) : null;
  },

  // ------------------------------------------------------------------
  // Admin
  // ------------------------------------------------------------------
  async create(data) {
    const { coordinates, ...rest } = data;
    const store = await storeRepository.create({
      ...rest,
      location: { type: 'Point', coordinates },
    });
    await storeCache.invalidate(store._id);
    return toStoreResponse(store);
  },

  async update(storeId, data) {
    const { coordinates, ...rest } = data;
    const payload = { ...rest };
    if (coordinates) payload.location = { type: 'Point', coordinates };
    const store = await storeRepository.update(storeId, payload);
    if (!store) throw new NotFoundError('Store not found');
    await storeCache.invalidate(storeId);
    return toStoreResponse(store);
  },
};
