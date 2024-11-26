import { z } from 'zod'

// Domain Types
export const DomainPartSchema = z.object({
  name: z.string(),
  level: z.number(),
  isPublicSuffix: z.boolean(),
  isRegistrable: z.boolean()
})

export type DomainPart = z.infer<typeof DomainPartSchema>

export const DomainInfoSchema = z.object({
  fullDomain: z.string(),
  parts: z.array(DomainPartSchema),
  tld: z.string(),
  sld: z.string().optional(),
  subdomain: z.string().optional(),
  isIp: z.boolean(),
  isLocal: z.boolean(),
  isValid: z.boolean()
})

export type DomainInfo = z.infer<typeof DomainInfoSchema>

// IP Address Types
export const IpAddressSchema = z.object({
  address: z.string(),
  version: z.enum(['v4', 'v6']),
  isPrivate: z.boolean(),
  isLoopback: z.boolean(),
  isMulticast: z.boolean(),
  subnet: z.string().optional()
})

export type IpAddress = z.infer<typeof IpAddressSchema>

// Domain Security Info
export const DomainSecuritySchema = z.object({
  hasSPF: z.boolean(),
  hasDMARC: z.boolean(),
  hasCAA: z.boolean(),
  hasMX: z.boolean(),
  dnssec: z.boolean(),
  records: z.record(z.string(), z.array(z.string()))
})

export type DomainSecurity = z.infer<typeof DomainSecuritySchema>
