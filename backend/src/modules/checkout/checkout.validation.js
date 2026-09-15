import { z } from 'zod';

/**
 * Checkout validation schemas.
 */
export const checkoutRequestSchema = z.object({
  addressId: z.string().min(1),
  // COD = cash on delivery, ONLINE = pay via Razorpay (UPI / card / netbanking).
  paymentMethod: z.enum(['COD', 'ONLINE']),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
  // Items may be supplied directly (guest cart held on the client). Prices are
  // re-fetched server-side, so only productId + quantity are accepted here.
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) }))
    .max(100)
    .optional(),
});

/** Quote/pricing preview request. */
export const quoteRequestSchema = z.object({
  addressId: z.string().min(1),
  couponCode: z.string().optional(),
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) }))
    .max(100)
    .optional(),
});
