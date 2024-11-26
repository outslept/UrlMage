import { z } from 'zod';
import { BaseSpecialURLSchema } from '../../base/types';

export const TelegramURLSchema = BaseSpecialURLSchema.extend({
  type: z.enum(['channel', 'user', 'group', 'sticker', 'addstickers', 'share', 'proxy', 'joinchat']),
  identifier: z.string(),
  messageId: z.string().optional(),
  threadId: z.string().optional(),
  comment: z.string().optional(),
  startParam: z.string().optional(),
  server: z.string().optional(),
  port: z.string().optional(),
  secret: z.string().optional(),
  setName: z.string().optional(),
  shareUrl: z.string().optional(),
  shareText: z.string().optional()
});

export type TelegramURL = z.infer<typeof TelegramURLSchema>;
