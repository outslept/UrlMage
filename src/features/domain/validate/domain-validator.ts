import { isIP } from 'node:net'
import punycode from 'node:punycode'
import { ValidationError } from '../../../errors'
import { ErrorCode } from '../../../errors/types'
import { DOMAIN_CONSTANTS } from '../constants'
import { DomainHandler } from '../core/domain-handler'
import { PunycodeValidator } from './punycode'

export class DomainValidator {
  private readonly domainHandler: DomainHandler
  private readonly punycodeValidator: PunycodeValidator
  private readonly maxLength = DOMAIN_CONSTANTS.MAX_DOMAIN_LENGTH // Maximum length for entire domain
  private readonly maxLabelLength = DOMAIN_CONSTANTS.MAX_LABEL_LENGTH // Maximum length for each domain label

  constructor() {
    this.domainHandler = new DomainHandler()
    this.punycodeValidator = new PunycodeValidator(this.domainHandler)
  }

  // Main validation method for domain names
  public validate(domain: string): boolean {
    try {
      // IP addresses are valid inputs
      if (isIP(domain)) {
        return true
      }

      // Check domain length constraints
      if (!this.validateLength(domain)) {
        return false
      }

      // Check for valid characters in domain name
      if (!this.validateCharacters(domain)) {
        return false
      }

      // Validate individual domain labels (parts between dots)
      if (!this.validateLabels(domain)) {
        return false
      }

      // Attempt to parse the domain (will throw if invalid)
      this.domainHandler.parse(domain)

      return true
    }
    catch {
      // If any validation step throws an exception, the domain is invalid
      return false
    }
  }

  // Validates that domain length is within acceptable bounds
  private validateLength(domain: string): boolean {
    return domain.length > 0 && domain.length <= this.maxLength
  }

  // Validates that domain contains only allowed characters
  private validateCharacters(domain: string): boolean {
    // For ASCII domains, check for allowed characters directly
    if (/^[a-z0-9.-]+$/i.test(domain)) {
      return true
    }

    // For IDNs (internationalized domain names), convert to Punycode and validate
    try {
      const punycodeVersion = this.domainHandler.toPunycode(domain)
      return /^[a-z0-9.-]+$/i.test(punycodeVersion)
    }
    catch {
      return false
    }
  }

  // Validates individual domain labels (parts between dots)
  private validateLabels(domain: string): boolean {
    const labels = domain.split('.')

    // Domain must have at least one label
    if (labels.length < 1) {
      return false
    }

    for (const label of labels) {
      // Check label length constraints
      if (label.length === 0 || label.length > this.maxLabelLength) {
        return false
      }

      // For ASCII labels, validate format directly
      if (/^[a-z0-9-]+$/i.test(label)) {
        // Labels cannot start or end with hyphen
        if (label.startsWith('-') || label.endsWith('-')) {
          return false
        }
      }
      else {
        // For IDN labels, check length after Punycode encoding
        try {
          const punycodeLabel = punycode.encode(label)
          // Account for "xn--" prefix in final length calculation
          if (punycodeLabel.length > this.maxLabelLength - 4) {
            return false
          }
        }
        catch {
          return false
        }
      }
    }

    return true
  }

  // Delegate Punycode validation to the specialized validator
  public validatePunycode(domain: string): boolean {
    return this.punycodeValidator.validatePunycode(domain)
  }

  // Convert domain to Punycode format
  public toPunycode(domain: string): string {
    try {
      return this.domainHandler.toPunycode(domain)
    }
    catch (error) {
      // Handle conversion errors with appropriate error messages
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

  // Convert Punycode domain back to Unicode
  public fromPunycode(domain: string): string {
    try {
      return this.domainHandler.fromPunycode(domain)
    }
    catch (error) {
      // Handle conversion errors with appropriate error messages
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
}
