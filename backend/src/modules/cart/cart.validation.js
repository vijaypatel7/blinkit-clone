import { z } from 'zod';

/**
 * Cart validation schemas.
 */
export const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
  storeId: z.string().min(1).optional(),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});
