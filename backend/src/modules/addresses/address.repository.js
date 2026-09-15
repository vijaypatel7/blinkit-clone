import { Address } from './address.model.js';

/**
 * Address repository.
 */
export const addressRepository = {
  async listByUser(userId) {
    return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  },

  async findById(id, userId) {
    return Address.findOne({ _id: id, userId });
  },

  async findDefault(userId) {
    return Address.findOne({ userId, isDefault: true });
  },

  async create(data) {
    return Address.create(data);
  },

  async update(id, userId, data) {
    return Address.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });
  },

  async remove(id, userId) {
    return Address.findOneAndDelete({ _id: id, userId });
  },

  /** Clear the default flag on every other address of this user. */
  async clearDefaults(userId, exceptId) {
    return Address.updateMany(
      { userId, isDefault: true, _id: { $ne: exceptId } },
      { $set: { isDefault: false } }
    );
  },
};
