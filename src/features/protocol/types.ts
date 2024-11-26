import { z } from 'zod'

// Protocol Types
export const ProtocolInfoSchema = z.object({
  name: z.string(),
  secure: z.boolean(),
  defaultPort: z.number().optional(),
  allowedPorts: z.array(z.number()).optional(),
  requiresHost: z.boolean(),
  supportsAuth: z.boolean(),
  category: z.enum(['web', 'mail', 'file', 'media', 'messaging', 'other'])
})

export type ProtocolInfo = z.infer<typeof ProtocolInfoSchema>

// Protocol Security
export const ProtocolSecuritySchema = z.object({
  encrypted: z.boolean(),
  tlsVersion: z.string().optional(),
  certificates: z.array(z.object({
    issuer: z.string(),
    validFrom: z.string(),
    validTo: z.string(),
    fingerprint: z.string()
  })).optional(),
  ciphers: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional()
})

export type ProtocolSecurity = z.infer<typeof ProtocolSecuritySchema>

// Protocol Capabilities
export const ProtocolCapabilitiesSchema = z.object({
  supportsStreaming: z.boolean(),
  supportsCompression: z.boolean(),
  supportsProxy: z.boolean(),
  requiresAuthentication: z.boolean(),
  maxRequestSize: z.number().optional(),
  timeout: z.number().optional()
})

export type ProtocolCapabilities = z.infer<typeof ProtocolCapabilitiesSchema>
