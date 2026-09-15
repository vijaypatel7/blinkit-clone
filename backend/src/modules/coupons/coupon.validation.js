import { z } from 'zod';

/**
 * Coupon validation schemas.
 */
export const createCouponSchema = z.object({
  code: z.string().trim().min(3).max(30),
  type: z.enum(['PERCENTAGE', 'FLAT']),
  value: z.number().positive(),
  minOrderValuePaise: z.number().nonnegative().optional(),
  maxDiscountPaise: z.number().positive().optional(),
  maxUsesPerUser: z.number().int().positive().optional(),
  maxTotalUses: z.number().int().positive().optional(),
  endsAt: z.string().datetime().optional(),
});

export const applyCouponSchema = z.object({
  code: z.string().trim().min(3).max(30),
});
