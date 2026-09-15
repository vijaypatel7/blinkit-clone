import { sessionClient } from '../../config/redis.js';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError.js';
import { couponRepository } from './coupon.repository.js';
import { toCouponResponse } from './coupon.mapper.js';
import { COUPON_TYPES } from './coupon.constants.js';

/**
 * Coupon service.
 *
 * `apply` computes the discount amount for a given cart total. Per-user usage
 * is tracked in Redis (fast, atomic) and total usage in MongoDB.
 */
export const couponService = {
  /**
   * Validate a coupon and compute the discount for `orderTotalPaise`.
   * Returns { code, discountPaise } or null if not applicable.
   */
  async apply(code, userId, orderTotalPaise) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon || coupon.status !== 'ACTIVE') return null;

    const now = new Date();
    if (coupon.endsAt && coupon.endsAt < now) return null;
    if (coupon.startsAt && coupon.startsAt > now) return null;
    if (orderTotalPaise < coupon.minOrderValuePaise) return null;

    // Per-user usage limit (Redis, atomic).
    const userKey = `coupon:${coupon.code}:user:${userId}`;
    const userUses = Number(await sessionClient.get(userKey) || 0);
    if (userUses >= coupon.maxUsesPerUser) return null;

    // Compute discount.
    let discountPaise;
    if (coupon.type === COUPON_TYPES.PERCENTAGE) {
      discountPaise = Math.floor((orderTotalPaise * coupon.value) / 100);
    } else {
      discountPaise = coupon.value;
    }
    if (coupon.maxDiscountPaise != null) {
      discountPaise = Math.min(discountPaise, coupon.maxDiscountPaise);
    }
    discountPaise = Math.min(discountPaise, orderTotalPaise);

    return { code: coupon.code, discountPaise };
  },

  /** Record a successful coupon use (after order creation). */
  async consume(code, userId) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) return;
    await sessionClient.incr(`coupon:${coupon.code}:user:${userId}`);
    await couponRepository.consume(coupon._id);
  },

  async list() {
    const coupons = await couponRepository.listActive();
    return coupons.map(toCouponResponse);
  },

  // Admin
  async create(data) {
    const coupon = await couponRepository.create(data);
    return toCouponResponse(coupon);
  },

  async update(id, data) {
    const coupon = await couponRepository.update(id, data);
    if (!coupon) throw new NotFoundError('Coupon not found');
    return toCouponResponse(coupon);
  },
};
