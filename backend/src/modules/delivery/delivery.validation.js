import { z } from 'zod';

/**
 * Delivery validation schemas.
 */
export const trackingPointSchema = z.object({
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
});
