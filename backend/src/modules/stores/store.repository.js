import { Store, StoreZone } from './store.model.js';

/**
 * Store repository.
 */
export const storeRepository = {
  async findById(id) {
    return Store.findById(id);
  },

  async findActive() {
    return Store.find({ status: 'ACTIVE', isDeliveryEnabled: true });
  },

  /**
   * Find the nearest serviceable store to a point within a radius.
   * Uses MongoDB's 2dsphere `$geoNear` (index-backed, fast).
   */
  async findNearest([lng, lat], radiusMeters, { excludeStoreId } = {}) {
    const match = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusMeters,
        },
      },
      status: 'ACTIVE',
      isDeliveryEnabled: true,
    };
    if (excludeStoreId) match._id = { $ne: excludeStoreId };

    return Store.findOne(match);
  },

  /** Find all stores within a radius (sorted nearest first). */
  async findWithin([lng, lat], radiusMeters) {
    const stores = await Store.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          maxDistance: radiusMeters,
          spherical: true,
          query: { status: 'ACTIVE', isDeliveryEnabled: true },
        },
      },
      { $limit: 10 },
    ]);
    return stores;
  },

  async findZoneByPincode(storeId, pincode) {
    return StoreZone.findOne({ storeId, pincodes: pincode, status: 'ACTIVE' });
  },

  async create(data) {
    return Store.create(data);
  },

  async update(id, data) {
    return Store.findByIdAndUpdate(id, { $set: data }, { new: true });
  },
};
