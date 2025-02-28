import { isIP } from 'node:net'
import punycode from 'node:punycode'
import { ValidationError } from '../../errors'
import { ErrorCode } from '../../errors/types'
import { DomainHandler } from './domain-handler'

/**
 * Class for validating domain names according to DNS standards
 * @class DomainValidator
 */
export class DomainValidator {
  /** Handler for domain operations */
  private domainHandler: DomainHandler

  /** Maximum allowed length of a domain name (253 characters) */
  private readonly maxLength = 253

  /** Maximum allowed length of a domain label/segment (63 characters) */
  private readonly maxLabelLength = 63

  /**
   * Creates an instance of DomainValidator
   */
  constructor() {
    this.domainHandler = new DomainHandler()
  }

  /**
   * Validates a domain name for correctness
   * @param {string} domain - The domain name to validate
   * @returns {boolean} True if the domain is valid
   */
  public validate(domain: string): boolean {
    try {
      // Check if it's an IP address
      if (isIP(domain)) {
        return true
      }

      // Check domain length
      if (!this.validateLength(domain)) {
        return false
      }

      // Check allowed characters
      if (!this.validateCharacters(domain)) {
        return false
      }

      // Check domain labels
      if (!this.validateLabels(domain)) {
        return false
      }

      // Attempt to parse the domain
      this.domainHandler.parse(domain)

      return true
    }
    catch {
      return false
    }
  }

  /**
   * Validates the length of a domain name
   * @param {string} domain - The domain to check
   * @returns {boolean} True if the domain length is valid
   * @private
   */
  private validateLength(domain: string): boolean {
    return domain.length > 0 && domain.length <= this.maxLength
  }

  /**
   * Validates the characters used in a domain name
   * @param {string} domain - The domain to check
   * @returns {boolean} True if all characters are valid
   * @private
   */
  private validateCharacters(domain: string): boolean {
    // Basic check for ASCII domains
    if (/^[a-z0-9.-]+$/i.test(domain)) {
      return true
    }

    // Check for internationalized domain names
    try {
      const punycodeVersion = this.domainHandler.toPunycode(domain)
      return /^[a-z0-9.-]+$/i.test(punycodeVersion)
    }
    catch {
      return false
    }
  }

  /**
   * Validates each label (segment) of a domain name
   * @param {string} domain - The domain to check
   * @returns {boolean} True if all labels are valid
   * @private
   */
  private validateLabels(domain: string): boolean {
    const labels = domain.split('.')

    // Must have at least one label
    if (labels.length < 1) {
      return false
    }

    for (const label of labels) {
      // Check label length
      if (label.length === 0 || label.length > this.maxLabelLength) {
        return false
      }

      // For ASCII labels
      if (/^[a-z0-9-]+$/i.test(label)) {
        // Label must not start or end with a hyphen
        if (label.startsWith('-') || label.endsWith('-')) {
          return false
        }
      }
      else {
        // For internationalized labels
        try {
          const punycodeLabel = punycode.encode(label)
          if (punycodeLabel.length > this.maxLabelLength - 4) {
            // Account for 'xn--' prefix
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

  /**
   * Validates a Punycode-encoded domain name
   * @param {string} domain - The Punycode domain to validate
   * @returns {boolean} True if the Punycode domain is valid
   * @throws {ValidationError} If validation fails
   */
  public validatePunycode(domain: string): boolean {
    try {
      // Check if domain contains Punycode labels
      const hasPunycodeLabels = domain
        .split('.')
        .some(label => label.startsWith('xn--'))

      if (!hasPunycodeLabels) {
        // If no Punycode labels, validate as a regular domain
        return this.validate(domain)
      }

      // Try to convert from Punycode and validate the result
      const unicodeDomain = this.domainHandler.fromPunycode(domain)
      const normalizedDomain = this.domainHandler.normalize(unicodeDomain)

      // Check both the unicode domain and punycode format
      return (
        this.validate(normalizedDomain) && this.validatePunycodeFormat(domain)
      )
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(
          `Invalid Punycode domain: ${error.message}`,
          ErrorCode.INVALID_HOSTNAME,
        )
      }
      throw new ValidationError(
        'Invalid Punycode domain: Unknown error',
        ErrorCode.INVALID_HOSTNAME,
      )
    }
  }

  /**
   * Validates the format of Punycode labels in a domain
   * @param {string} domain - The domain with Punycode labels to check
   * @returns {boolean} True if all Punycode labels have correct format
   * @private
   */
  private validatePunycodeFormat(domain: string): boolean {
    const labels = domain.split('.')

    for (const label of labels) {
      if (label.startsWith('xn--')) {
        // Validate Punycode label format
        try {
          // Decode the Punycode
          const decoded = punycode.decode(label.slice(4))

          // Check that decoded label is not empty
          if (decoded.length === 0) {
            return false
          }

          // Check that decoded label contains at least one non-ASCII character
          // (otherwise there's no point using Punycode)
          if (!/[^\x00-\x7F]/.test(decoded)) {
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

  /**
   * Converts a domain to Punycode representation
   * @param {string} domain - The domain to convert
   * @returns {string} Punycode-encoded domain
   * @throws {ValidationError} If conversion fails
   */
  public toPunycode(domain: string): string {
    try {
      return this.domainHandler.toPunycode(domain)
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
   * Converts a Punycode domain to Unicode representation
   * @param {string} domain - The Punycode domain to convert
   * @returns {string} Unicode domain
   * @throws {ValidationError} If conversion fails
   */
  public fromPunycode(domain: string): string {
    try {
      return this.domainHandler.fromPunycode(domain)
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
}
