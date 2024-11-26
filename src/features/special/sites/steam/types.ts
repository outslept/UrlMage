import { z } from 'zod';
import { BaseSpecialURLSchema } from '../../base/types';

export const SteamURLSchema = BaseSpecialURLSchema.extend({
  type: z.enum(['store', 'community', 'profile', 'games', 'app', 'market', 'id']),
  appId: z.string().optional(),
  profileId: z.string().optional(),
  communityId: z.string().optional(),
  marketHashName: z.string().optional(),
  marketListingId: z.string().optional(),
  gameId: z.string().optional(),
  customUrl: z.string().optional(),
  section: z.string().optional(),
  subsection: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional()
});

export type SteamURL = z.infer<typeof SteamURLSchema>;
