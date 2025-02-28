import { z } from 'zod'

// URL Component Schemas
export const ProtocolSchema = z.enum(['http:', 'https:', 'ws:', 'wss:', 'ftp:', 'sftp:', 'magnet:'])
export const HostnameSchema = z.string().min(1)
export const PortSchema = z.string().regex(/^\d*$/)
export const PathSchema = z.string().startsWith('/')
export const SearchSchema = z.string().startsWith('?').optional()
export const HashSchema = z.string().startsWith('#').optional()

// URL Validation Options Schema
export const URLValidationOptionsSchema = z.object({
  allowedProtocols: z.array(ProtocolSchema).default(['http:', 'https:']),
  requireSecure: z.boolean().default(false),
  maxLength: z.number().positive().default(2048),
  allowCredentials: z.boolean().default(false),
  allowLocalhost: z.boolean().default(true),
  allowIPv4: z.boolean().default(true),
  allowIPv6: z.boolean().default(true),
  allowQueryParams: z.boolean().default(true),
  allowFragment: z.boolean().default(true),
  customValidation: z.function()
    .args(z.string())
    .returns(z.boolean())
    .optional(),
})

// Query Parameter Schemas
export const QueryValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number(), z.boolean()])),
])

export const QueryParamsSchema = z.record(z.string(), QueryValueSchema)

// URL Components Schema
export const URLComponentsSchema = z.object({
  protocol: ProtocolSchema,
  hostname: HostnameSchema,
  port: PortSchema.optional(),
  pathname: PathSchema,
  search: SearchSchema,
  hash: HashSchema,
  username: z.string().optional(),
  password: z.string().optional(),
})

// Pattern Matching Schema
export const URLPatternSchema = z.object({
  protocol: z.string().optional(),
  hostname: z.string().optional(),
  pathname: z.string().optional(),
  search: z.string().optional(),
  hash: z.string().optional(),
})

// Export inferred types
export type Protocol = z.infer<typeof ProtocolSchema>
export type URLValidationOptions = z.infer<typeof URLValidationOptionsSchema>
export type QueryValue = z.infer<typeof QueryValueSchema>
export type QueryParams = z.infer<typeof QueryParamsSchema>
export type URLComponents = z.infer<typeof URLComponentsSchema>
export type URLPattern = z.infer<typeof URLPatternSchema>

// Error types
export const URLErrorSchema = z.object({
  code: z.enum([
    'INVALID_PROTOCOL',
    'INVALID_HOSTNAME',
    'INVALID_PORT',
    'INVALID_PATH',
    'INVALID_QUERY',
    'INVALID_FRAGMENT',
    'INVALID_CREDENTIALS',
    'URL_TOO_LONG',
    'MALICIOUS_URL',
    'CUSTOM_VALIDATION_FAILED',
  ]),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
})

export type URLError = z.infer<typeof URLErrorSchema>

// Utility type for builder pattern
export interface URLBuilder {
  setProtocol: (protocol: Protocol) => URLBuilder
  setHostname: (hostname: string) => URLBuilder
  setPort: (port: string | number) => URLBuilder
  setPath: (path: string) => URLBuilder
  setSearch: (search: string | QueryParams) => URLBuilder
  setHash: (hash: string) => URLBuilder
  setCredentials: (username: string, password: string) => URLBuilder
  build: () => URL
}
