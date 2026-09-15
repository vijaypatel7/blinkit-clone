import { z } from 'zod';

/**
 * Zod schemas for auth endpoints.
 */
/** Indian mobile: 10 digits starting 6–9, optional +91 prefix. */
const phoneSchema = z
  .string()
  .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

export const sendOtpSchema = z.object({
  phone: phoneSchema,
  purpose: z.enum(['login', 'verify']).default('login'),
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().regex(/^\d{4,8}$/, 'OTP must be 4-8 digits'),
  purpose: z.enum(['login', 'verify']).default('login'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10),
});
