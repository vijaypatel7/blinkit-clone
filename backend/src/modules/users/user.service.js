import { NotFoundError } from '../../common/errors/AppError.js';
import { cacheKeys } from '../../cache/cacheKeys.js';
import { getOrSet, invalidate } from '../../common/cache/index.js';
import { userRepository } from './user.repository.js';
import { toProfileResponse, toUserResponse } from './user.mapper.js';
import { CACHE_TTL } from '../../config/performance.js';

/**
 * User service.
 */
export const userService = {
  async getProfile(userId) {
    const user = await getOrSet(cacheKeys.user(userId), CACHE_TTL.CATEGORY, () =>
      userRepository.findById(userId)
    );
    if (!user) throw new NotFoundError('User not found');
    return toProfileResponse(user);
  },

  async updateProfile(userId, data) {
    const user = await userRepository.update(userId, data);
    if (!user) throw new NotFoundError('User not found');
    await invalidate(cacheKeys.user(userId));
    return toProfileResponse(user);
  },
};
