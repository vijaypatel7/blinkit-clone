import { Coupon } from './coupon.model.js';

/**
 * Coupon repository.
 */
export const couponRepository = {
  async findByCode(code) {
    return Coupon.findOne({ code: code.toUpperCase() });
  },

  async listActive() {
    const now = new Date();
    return Coupon.find({
      status: 'ACTIVE',
      $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
    }).lean();
  },

  /** Atomically increment usage, failing if the limit is reached. */
  async consume(couponId) {
    return Coupon.findOneAndUpdate(
      {
        _id: couponId,
        $or: [{ maxTotalUses: null }, { $expr: { $lt: ['$usedCount', '$maxTotalUses'] } }],
      },
      { $inc: { usedCount: 1 } },
      { new: true }
    );
  },

  async create(data) {
    return Coupon.create(data);
  },

  async update(id, data) {
    return Coupon.findByIdAndUpdate(id, { $set: data }, { new: true });
  },
};
