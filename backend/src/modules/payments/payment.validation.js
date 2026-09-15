import { z } from 'zod';

/**
 * Payment validation schemas.
 */
export const initiatePaymentSchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(['COD', 'ONLINE']),
});

/**
 * Razorpay payment verification — sent by the frontend after the Razorpay
 * checkout modal reports a successful payment.
 */
export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
