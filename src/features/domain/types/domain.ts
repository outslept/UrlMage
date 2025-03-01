import { z } from 'zod'

export const DomainPartSchema = z.object({
  name: z.string(), // The actual text of this domain part
  level: z.number(), // Position in hierarchy (0 for TLD, 1 for SLD, etc.)
  isPublicSuffix: z.boolean(), // Whether this is a public suffix like "co.uk"
  isRegistrable: z.boolean(), // Whether this level can be registered by end users
})

export type DomainPart = z.infer<typeof DomainPartSchema>

export const DomainInfoSchema = z.object({
  fullDomain: z.string(), // Complete domain string
  parts: z.array(DomainPartSchema), // Array of parsed domain parts
  tld: z.string(), // Top-level domain (e.g., "com")
  sld: z.string().optional(), // Second-level domain if present
  subdomain: z.string().optional(), // Subdomain portion if present
  isIp: z.boolean(), // Whether the input is an IP address
  isLocal: z.boolean(), // Whether domain is for local use only
  isValid: z.boolean(), // Whether domain syntax is valid
})

// TypeScript type derived from the domain info schema
export type DomainInfo = z.infer<typeof DomainInfoSchema>

export const IpAddressSchema = z.object({
  address: z.string(), // The actual IP address string
  version: z.enum(['v4', 'v6']), // IPv4 or IPv6
  isPrivate: z.boolean(), // Whether in private address range (e.g., 192.168.x.x)
  isLoopback: z.boolean(), // Whether a loopback address (e.g., 127.0.0.1)
  isMulticast: z.boolean(), // Whether a multicast address
  subnet: z.string().optional(), // CIDR notation of subnet if available
})

export type IpAddress = z.infer<typeof IpAddressSchema>
