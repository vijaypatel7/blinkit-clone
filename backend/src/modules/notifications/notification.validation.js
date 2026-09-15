import { z } from 'zod';

/**
 * Notification validation schemas.
 */
export const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});
