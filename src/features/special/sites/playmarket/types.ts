import { z } from 'zod';
import { BaseSpecialURLSchema } from '../../base/types';

export const PlayMarketURLSchema = BaseSpecialURLSchema.extend({
  type: z.enum(['app', 'developer', 'collection', 'search', 'movies', 'books', 'music']),
  packageName: z.string().optional(),
  developerId: z.string().optional(),
  collectionId: z.string().optional(),
  query: z.string().optional(),
  category: z.string().optional(),
  rating: z.string().optional(),
  price: z.string().optional(),
  language: z.string().optional(),
  country: z.string().optional(),
  reviewId: z.string().optional()
});

export type PlayMarketURL = z.infer<typeof PlayMarketURLSchema>;
