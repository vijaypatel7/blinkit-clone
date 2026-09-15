import { User } from './user.model.js';

/**
 * User repository.
 */
export const userRepository = {
  async findById(id) {
    return User.findById(id);
  },

  async findByPhone(phone) {
    return User.findOne({ phone });
  },

  async findByEmail(email) {
    return User.findOne({ email });
  },

  async create(data) {
    return User.create(data);
  },

  async update(id, data) {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  },
};
