import { z } from 'zod';

/**
 * Order validation schemas.
 */
export const listOrdersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
  status: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1).max(200).optional(),
});
