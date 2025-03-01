import { z } from 'zod'
import { ProtocolCapabilitiesSchema } from './capabilities'
import { ProtocolSecuritySchema } from './security'

export enum ProtocolCategory {
  WEB = 'web',
  MAIL = 'mail',
  FILE = 'file',
  MEDIA = 'media',
  MESSAGING = 'messaging',
  OTHER = 'other',
}

export const ProtocolInfoSchema = z.object({
  name: z
    .string()
    .min(1, 'Protocol name is required')
    .max(20, 'Protocol name is too long')
    .regex(/^[a-z][a-z0-9+.-]*$/, 'Invalid protocol name format'),
  secure: z.boolean(),
  defaultPort: z.number().int().positive().max(65535).optional(),
  allowedPorts: z.array(z.number().int().positive().max(65535)).optional(),
  requiresHost: z.boolean(),
  supportsAuth: z.boolean(),
  category: z.nativeEnum(ProtocolCategory),
})

export type ProtocolInfo = z.infer<typeof ProtocolInfoSchema>

export const ProtocolFullInfoSchema = ProtocolInfoSchema.extend({
  security: ProtocolSecuritySchema,
  capabilities: ProtocolCapabilitiesSchema,
})

export type ProtocolFullInfo = z.infer<typeof ProtocolFullInfoSchema>
