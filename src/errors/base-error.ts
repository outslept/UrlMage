import type { ErrorCode } from './types'

export class BaseError extends Error {
  /**
   * Error code identifying the type of error
   * @type {ErrorCode}
   * @readonly
   */
  public readonly code: ErrorCode

  /**
   * Timestamp when the error was created
   * @type {Date}
   * @readonly
   */
  public readonly timestamp: Date

  /**
   * Additional contextual information about the error
   * @type {Record<string, unknown>}
   * @readonly
   * @optional
   */
  public readonly details?: Record<string, unknown>

  /**
   * Original error that caused this error
   * @type {Error}
   * @readonly
   * @optional
   */
  public readonly cause?: Error

  /**
   * Creates an instance of BaseError.
   * @param {string} message - Human-readable description of the error
   * @param {ErrorCode} code - Error code identifying the type of error
   * @param {Record<string, unknown>} [details] - Additional contextual information
   * @param {Error} [cause] - Original error that caused this error
   */
  constructor(
    message: string,
    code: ErrorCode,
    details?: Record<string, unknown>,
    cause?: Error,
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.timestamp = new Date()
    this.details = details
    this.cause = cause

    // Ensure proper prototype chain for ES5
    Object.setPrototypeOf(this, new.target.prototype)
  }

  /**
   * Convert error to a plain object for logging/serialization
   * @returns {Record<string, unknown>} JSON-serializable representation of the error
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      details: this.details,
      cause: this.cause?.message,
      stack: this.stack,
    }
  }

  /**
   * Create a new error with additional details
   * @param {Record<string, unknown>} details - Additional details to merge with existing ones
   * @returns {BaseError} New error instance with combined details
   */
  public withDetails(details: Record<string, unknown>): BaseError {
    return new BaseError(
      this.message,
      this.code,
      { ...this.details, ...details },
      this.cause,
    )
  }

  /**
   * Create a new error with additional context message
   * @param {string} context - Context information to prepend to the error message
   * @returns {BaseError} New error instance with updated message
   */
  public withContext(context: string): BaseError {
    return new BaseError(
      `${context}: ${this.message}`,
      this.code,
      this.details,
      this.cause,
    )
  }

  /**
   * Check if error is of a specific type
   * @param {ErrorCode} code - Error code to check against
   * @returns {boolean} True if the error has the specified code
   */
  public is(code: ErrorCode): boolean {
    return this.code === code
  }

  /**
   * Check if error is in a specific category (same hundreds range)
   * @param {number} category - Category number to check against
   * @returns {boolean} True if the error belongs to the specified category
   */
  public isCategory(category: number): boolean {
    return Math.floor(this.code / 100) === Math.floor(category / 100)
  }
}
