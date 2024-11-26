import { z } from 'zod';
import { BaseSpecialURLSchema } from '../../base/types';

export const WhatsAppURLSchema = BaseSpecialURLSchema.extend({
  type: z.enum(['chat', 'group', 'catalog', 'status', 'send', 'share']),
  phoneNumber: z.string().optional(),
  groupId: z.string().optional(),
  catalogId: z.string().optional(),
  statusId: z.string().optional(),
  text: z.string().optional(),
  shareText: z.string().optional(),
  shareUrl: z.string().optional()
});

export type WhatsAppURL = z.infer<typeof WhatsAppURLSchema>;
