import { z } from 'zod'

/**
 * Schema for a part of a domain name (e.g., a single label)
 * @const {z.ZodObject} DomainPartSchema
 */
export const DomainPartSchema = z.object({
  /** The text value of this domain part */
  name: z.string(),

  /** The level in the domain hierarchy (0 for TLD, 1 for SLD, etc.) */
  level: z.number(),

  /** Whether this part is a public suffix (e.g., .com, .co.uk) */
  isPublicSuffix: z.boolean(),

  /** Whether this part forms a registrable domain with its parent parts */
  isRegistrable: z.boolean(),
})

/**
 * Represents a part of a domain name
 * @typedef {z.infer<typeof DomainPartSchema>} DomainPart
 */
export type DomainPart = z.infer<typeof DomainPartSchema>

/**
 * Schema for comprehensive domain information
 * @const {z.ZodObject} DomainInfoSchema
 */
export const DomainInfoSchema = z.object({
  /** The complete domain name */
  fullDomain: z.string(),

  /** Array of domain parts/labels */
  parts: z.array(DomainPartSchema),

  /** The top-level domain (e.g., com, org, co.uk) */
  tld: z.string(),

  /** The second-level domain, if present */
  sld: z.string().optional(),

  /** Any subdomain parts, if present */
  subdomain: z.string().optional(),

  /** Whether this is an IP address rather than a domain name */
  isIp: z.boolean(),

  /** Whether this is a local domain (.local, localhost, etc.) */
  isLocal: z.boolean(),

  /** Whether the domain is syntactically valid */
  isValid: z.boolean(),
})

/**
 * Represents comprehensive information about a domain
 * @typedef {z.infer<typeof DomainInfoSchema>} DomainInfo
 */
export type DomainInfo = z.infer<typeof DomainInfoSchema>

/**
 * Schema for IP address information
 * @const {z.ZodObject} IpAddressSchema
 */
export const IpAddressSchema = z.object({
  /** The IP address string */
  address: z.string(),

  /** The IP version (v4 or v6) */
  version: z.enum(['v4', 'v6']),

  /** Whether this is a private IP address (e.g., 192.168.x.x) */
  isPrivate: z.boolean(),

  /** Whether this is a loopback address (e.g., 127.0.0.1) */
  isLoopback: z.boolean(),

  /** Whether this is a multicast address */
  isMulticast: z.boolean(),

  /** The subnet information, if available */
  subnet: z.string().optional(),
})

/**
 * Represents information about an IP address
 * @typedef {z.infer<typeof IpAddressSchema>} IpAddress
 */
export type IpAddress = z.infer<typeof IpAddressSchema>

/**
 * Schema for domain security information
 * @const {z.ZodObject} DomainSecuritySchema
 */
export const DomainSecuritySchema = z.object({
  /** Whether the domain has SPF (Sender Policy Framework) records */
  hasSPF: z.boolean(),

  /** Whether the domain has DMARC (Domain-based Message Authentication) records */
  hasDMARC: z.boolean(),

  /** Whether the domain has CAA (Certification Authority Authorization) records */
  hasCAA: z.boolean(),

  /** Whether the domain has MX (Mail Exchange) records */
  hasMX: z.boolean(),

  /** Whether the domain uses DNSSEC (DNS Security Extensions) */
  dnssec: z.boolean(),

  /** Collection of DNS records by type */
  records: z.record(z.string(), z.array(z.string())),
})
