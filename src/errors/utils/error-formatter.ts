import { BaseError } from '../base-error';

/**
 * Format errors for output/logging
 */
export class ErrorFormatter {
  /**
   * Format error for output
   */
  public format(error: BaseError): Record<string, unknown> {
    return {
      ...error.toJSON(),
      formatted: this.formatMessage(error),
      category: this.getCategory(error),
      severity: this.getSeverity(error),
      metadata: this.getMetadata(error)
    };
  }

  /**
   * Format error message with context
   */
  protected formatMessage(error: BaseError): string {
    const parts: string[] = [error.message];

    // Add error code
    parts.push(`[${error.code}]`);

    // Add error category
    const category = this.getCategory(error);
    if (category) {
      parts.push(`(${category})`);
    }

    // Add cause if present
    if (error.cause) {
      parts.push(`Caused by: ${error.cause.message}`);
    }

    return parts.join(' ');
  }

  /**
   * Get error category name
   */
  protected getCategory(error: BaseError): string {
    const category = Math.floor(error.code / 1000);
    switch (category) {
      case 1:
        return 'Validation';
      case 2:
        return 'Security';
      case 3:
        return 'Network';
      case 4:
        return 'Resource';
      case 5:
        return 'Internal';
      case 6:
        return 'Feature';
      case 7:
        return 'Integration';
      case 8:
        return 'Data';
      case 9:
        return 'Operation';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get error severity level
   */
  protected getSeverity(error: BaseError): string {
    const category = Math.floor(error.code / 1000);
    switch (category) {
      case 1: // Validation
      case 4: // Resource
        return 'warning';
      case 2: // Security
        return 'critical';
      case 3: // Network
      case 7: // Integration
        return 'error';
      case 5: // Internal
        return 'fatal';
      default:
        return 'info';
    }
  }

  /**
   * Get additional error metadata
   */
  protected getMetadata(error: BaseError): Record<string, unknown> {
    return {
      timestamp: error.timestamp,
      code: error.code,
      name: error.name,
      details: error.details || {},
      stack: this.formatStack(error.stack)
    };
  }

  /**
   * Format error stack trace
   */
  protected formatStack(stack?: string): string[] | undefined {
    if (!stack) {
      return undefined;
    }

    return stack
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('at '));
  }
}
