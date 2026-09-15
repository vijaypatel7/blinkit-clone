import { Delivery, DeliveryTracking, DeliveryPartner } from './delivery.model.js';

/**
 * Delivery repository.
 */
export const deliveryRepository = {
  async findById(deliveryId) {
    return Delivery.findById(deliveryId);
  },

  async findByOrder(orderId) {
    return Delivery.findOne({ orderId });
  },

  async create(data) {
    return Delivery.create(data);
  },

  async update(deliveryId, data) {
    return Delivery.findByIdAndUpdate(deliveryId, { $set: data }, { new: true });
  },

  /** Find the nearest online delivery partner (2dsphere geo query). */
  async findNearestPartner([lng, lat], radiusMeters = 8000) {
    const partner = await DeliveryPartner.findOne({
      isOnline: true,
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusMeters,
        },
      },
    });
    return partner;
  },

  async appendTrackingPoint({ deliveryId, coordinates }) {
    return DeliveryTracking.create({
      deliveryId,
      location: { type: 'Point', coordinates },
    });
  },

  async listTracking(deliveryId, { limit = 50 } = {}) {
    return DeliveryTracking.find({ deliveryId })
      .sort({ recordedAt: -1 })
      .limit(limit)
      .lean();
  },
};
