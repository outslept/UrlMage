import { z } from 'zod'

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
