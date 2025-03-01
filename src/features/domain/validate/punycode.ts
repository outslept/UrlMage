import type { DomainHandler } from '../core/domain-handler'
import punycode from 'node:punycode'
import { ValidationError } from '../../../errors'
import { ErrorCode } from '../../../errors/types'
import { DomainValidator } from './domain-validator'

export class PunycodeValidator {
  private readonly domainHandler: DomainHandler
  private readonly domainValidator: DomainValidator

  constructor(domainHandler: DomainHandler) {
    this.domainHandler = domainHandler
    this.domainValidator = new DomainValidator()
  }

  // Validates if a domain name with Punycode parts is correctly formatted
  public validatePunycode(domain: string): boolean {
    try {
      // Check if any part of the domain uses Punycode encoding (starts with xn--)
      const hasPunycodeLabels = domain
        .split('.')
        .some(label => label.startsWith('xn--'))

      // If no Punycode labels, use standard domain validation
      if (!hasPunycodeLabels) {
        return this.domainValidator.validate(domain)
      }

      // Convert Punycode domain to Unicode for validation
      const unicodeDomain = this.domainHandler.fromPunycode(domain)
      const normalizedDomain = this.domainHandler.normalize(unicodeDomain)

      // Validate both the Unicode form and the Punycode format itself
      return (
        this.domainValidator.validate(normalizedDomain)
        && this.validatePunycodeFormat(domain)
      )
    }
    catch (error) {
      // Handle validation errors
      if (error instanceof Error) {
        throw new ValidationError(
          `Invalid Punycode domain: ${error.message}`,
          ErrorCode.INVALID_HOSTNAME,
        )
      }
      // Handle unexpected error types
      throw new ValidationError(
        'Invalid Punycode domain: Unknown error',
        ErrorCode.INVALID_HOSTNAME,
      )
    }
  }

  // Checks that Punycode-encoded parts of a domain follow proper formatting rules
  private validatePunycodeFormat(domain: string): boolean {
    const labels = domain.split('.')

    for (const label of labels) {
      // Only check labels that use Punycode encoding
      if (label.startsWith('xn--')) {
        try {
          // Decode the Punycode part (without the xn-- prefix)
          const decoded = punycode.decode(label.slice(4))

          // Ensure the decoded string isn't empty
          if (decoded.length === 0) {
            return false
          }

          // Verify that the decoded string contains at least one non-ASCII character
          // (otherwise, there's no reason to use Punycode encoding)
          if (!/[^\u0000-\u007F]/.test(decoded)) {
            return false
          }
        }
        catch {
          // If decoding fails, the Punycode format is invalid
          return false
        }
      }
    }

    // All Punycode labels passed validation
    return true
  }
}
