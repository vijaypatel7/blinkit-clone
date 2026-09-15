import { z } from 'zod';

/**
 * Category validation schemas.
 */
export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).optional(),
  parentId: z.string().optional().nullable(),
  image: z.string().url().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
});
