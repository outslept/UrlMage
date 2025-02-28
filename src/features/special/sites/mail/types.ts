import { z } from 'zod'
import { BaseSpecialURLSchema } from '../../base/types'

export const MailURLSchema = BaseSpecialURLSchema.extend({
  type: z.enum(['mailto', 'webmail', 'settings', 'compose']),
  email: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  service: z.enum(['gmail', 'outlook', 'yahoo', 'protonmail', 'other']).optional(),
  folder: z.string().optional(),
  messageId: z.string().optional(),
  searchQuery: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

export type MailURL = z.infer<typeof MailURLSchema>
