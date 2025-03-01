import { z } from 'zod'

export const ProtocolCapabilitiesSchema = z.object({
  supportsStreaming: z.boolean(),
  supportsCompression: z.boolean(),
  supportsProxy: z.boolean(),
  requiresAuthentication: z.boolean(),
  maxRequestSize: z.number().optional(),
  timeout: z.number().optional(),
})

export type ProtocolCapabilities = z.infer<typeof ProtocolCapabilitiesSchema>
