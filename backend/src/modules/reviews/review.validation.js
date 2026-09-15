import { z } from 'zod';

/**
 * Review validation schemas.
 */
export const createReviewSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().max(1000).optional(),
  images: z.array(z.string().url()).optional(),
});

export const listReviewsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});
