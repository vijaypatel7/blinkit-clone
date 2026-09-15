import { z } from 'zod';

/**
 * Product validation schemas.
 */
export const listProductsQuerySchema = z.object({
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z
    .enum(['popularity', 'price_asc', 'price_desc', 'newest'])
    .optional(),
  featured: z.coerce.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120).optional(),
  sku: z.string().trim().min(1).max(40),
  brand: z.string().trim().optional(),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  attributes: z.record(z.string()).optional(),
  mrp: z.number().positive(),
  price: z.number().positive(),
  unit: z.string().optional(),
  isFeatured: z.boolean().optional(),
});
