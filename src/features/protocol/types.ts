import { z } from 'zod'

// Категории протоколов
export enum ProtocolCategory {
  WEB = 'web',
  MAIL = 'mail',
  FILE = 'file',
  MEDIA = 'media',
  MESSAGING = 'messaging',
  OTHER = 'other',
}

// Базовая информация о протоколе
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

// Информация о безопасности протокола
export const ProtocolSecuritySchema = z.object({
  encrypted: z.boolean(),
  tlsVersion: z.string().optional(),
  certificates: z
    .array(
      z.object({
        issuer: z.string(),
        validFrom: z.string(),
        validTo: z.string(),
        fingerprint: z.string(),
      }),
    )
    .optional(),
  ciphers: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
})

export type ProtocolSecurity = z.infer<typeof ProtocolSecuritySchema>

// Возможности протокола
export const ProtocolCapabilitiesSchema = z.object({
  supportsStreaming: z.boolean(),
  supportsCompression: z.boolean(),
  supportsProxy: z.boolean(),
  requiresAuthentication: z.boolean(),
  maxRequestSize: z.number().optional(),
  timeout: z.number().optional(),
})

export type ProtocolCapabilities = z.infer<typeof ProtocolCapabilitiesSchema>

// Полная информация о протоколе (объединяет все схемы)
export const ProtocolFullInfoSchema = ProtocolInfoSchema.extend({
  security: ProtocolSecuritySchema,
  capabilities: ProtocolCapabilitiesSchema,
})

export type ProtocolFullInfo = z.infer<typeof ProtocolFullInfoSchema>
