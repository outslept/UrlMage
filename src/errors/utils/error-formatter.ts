import type { BaseError } from '../base-error'

export class ErrorFormatter {
  /**
   * Formats a BaseError instance into a structured object for output
   * @param {BaseError} error - The error to format
   * @returns {Record<string, unknown>} A structured representation of the error
   */
  public format(error: BaseError): Record<string, unknown> {
    return {
      ...error.toJSON(),
      formatted: this.formatMessage(error),
      category: this.getCategory(error),
      severity: this.getSeverity(error),
      metadata: this.getMetadata(error),
    }
  }

  /**
   * Creates a human-readable error message with context
   * @param {BaseError} error - The error to format
   * @returns {string} A formatted error message string
   * @protected
   */
  protected formatMessage(error: BaseError): string {
    const parts: string[] = [error.message]

    // Add error code
    parts.push(`[${error.code}]`)

    // Add error category
    const category = this.getCategory(error)
    if (category) {
      parts.push(`(${category})`)
    }

    // Add cause if present
    if (error.cause) {
      parts.push(`Caused by: ${error.cause.message}`)
    }

    return parts.join(' ')
  }

  /**
   * Determines the category name based on the error code
   * @param {BaseError} error - The error to categorize
   * @returns {string} The category name
   * @protected
   */
  protected getCategory(error: BaseError): string {
    const category = Math.floor(error.code / 100)
    switch (category) {
      case 1:
        return 'Validation'
      case 2:
        return 'Security'
      case 3:
        return 'Parsing'
      case 4:
        return 'Operation'
      case 5:
        return 'Special Service'
      default:
        return 'Unknown'
    }
  }

  /**
   * Determines the severity level based on the error code
   * @param {BaseError} error - The error to evaluate
   * @returns {string} The severity level (critical, error, warning, or info)
   * @protected
   */
  protected getSeverity(error: BaseError): string {
    const category = Math.floor(error.code / 100)
    switch (category) {
      case 1: // Validation
        return 'warning'
      case 2: // Security
        return 'critical'
      case 3: // Parsing
      case 4: // Operation
        return 'error'
      case 5: // Special Service
        return 'info'
      default:
        return 'info'
    }
  }

  /**
   * Extracts additional metadata from the error
   * @param {BaseError} error - The error to extract metadata from
   * @returns {Record<string, unknown>} A structured object containing error metadata
   * @protected
   */
  protected getMetadata(error: BaseError): Record<string, unknown> {
    return {
      timestamp: error.timestamp,
      code: error.code,
      name: error.name,
      details: error.details || {},
      stack: this.formatStack(error.stack),
    }
  }

  /**
   * Formats the stack trace for better readability
   * @param {string} [stack] - The raw stack trace
   * @returns {string[] | undefined} An array of formatted stack lines or undefined if no stack
   * @protected
   */
  protected formatStack(stack?: string): string[] | undefined {
    if (!stack) {
      return undefined
    }

    return stack
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('at '))
  }
}
