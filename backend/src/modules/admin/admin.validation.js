import { z } from 'zod';

/**
 * Admin validation schemas.
 */
export const listAuditLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'CREATED',
    'PAYMENT_PENDING',
    'CONFIRMED',
    'PACKING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  note: z.string().max(200).optional(),
});
