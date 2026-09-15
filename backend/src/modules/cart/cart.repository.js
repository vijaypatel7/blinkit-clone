import { Cart } from './cart.model.js';

/**
 * Cart repository (durable MongoDB copy).
 */
export const cartRepository = {
  async findByUser(userId) {
    return Cart.findOne({ userId });
  },

  async upsert(userId, { storeId, items }) {
    return Cart.findOneAndUpdate(
      { userId },
      { $set: { storeId, items, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
  },

  async clear(userId) {
    return Cart.updateOne({ userId }, { $set: { items: [], storeId: null } });
  },
};
