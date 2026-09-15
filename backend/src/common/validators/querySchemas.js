/**
 * Query-string validation for list endpoints.
 *
 * All list endpoints accept a common pagination + sorting contract. Using a
 * single validator guarantees consistent behaviour across the API.
 */
import { z } from 'zod';

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(), // opaque cursor from previous response
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.enum(['createdAt', '-createdAt', 'price', '-price', 'popularity']).optional(),
});

export const offsetPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/** Shared id param validator. */
export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const idSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid ObjectId');
