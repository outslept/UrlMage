import { z } from 'zod'

export const DomainSecuritySchema = z.object({
  hasSPF: z.boolean(), // Whether the domain has Sender Policy Framework records
  hasDMARC: z.boolean(), // Whether the domain has Domain-based Message Authentication records
  hasCAA: z.boolean(), // Whether the domain has Certification Authority Authorization records
  hasMX: z.boolean(), // Whether the domain has Mail Exchange records
  dnssec: z.boolean(), // Whether the domain uses DNSSEC (DNS Security Extensions)
  records: z.record(z.string(), z.array(z.string())), // Map of DNS record types to their values
})

export type DomainSecurity = z.infer<typeof DomainSecuritySchema>
