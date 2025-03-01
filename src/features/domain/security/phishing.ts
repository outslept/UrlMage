import type { DomainHandler } from '../core/domain-handler'
import { isIP } from 'node:net'
import { ValidationError } from '../../../errors'
import { ErrorCode } from '../../../errors/types'

export class PhishingDetector {
  private readonly domainHandler: DomainHandler

  constructor(domainHandler: DomainHandler) {
    this.domainHandler = domainHandler
  }

  // Determines if a domain might be attempting to impersonate a target domain
  public isPotentialPhishing(domain: string, targetDomain: string): boolean {
    try {
      // Normalize domains for consistent comparison
      const normalizedDomain = this.domainHandler.normalize(domain)
      const normalizedTarget = this.domainHandler.normalize(targetDomain)

      // IP addresses are not considered for phishing detection
      if (isIP(normalizedDomain) || isIP(normalizedTarget)) {
        return false
      }

      // Case 1: Domain contains the target domain name but isn't identical
      // Examples: paypal-secure.com, secure-paypal.com for target paypal.com
      if (
        normalizedDomain.includes(normalizedTarget)
        && normalizedDomain !== normalizedTarget
      ) {
        return true
      }

      // Get root domains for more accurate comparison
      const targetRoot = this.domainHandler.getRootDomain(normalizedTarget)
      const domainRoot = this.domainHandler.getRootDomain(normalizedDomain)

      // Case 2: Domain is very similar to target (small edit distance)
      // Examples: paypa1.com, paaypal.com for target paypal.com
      if (this.calculateLevenshteinDistance(targetRoot, domainRoot) <= 2) {
        return true
      }

      // Not detected as potential phishing
      return false
    }
    catch (error) {
      // Handle errors during phishing detection
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

  // Calculates the Levenshtein distance (edit distance) between two strings
  private calculateLevenshteinDistance(a: string, b: string): number {
    // Initialize the distance matrix
    const matrix: number[][] = []

    // Fill the first column
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    // Fill the first row
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    // Fill the rest of the matrix using dynamic programming
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        // If characters match, no edit needed
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        }
        else {
          // Take minimum of three operations: substitution, insertion, deletion
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

    // The bottom-right cell contains the final distance
    return matrix[b.length][a.length]
  }
}
