import type { DomainInfo, DomainPart } from '../types/domain'
import { isIP } from 'node:net'
import { parseDomain, ParseResultType } from 'parse-domain'
import { ValidationError } from '../../../errors'
import { ErrorCode } from '../../../errors/types'
import { IpHandler } from './ip-handler'

export class DomainParser {
  private readonly ipHandler: IpHandler

  constructor() {
    this.ipHandler = new IpHandler()
  }

  // Parses a domain string into structured information
  public parse(domain: string): DomainInfo {
    // Clean up the domain by removing protocol prefixes
    domain = domain.replace(/^[a-z]+:\/\//, '')

    // Remove path, query parameters and fragment
    domain = domain.split(/[/?#]/)[0]

    // Handle IP addresses differently from domain names
    if (isIP(domain)) {
      return {
        fullDomain: domain,
        parts: [], // IP addresses don't have domain parts
        tld: '', // IP addresses don't have TLDs
        isIp: true,
        isLocal: this.ipHandler.isPrivateIP(domain) || this.ipHandler.isLoopbackIP(domain),
        isValid: true,
      }
    }

    // Use parse-domain library to break down the domain
    const parseResult = parseDomain(domain)

    // Handle invalid domains
    if (!parseResult || parseResult.type === ParseResultType.Invalid) {
      throw new ValidationError(
        `Invalid domain: ${domain}`,
        ErrorCode.INVALID_HOSTNAME,
      )
    }

    // Handle unlisted TLDs (e.g., local domains, custom TLDs)
    if (parseResult.type === ParseResultType.NotListed) {
      return {
        fullDomain: domain,
        parts: [
          {
            name: domain,
            level: 0,
            isPublicSuffix: false,
            isRegistrable: true,
          },
        ],
        tld: '',
        isIp: false,
        isLocal: true, // Consider unlisted domains as local
        isValid: true,
      }
    }

    // Ensure the parse result is of the expected type
    if (parseResult.type !== ParseResultType.Listed) {
      throw new ValidationError(
        `Invalid domain type: ${parseResult.type}`,
        ErrorCode.INVALID_HOSTNAME,
      )
    }

    // Extract domain components from the parse result
    const { subDomains, domain: sld, topLevelDomains } = parseResult
    const tld = topLevelDomains ? topLevelDomains.join('.') : ''

    // Validate the domain has a second-level domain (SLD)
    if (!sld) {
      throw new ValidationError(
        `Invalid domain structure: ${domain}`,
        ErrorCode.INVALID_HOSTNAME,
      )
    }

    // Build an array of domain parts with their properties
    const parts: DomainPart[] = []
    let level = 0

    // Add subdomains to parts array (in reverse order, from right to left)
    if (subDomains && subDomains.length > 0) {
      [...subDomains].reverse().forEach((sub) => {
        parts.push({
          name: sub,
          level: level++,
          isPublicSuffix: false,
          isRegistrable: false,
        })
      })
    }

    // Add the SLD (second-level domain)
    parts.push({
      name: sld,
      level: level++,
      isPublicSuffix: false,
      isRegistrable: true, // The SLD is the registrable part
    })

    // Add the TLD if present
    if (tld) {
      parts.push({
        name: tld,
        level,
        isPublicSuffix: true, // The TLD is a public suffix
        isRegistrable: false,
      })
    }

    // Return the complete domain information
    return {
      fullDomain: domain,
      parts,
      tld: tld || '',
      sld,
      subdomain:
        subDomains && subDomains.length > 0 ? subDomains.join('.') : undefined,
      isIp: false,
      isLocal: false,
      isValid: true,
    }
  }

  // Normalizes a domain string for consistent processing
  public normalize(domain: string): string {
    // Remove protocol if present
    domain = domain.replace(/^[a-z]+:\/\//, '')

    // Remove path, query parameters and fragment
    domain = domain.split(/[/?#]/)[0]

    // Convert to lowercase for case-insensitive comparison
    domain = domain.toLowerCase()

    // Remove trailing dot (used in DNS but not in web URLs)
    domain = domain.replace(/\.$/, '')

    // Use URL parsing for additional normalization if possible
    try {
      const url = new URL(`http://${domain}`)
      return url.hostname
    }
    catch {
      // If URL parsing fails, return the cleaned domain
      return domain
    }
  }
}
