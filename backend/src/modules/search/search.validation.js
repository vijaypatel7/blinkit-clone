import { z } from 'zod';

/**
 * Search validation schemas.
 */
export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  type: z.enum(['products', 'categories', 'all']).default('all'),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
