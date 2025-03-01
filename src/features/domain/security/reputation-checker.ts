import type { DomainHandler } from '../core/domain-handler'
import { isIP } from 'node:net'
import { ValidationError } from '../../../errors'
import { ErrorCode } from '../../../errors/types'

export class ReputationChecker {
  private readonly domainHandler: DomainHandler

  constructor(domainHandler: DomainHandler) {
    this.domainHandler = domainHandler
  }

  // Checks if a domain is trusted based on a list of trusted domains
  public isTrusted(domain: string, trustedDomains: string[]): boolean {
    try {
      // Normalize the domain for consistent comparison
      const normalizedDomain = this.domainHandler.normalize(domain)

      // For IP addresses, check for exact match in trusted list
      if (isIP(normalizedDomain)) {
        return trustedDomains.includes(normalizedDomain)
      }

      // Get the root domain (registrable part + TLD)
      const rootDomain = this.domainHandler.getRootDomain(normalizedDomain)

      // Check against each trusted domain
      return trustedDomains.some((trusted) => {
        // Normalize the trusted domain for consistent comparison
        const normalizedTrusted = this.domainHandler.normalize(trusted)

        // Case 1: Exact match with a trusted domain
        if (normalizedDomain === normalizedTrusted) {
          return true
        }

        // Case 2: Domain is a subdomain of a trusted domain
        if (normalizedDomain.endsWith(`.${normalizedTrusted}`)) {
          return true
        }

        // Case 3: Domain shares the same root domain as a trusted domain
        try {
          const trustedRoot = this.domainHandler.getRootDomain(normalizedTrusted)
          return rootDomain === trustedRoot
        }
        catch {
          return false
        }
      })
    }
    catch (error) {
      // Handle errors during trust checking
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

  // Checks if a domain is blacklisted based on a list of blocked domains
  public isBlacklisted(domain: string, blacklist: string[]): boolean {
    try {
      // Normalize the domain for consistent comparison
      const normalizedDomain = this.domainHandler.normalize(domain)

      // For IP addresses, check for exact match in blacklist
      if (isIP(normalizedDomain)) {
        return blacklist.includes(normalizedDomain)
      }

      // Get the root domain (registrable part + TLD)
      const rootDomain = this.domainHandler.getRootDomain(normalizedDomain)

      // Check against each blacklisted domain
      return blacklist.some((blocked) => {
        // Normalize the blacklisted domain for consistent comparison
        const normalizedBlocked = this.domainHandler.normalize(blocked)

        // Case 1: Exact match with a blacklisted domain
        if (normalizedDomain === normalizedBlocked) {
          return true
        }

        // Case 2: Domain is a subdomain of a blacklisted domain
        if (normalizedDomain.endsWith(`.${normalizedBlocked}`)) {
          return true
        }

        // Case 3: Domain shares the same root domain as a blacklisted domain
        try {
          const blockedRoot = this.domainHandler.getRootDomain(normalizedBlocked)
          return rootDomain === blockedRoot
        }
        catch {
          return false
        }
      })
    }
    catch (error) {
      // Handle errors during blacklist checking
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
}
