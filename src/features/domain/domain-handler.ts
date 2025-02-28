import type { DomainInfo, DomainPart, IpAddress } from './types'
import { isIP } from 'node:net'
import punycode from 'node:punycode'
import { parseDomain, ParseResultType } from 'parse-domain'
import { ValidationError } from '../../errors'
import { ErrorCode } from '../../errors/types'

/**
 * Utility class for domain name handling, parsing, and manipulation
 * @class DomainHandler
 */
export class DomainHandler {
  /**
   * Parses a domain string into structured information
   * @param {string} domain - The domain to parse
   * @returns {DomainInfo} Structured information about the domain
   * @throws {ValidationError} If the domain is invalid
   */
  public parse(domain: string): DomainInfo {
    // Remove protocol if present
    domain = domain.replace(/^[a-z]+:\/\//i, '')

    // Remove path, query parameters, and hash
    domain = domain.split(/[/?#]/)[0]

    if (isIP(domain)) {
      return {
        fullDomain: domain,
        parts: [],
        tld: '',
        isIp: true,
        isLocal: this.isPrivateIP(domain) || this.isLoopbackIP(domain),
        isValid: true,
      }
    }

    const parseResult = parseDomain(domain)

    if (!parseResult || parseResult.type === ParseResultType.Invalid) {
      throw new ValidationError(
        `Invalid domain: ${domain}`,
        ErrorCode.INVALID_HOSTNAME,
      )
    }

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
        isLocal: true,
        isValid: true,
      }
    }

    if (parseResult.type !== ParseResultType.Listed) {
      throw new ValidationError(
        `Invalid domain type: ${parseResult.type}`,
        ErrorCode.INVALID_HOSTNAME,
      )
    }

    const { subDomains, domain: sld, topLevelDomains } = parseResult
    const tld = topLevelDomains ? topLevelDomains.join('.') : ''

    if (!sld) {
      throw new ValidationError(
        `Invalid domain structure: ${domain}`,
        ErrorCode.INVALID_HOSTNAME,
      )
    }

    const parts: DomainPart[] = []
    let level = 0

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

    parts.push({
      name: sld,
      level: level++,
      isPublicSuffix: false,
      isRegistrable: true,
    })

    if (tld) {
      parts.push({
        name: tld,
        level,
        isPublicSuffix: true,
        isRegistrable: false,
      })
    }

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

  /**
   * Parses an IP address string into structured information
   * @param {string} ip - The IP address to parse
   * @returns {IpAddress} Structured information about the IP address
   * @throws {ValidationError} If the IP address is invalid
   */
  public parseIP(ip: string): IpAddress {
    const version = isIP(ip)
    if (!version) {
      throw new ValidationError(
        `Invalid IP address: ${ip}`,
        ErrorCode.INVALID_IP,
      )
    }

    return {
      address: ip,
      version: version === 4 ? 'v4' : 'v6',
      isPrivate: this.isPrivateIP(ip),
      isLoopback: this.isLoopbackIP(ip),
      isMulticast: this.isMulticastIP(ip),
    }
  }

  /**
   * Normalizes a domain name (removes protocol, path, converts to lowercase)
   * @param {string} domain - The domain to normalize
   * @returns {string} The normalized domain
   */
  public normalize(domain: string): string {
    // Remove protocol if present
    domain = domain.replace(/^[a-z]+:\/\//i, '')

    // Remove path, query parameters, and hash
    domain = domain.split(/[/?#]/)[0]

    // Convert to lowercase
    domain = domain.toLowerCase()

    // Remove trailing dot
    domain = domain.replace(/\.$/, '')

    try {
      const url = new URL(`http://${domain}`)
      return url.hostname
    }
    catch {
      return domain
    }
  }

  /**
   * Extracts the root domain (registrable part + TLD) from a domain
   * @param {string} domain - The domain to process
   * @returns {string} The root domain
   */
  public getRootDomain(domain: string): string {
    const info = this.parse(domain)
    if (info.isIp) {
      return domain
    }

    const registrablePart = info.parts.find(part => part.isRegistrable)
    const tldPart = info.parts.find(part => part.isPublicSuffix)

    if (!registrablePart || !tldPart) {
      return domain
    }

    return `${registrablePart.name}.${tldPart.name}`
  }

  /**
   * Gets an array of subdomain parts from a domain
   * @param {string} domain - The domain to process
   * @returns {string[]} Array of subdomain parts
   */
  public getSubdomains(domain: string): string[] {
    const info = this.parse(domain)
    if (info.isIp) {
      return []
    }
    return info.parts
      .filter(part => !part.isPublicSuffix && !part.isRegistrable)
      .map(part => part.name)
  }

  /**
   * Adds a subdomain to a domain
   * @param {string} domain - The domain to add the subdomain to
   * @param {string} subdomain - The subdomain to add
   * @returns {string} The resulting domain with subdomain
   * @throws {ValidationError} If the operation is invalid or the subdomain format is incorrect
   */
  public addSubdomain(domain: string, subdomain: string): string {
    const info = this.parse(domain)
    if (info.isIp) {
      throw new ValidationError(
        'Cannot add subdomain to IP address',
        ErrorCode.INVALID_OPERATION,
      )
    }

    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(subdomain)) {
      throw new ValidationError(
        'Invalid subdomain. Must start and end with alphanumeric characters and can contain hyphens in between.',
        ErrorCode.INVALID_HOSTNAME,
      )
    }

    return `${subdomain}.${domain}`
  }

  /**
   * Removes the leftmost subdomain from a domain
   * @param {string} domain - The domain to process
   * @returns {string} The domain with the leftmost subdomain removed
   */
  public removeSubdomain(domain: string): string {
    const info = this.parse(domain)
    if (info.isIp) {
      return domain
    }

    const parts = info.parts
    if (parts.length <= 2) {
      return domain
    }

    return parts
      .slice(1)
      .map(part => part.name)
      .join('.')
  }

  /**
   * Replaces all subdomains in a domain with a new subdomain
   * @param {string} domain - The domain to process
   * @param {string} newSubdomain - The new subdomain to set
   * @returns {string} The domain with replaced subdomains
   * @throws {ValidationError} If the operation is invalid
   */
  public replaceSubdomains(domain: string, newSubdomain: string): string {
    const info = this.parse(domain)
    if (info.isIp) {
      throw new ValidationError(
        'Cannot replace subdomains in IP address',
        ErrorCode.INVALID_OPERATION,
      )
    }

    const rootDomain = this.getRootDomain(domain)
    return this.addSubdomain(rootDomain, newSubdomain)
  }

  /**
   * Gets the depth of subdomains in a domain
   * @param {string} domain - The domain to analyze
   * @returns {number} The number of subdomain levels
   */
  public getSubdomainDepth(domain: string): number {
    return this.getSubdomains(domain).length
  }

  /**
   * Checks if a domain is a subdomain of another domain
   * @param {string} domain - The potential subdomain
   * @param {string} parentDomain - The potential parent domain
   * @returns {boolean} True if domain is a subdomain of parentDomain
   */
  public isSubdomainOf(domain: string, parentDomain: string): boolean {
    const domainInfo = this.parse(domain)
    const parentInfo = this.parse(parentDomain)

    if (domainInfo.isIp || parentInfo.isIp) {
      return false
    }

    const domainRoot = this.getRootDomain(domain)
    const parentRoot = this.getRootDomain(parentDomain)

    if (domainRoot !== parentRoot) {
      return false
    }

    const domainSubs = this.getSubdomains(domain)
    const parentSubs = this.getSubdomains(parentDomain)

    if (domainSubs.length <= parentSubs.length) {
      return false
    }

    // Check if domain ends with the parent domain
    return domain.endsWith(`.${parentDomain}`)
  }

  /**
   * Converts a domain to Punycode for internationalized domain names (IDN)
   * @param {string} domain - The Unicode domain to convert
   * @returns {string} The Punycode-encoded domain
   * @throws {ValidationError} If conversion fails
   */
  public toPunycode(domain: string): string {
    try {
      // Split domain into parts
      const parts = domain.split('.')

      // Convert each part to punycode if necessary
      const punycodeparts = parts.map((part) => {
        // Check if part contains non-ASCII characters
        if (/[^\x00-\x7F]/.test(part)) {
          return `xn--${punycode.encode(part)}`
        }
        return part
      })

      return punycodeparts.join('.')
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(
          `Failed to convert to Punycode: ${error.message}`,
          ErrorCode.ENCODING_ERROR,
        )
      }
      throw new ValidationError(
        'Failed to convert to Punycode: Unknown error',
        ErrorCode.ENCODING_ERROR,
      )
    }
  }

  /**
   * Converts a Punycode domain back to Unicode
   * @param {string} domain - The Punycode domain to convert
   * @returns {string} The Unicode domain
   * @throws {ValidationError} If conversion fails
   */
  public fromPunycode(domain: string): string {
    try {
      // Split domain into parts
      const parts = domain.split('.')

      // Convert each part from punycode if necessary
      const unicodeParts = parts.map((part) => {
        if (part.startsWith('xn--')) {
          return punycode.decode(part.slice(4))
        }
        return part
      })

      return unicodeParts.join('.')
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(
          `Failed to convert from Punycode: ${error.message}`,
          ErrorCode.DECODING_ERROR,
        )
      }
      throw new ValidationError(
        'Failed to convert from Punycode: Unknown error',
        ErrorCode.DECODING_ERROR,
      )
    }
  }

  /**
   * Checks if an IP address is private
   * @param {string} ip - The IP address to check
   * @returns {boolean} True if the IP is private
   * @private
   */
  private isPrivateIP(ip: string): boolean {
    const version = isIP(ip)
    if (version === 0)
      return false

    if (version === 4) {
      const addr = this.parseIPv4(ip)
      if (!addr)
        return false

      return (
        addr[0] === 10 // 10.0.0.0/8
        || (addr[0] === 172 && addr[1] >= 16 && addr[1] <= 31) // 172.16.0.0/12
        || (addr[0] === 192 && addr[1] === 168) // 192.168.0.0/16
        || (addr[0] === 169 && addr[1] === 254) // 169.254.0.0/16 (link-local)
      )
    }

    if (version === 6) {
      // Check for IPv6 local addresses (fe80::/10)
      return (
        ip.toLowerCase().startsWith('fe80:')
        || ip.toLowerCase().startsWith('fc00:')
        || ip.toLowerCase().startsWith('fd00:')
      )
    }

    return false
  }

  /**
   * Checks if an IP address is a loopback address
   * @param {string} ip - The IP address to check
   * @returns {boolean} True if the IP is a loopback address
   * @private
   */
  private isLoopbackIP(ip: string): boolean {
    const version = isIP(ip)
    if (version === 0)
      return false

    if (version === 4) {
      const addr = this.parseIPv4(ip)
      if (!addr)
        return false
      return addr[0] === 127
    }

    if (version === 6) {
      // ::1 - IPv6 loopback
      return ip === '::1'
    }

    return false
  }

  /**
   * Checks if an IP address is a multicast address
   * @param {string} ip - The IP address to check
   * @returns {boolean} True if the IP is a multicast address
   * @private
   */
  private isMulticastIP(ip: string): boolean {
    const version = isIP(ip)
    if (version === 0)
      return false

    if (version === 4) {
      const addr = this.parseIPv4(ip)
      if (!addr)
        return false
      return addr[0] >= 224 && addr[0] <= 239
    }

    if (version === 6) {
      // IPv6 multicast addresses start with ff00::/8
      return ip.toLowerCase().startsWith('ff')
    }

    return false
  }

  /**
   * Parses an IPv4 address into its numeric components
   * @param {string} ip - The IPv4 address to parse
   * @returns {number[] | null} Array of numeric components or null if invalid
   * @private
   */
  private parseIPv4(ip: string): number[] | null {
    if (isIP(ip) !== 4)
      return null
    return ip.split('.').map(Number)
  }
}
