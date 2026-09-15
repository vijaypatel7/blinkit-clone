import { z } from 'zod';

/**
 * Store validation schemas (admin-only create/update).
 */
export const createStoreSchema = z.object({
  name: z.string().trim().min(1).max(100),
  code: z.string().trim().min(1).max(20),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }),
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
  timings: z.object({ openHour: z.number(), closeHour: z.number() }).optional(),
  deliveryRadiusMeters: z.number().positive().optional(),
  minOrderValue: z.number().nonnegative().optional(),
});

export const nearbyStoresQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().positive().max(20000).optional(),
});
