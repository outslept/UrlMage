import { isIP } from 'node:net'
import { ValidationError } from '../../errors'
import { ErrorCode } from '../../errors/types'
import { DomainHandler } from './domain-handler'

export class DomainSecurity {
  /** Handler for domain operations */
  private readonly domainHandler: DomainHandler

  /**
   * List of known suspicious top-level domains often used in phishing attacks
   * @type {string[]}
   * @readonly
   */
  private readonly suspiciousTLDs = [
    'top',
    'xyz',
    'club',
    'work',
    'date',
    'racing',
    'stream',
    'bid',
    'review',
    'trade',
    'party',
    'science',
    'loan',
    'download',
    'accountant',
    'win',
    'gq',
    'ml',
    'cf',
    'ga',
    'tk',
  ]

  /**
   * Creates an instance of DomainSecurity
   */
  constructor() {
    this.domainHandler = new DomainHandler()
  }

  /**
   * Checks if a domain is considered secure
   * @param {string} domain - The domain to check
   * @returns {Promise<boolean>} True if the domain passes security checks
   * @throws {ValidationError} If the security check fails
   */
  public async isSecure(domain: string): Promise<boolean> {
    try {
      // Normalize the domain
      const normalizedDomain = this.domainHandler.normalize(domain)

      // If it's an IP address, check it
      if (isIP(normalizedDomain)) {
        return !this.isUnsafeIP(normalizedDomain)
      }

      const info = this.domainHandler.parse(normalizedDomain)

      // Local domains are not considered secure for external connections
      if (info.isLocal) {
        return false
      }

      // Check for suspicious TLDs
      if (info.tld && this.suspiciousTLDs.includes(info.tld.toLowerCase())) {
        return false
      }

      return true
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(
          `Failed to check domain security: ${error.message}`,
          ErrorCode.SECURITY_RISK,
        )
      }
      throw new ValidationError(
        'Failed to check domain security: Unknown error',
        ErrorCode.SECURITY_RISK,
      )
    }
  }

  /**
   * Checks if a domain is in a trusted domain list
   * @param {string} domain - The domain to check
   * @param {string[]} trustedDomains - List of trusted domains
   * @returns {boolean} True if the domain is in the trusted list
   * @throws {ValidationError} If the trust check fails
   */
  public isTrusted(domain: string, trustedDomains: string[]): boolean {
    try {
      const normalizedDomain = this.domainHandler.normalize(domain)

      // If it's an IP address, check for exact match
      if (isIP(normalizedDomain)) {
        return trustedDomains.includes(normalizedDomain)
      }

      // const info = this.domainHandler.parse(normalizedDomain);
      const rootDomain = this.domainHandler.getRootDomain(normalizedDomain)

      // Check if the domain or its root domain is in the trusted list
      return trustedDomains.some((trusted) => {
        // Normalize the trusted domain
        const normalizedTrusted = this.domainHandler.normalize(trusted)

        // Check for exact match
        if (normalizedDomain === normalizedTrusted) {
          return true
        }

        // Check if domain is a subdomain of a trusted domain
        if (normalizedDomain.endsWith(`.${normalizedTrusted}`)) {
          return true
        }

        // Check for root domain match
        try {
          const trustedRoot
            = this.domainHandler.getRootDomain(normalizedTrusted)
          return rootDomain === trustedRoot
        }
        catch {
          return false
        }
      })
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(
          `Failed to check domain trust: ${error.message}`,
          ErrorCode.SECURITY_RISK,
        )
      }
      throw new ValidationError(
        'Failed to check domain trust: Unknown error',
        ErrorCode.SECURITY_RISK,
      )
    }
  }

  /**
   * Checks if a domain is in a blacklist
   * @param {string} domain - The domain to check
   * @param {string[]} blacklist - List of blacklisted domains
   * @returns {boolean} True if the domain is blacklisted
   * @throws {ValidationError} If the blacklist check fails
   */
  public isBlacklisted(domain: string, blacklist: string[]): boolean {
    try {
      const normalizedDomain = this.domainHandler.normalize(domain)

      // If it's an IP address, check for exact match
      if (isIP(normalizedDomain)) {
        return blacklist.includes(normalizedDomain)
      }

      const info = this.domainHandler.parse(normalizedDomain)
      const rootDomain = this.domainHandler.getRootDomain(normalizedDomain)

      // Check if the domain or its root domain is in the blacklist
      return blacklist.some((blocked) => {
        // Normalize the blocked domain
        const normalizedBlocked = this.domainHandler.normalize(blocked)

        // Check for exact match
        if (normalizedDomain === normalizedBlocked) {
          return true
        }

        // Check if domain is a subdomain of a blocked domain
        if (normalizedDomain.endsWith(`.${normalizedBlocked}`)) {
          return true
        }

        // Check for root domain match
        try {
          const blockedRoot
            = this.domainHandler.getRootDomain(normalizedBlocked)
          return rootDomain === blockedRoot
        }
        catch {
          return false
        }
      })
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(
          `Failed to check domain blacklist: ${error.message}`,
          ErrorCode.SECURITY_RISK,
        )
      }
      throw new ValidationError(
        'Failed to check domain blacklist: Unknown error',
        ErrorCode.SECURITY_RISK,
      )
    }
  }

  /**
   * Checks if a domain is potentially phishing for a target domain
   * @param {string} domain - The domain to check
   * @param {string} targetDomain - The target domain that might be impersonated
   * @returns {boolean} True if the domain is potentially phishing
   * @throws {ValidationError} If the phishing check fails
   */
  public isPotentialPhishing(domain: string, targetDomain: string): boolean {
    try {
      const normalizedDomain = this.domainHandler.normalize(domain)
      const normalizedTarget = this.domainHandler.normalize(targetDomain)

      // Don't check IP addresses for phishing
      if (isIP(normalizedDomain) || isIP(normalizedTarget)) {
        return false
      }

      // Check if the domain contains the target domain as a substring
      // For example, paypal-secure.example.com might be phishing for paypal.com
      if (
        normalizedDomain.includes(normalizedTarget)
        && normalizedDomain !== normalizedTarget
      ) {
        return true
      }

      // Check for similar domains with typos (typosquatting)
      // For example, goggle.com instead of google.com
      const targetRoot = this.domainHandler.getRootDomain(normalizedTarget)
      const domainRoot = this.domainHandler.getRootDomain(normalizedDomain)

      if (this.calculateLevenshteinDistance(targetRoot, domainRoot) <= 2) {
        return true
      }

      return false
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(
          `Failed to check phishing: ${error.message}`,
          ErrorCode.SECURITY_RISK,
        )
      }
      throw new ValidationError(
        'Failed to check phishing: Unknown error',
        ErrorCode.SECURITY_RISK,
      )
    }
  }

  /**
   * Checks if an IP address is considered unsafe
   * @param {string} ip - The IP address to check
   * @returns {boolean} True if the IP is considered unsafe
   * @private
   */
  private isUnsafeIP(ip: string): boolean {
    if (!isIP(ip)) {
      return true
    }

    // Check for local and private IP addresses
    const ipInfo = this.domainHandler.parseIP(ip)
    return ipInfo.isPrivate || ipInfo.isLoopback || ipInfo.isMulticast
  }

  /**
   * Calculates Levenshtein distance between two strings
   * Used for detecting similar domains (typosquatting)
   * @param {string} a - First string
   * @param {string} b - Second string
   * @returns {number} The Levenshtein distance
   * @private
   */
  private calculateLevenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = []

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    // Fill the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        }
        else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1, // deletion
            ),
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }
}
