import { z } from 'zod'
import { BaseSpecialURLSchema } from '../../base/types'

export const DiscordURLSchema = BaseSpecialURLSchema.extend({
  type: z.enum(['channels', 'users', 'invite']),
  guildId: z.string().optional(),
  channelId: z.string().optional(),
  userId: z.string().optional(),
  inviteCode: z.string().optional(),
  messageId: z.string().optional(),
})

export type DiscordURL = z.infer<typeof DiscordURLSchema>
