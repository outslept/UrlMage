import { ErrorCode } from './types';

/**
 * Base error class for the URL manipulation library
 */
export class BaseError extends Error {
  public readonly code: ErrorCode;
  public readonly timestamp: Date;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: ErrorCode,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.details = details;
    this.cause = cause;

    // Ensure proper prototype chain for ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Convert error to a plain object for logging/serialization
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      details: this.details,
      cause: this.cause?.message,
      stack: this.stack
    };
  }

  /**
   * Create a new error with additional details
   */
  public withDetails(details: Record<string, unknown>): BaseError {
    return new BaseError(
      this.message,
      this.code,
      { ...this.details, ...details },
      this.cause
    );
  }

  /**
   * Create a new error with additional context message
   */
  public withContext(context: string): BaseError {
    return new BaseError(
      `${context}: ${this.message}`,
      this.code,
      this.details,
      this.cause
    );
  }

  /**
   * Check if error is of a specific type
   */
  public is(code: ErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Check if error is in a specific category (same thousands range)
   */
  public isCategory(category: number): boolean {
    return Math.floor(this.code / 1000) === Math.floor(category / 1000);
  }
}
