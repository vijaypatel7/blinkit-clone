import { getOrSet } from '../../common/cache/index.js';
import { cacheKeys } from '../../cache/cacheKeys.js';
import { CACHE_TTL } from '../../config/performance.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import { promotionRepository } from './promotion.repository.js';
import { toPromotionResponse } from './promotion.mapper.js';

/**
 * Promotion service.
 *
 * Promotions are cached with a short TTL so banner/offer changes propagate
 * quickly, but high home-page traffic doesn't hit MongoDB.
 */
export const promotionService = {
  async listActive({ zone } = {}) {
    const key = zone ? `zone:${zone}` : 'all';
    const items = await getOrSet(
      cacheKeys.activePromotions(),
      CACHE_TTL.PROMOTION,
      () => promotionRepository.listActive({ zone })
    );
    return items.map(toPromotionResponse);
  },

  async listBanners({ zone } = {}) {
    return getOrSet(cacheKeys.banners(zone || 'all'), CACHE_TTL.PROMOTION, async () => {
      const banners = await promotionRepository.listBanners({ zone });
      return banners.map(toPromotionResponse);
    });
  },

  async get(promotionId) {
    return getOrSet(cacheKeys.promotion(promotionId), CACHE_TTL.PROMOTION, () =>
      promotionRepository.findById(promotionId)
    ).then(toPromotionResponse);
  },

  // Admin
  async create(data) {
    const promo = await promotionRepository.create(data);
    return toPromotionResponse(promo);
  },

  async update(id, data) {
    const promo = await promotionRepository.update(id, data);
    if (!promo) throw new NotFoundError('Promotion not found');
    return toPromotionResponse(promo);
  },
};
