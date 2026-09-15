import { Promotion } from './promotion.model.js';

/**
 * Promotion repository.
 */
export const promotionRepository = {
  async findById(id) {
    return Promotion.findById(id);
  },

  /** Active promotions (optionally filtered to a zone). */
  async listActive({ zone, limit = 20 } = {}) {
    const now = new Date();
    const query = {
      status: 'ACTIVE',
      $or: [
        { startsAt: null, endsAt: null },
        { startsAt: { $lte: now }, endsAt: { $gte: now } },
        { startsAt: { $lte: now }, endsAt: null },
        { startsAt: null, endsAt: { $gte: now } },
      ],
    };
    if (zone) query.$or.push({ zones: { $size: 0 } }, { zones: zone });
    return Promotion.find(query).sort({ priority: -1 }).limit(limit).lean();
  },

  async listBanners({ zone } = {}) {
    return this.listActive({ zone, limit: 10 }).then((items) =>
      items.filter((p) => p.type === 'BANNER')
    );
  },

  async create(data) {
    return Promotion.create(data);
  },

  async update(id, data) {
    return Promotion.findByIdAndUpdate(id, { $set: data }, { new: true });
  },
};
