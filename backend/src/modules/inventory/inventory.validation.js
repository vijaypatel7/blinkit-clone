import { z } from 'zod';

/**
 * Inventory validation schemas.
 */
export const checkAvailabilitySchema = z.object({
  storeId: z.string().min(1),
  productId: z.string().min(1),
});

export const reserveSchema = z.object({
  storeId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  referenceId: z.string().optional(),
});

export const restockSchema = z.object({
  storeId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});
