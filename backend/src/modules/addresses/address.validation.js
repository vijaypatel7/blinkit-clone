import { z } from 'zod';

/**
 * Address validation schemas.
 */
export const createAddressSchema = z.object({
  type: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
  label: z.string().trim().max(60).optional(),
  name: z.string().trim().min(1).max(80),
  phone: z.string().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, 'Invalid phone number'),
  flat: z.string().trim().max(80).optional(),
  building: z.string().trim().max(80).optional(),
  street: z.string().trim().min(1).max(160),
  landmark: z.string().trim().max(120).optional(),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  // Optional [lng, lat]; when omitted the store is resolved via a default.
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();
