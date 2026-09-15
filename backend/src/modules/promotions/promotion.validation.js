import { z } from 'zod';

/**
 * Promotion validation schemas.
 */
export const createPromotionSchema = z.object({
  title: z.string().trim().min(1).max(120),
  type: z.enum(['BANNER', 'CAROUSEL', 'OFFER', 'DEAL']),
  image: z.string().url().optional(),
  description: z.string().optional(),
  link: z.string().optional(),
  priority: z.number().int().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  zones: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
});

export const listPromotionsQuerySchema = z.object({
  zone: z.string().optional(),
});
