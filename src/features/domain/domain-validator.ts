import { DomainHandler } from './domain-handler';
import { ValidationError } from '../../errors';

export class DomainValidator {
  private domainHandler: DomainHandler;
  private readonly maxLength = 253;
  private readonly maxLabelLength = 63;

  constructor() {
    this.domainHandler = new DomainHandler();
  }

  /**
   * Validate a domain name
   */
  public validate(domain: string): boolean {
    try {
      // Basic validation
      if (!this.validateLength(domain)) {
        return false;
      }

      if (!this.validateCharacters(domain)) {
        return false;
      }

      if (!this.validateLabels(domain)) {
        return false;
      }

      // Parse domain to validate structure
      this.domainHandler.parse(domain);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate domain length
   */
  private validateLength(domain: string): boolean {
    return domain.length > 0 && domain.length <= this.maxLength;
  }

  /**
   * Validate domain characters
   */
  private validateCharacters(domain: string): boolean {
    // Check for valid characters
    return /^[a-zA-Z0-9.-]+$/.test(domain);
  }

  /**
   * Validate domain labels
   */
  private validateLabels(domain: string): boolean {
    const labels = domain.split('.');

    for (const label of labels) {
      // Check label length
      if (label.length === 0 || label.length > this.maxLabelLength) {
        return false;
      }

      // Check label format
      if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate Punycode domain
   */
  public validatePunycode(domain: string): boolean {
    try {
      const normalizedDomain = this.domainHandler.normalize(domain);
      return this.validate(normalizedDomain);
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(`Invalid Punycode domain: ${error.message}`);
      }
      throw new ValidationError('Invalid Punycode domain: Unknown error');
    }
  }

  /**
   * Convert domain to Punycode
   */
  public toPunycode(domain: string): string {
    try {
      const normalizedDomain = this.domainHandler.normalize(domain);
      return normalizedDomain;
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(`Failed to convert to Punycode: ${error.message}`);
      }
      throw new ValidationError('Failed to convert to Punycode: Unknown error');
    }
  }
}
