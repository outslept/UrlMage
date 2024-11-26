import { z } from 'zod';
import { BaseSpecialURLSchema } from '../../base/types';

export const SpotifyURLSchema = BaseSpecialURLSchema.extend({
  type: z.enum(['track', 'album', 'artist', 'playlist', 'user', 'episode', 'show']),
  id: z.string(),
  context: z.string().optional(),
  market: z.string().optional(),
  position: z.number().optional(),
  creator: z.string().optional()
});

export type SpotifyURL = z.infer<typeof SpotifyURLSchema>;
