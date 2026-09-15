import { z } from 'zod';

/**
 * User validation schemas.
 */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().email().optional().or(z.literal('')),
  preferredLanguage: z.enum(['en', 'hi']).optional(),
  profileImage: z.string().url().optional(),
});
