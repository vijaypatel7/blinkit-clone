import { z } from 'zod';

/**
 * Home query validation.
 */
export const homeQuerySchema = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  zone: z.string().optional(),
});
