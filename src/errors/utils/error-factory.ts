import { BaseError } from '../base-error'
import * as SpecificErrors from '../specific-errors'
import { ErrorCode } from '../types'

export class ErrorFactory {
  /**
   * Creates an appropriate error instance based on the error code
   * @param {ErrorCode} code - The error code to determine the error type
   * @param {string} message - Human-readable description of the error
   * @param {Record<string, unknown>} [details] - Additional contextual information
   * @param {Error} [cause] - Original error that caused this error
   * @returns {BaseError} An instance of the appropriate error class
   */
  public static fromCode(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
    cause?: Error,
  ): BaseError {
    // Find the appropriate error class based on the code category
    const category = Math.floor(code / 100) * 100

    switch (category) {
      case 100: // Validation
        return new SpecificErrors.ValidationError(
          message,
          code,
          details,
          cause,
        )
      case 200: // Security
        return new SpecificErrors.SecurityError(message, code, details, cause)
      case 300: // Parsing
        return new SpecificErrors.ParseError(message, code, details, cause)
      case 400: // Operation
        return new SpecificErrors.OperationError(message, code, details, cause)
      case 500: // Special Service
        return new SpecificErrors.SpecialServiceError(
          message,
          code,
          details,
          cause,
        )
      default:
        return new BaseError(message, code, details, cause)
    }
  }

  /**
   * Converts an unknown error into a BaseError instance
   * @param {unknown} error - The error to convert
   * @returns {BaseError} A BaseError instance representing the original error
   */
  public static fromError(error: unknown): BaseError {
    if (error instanceof BaseError) {
      return error
    }

    if (error instanceof Error) {
      return new BaseError(
        error.message,
        ErrorCode.OPERATION_FAILED,
        { originalError: error.name },
        error,
      )
    }

    return new BaseError(String(error), ErrorCode.OPERATION_FAILED, {
      originalError: typeof error,
    })
  }

  /**
   * Creates a security error for blocked operations
   * @param {"protocol" | "domain" | "ip"} type - The type of entity that was blocked
   * @param {string} value - The value of the blocked entity
   * @param {Record<string, unknown>} [details] - Additional contextual information
   * @param {Error} [cause] - Original error that caused this error
   * @returns {BaseError} A SecurityError instance for the blocked entity
   */
  public static blocked(
    type: 'protocol' | 'domain' | 'ip',
    value: string,
    details?: Record<string, unknown>,
    cause?: Error,
  ): BaseError {
    const code
      = type === 'protocol' ? ErrorCode.UNSAFE_PROTOCOL : ErrorCode.MALICIOUS_URL

    return new SpecificErrors.SecurityError(
      `Blocked ${type}: ${value}`,
      code,
      { ...details, blockedType: type, blockedValue: value },
      cause,
    )
  }

  /**
   * Creates an operation error for unsupported features
   * @param {string} feature - The name of the unsupported feature
   * @param {Record<string, unknown>} [details] - Additional contextual information
   * @param {Error} [cause] - Original error that caused this error
   * @returns {BaseError} An OperationError instance for the unsupported feature
   */
  public static unsupported(
    feature: string,
    details?: Record<string, unknown>,
    cause?: Error,
  ): BaseError {
    return new SpecificErrors.OperationError(
      `Unsupported feature: ${feature}`,
      ErrorCode.UNSUPPORTED_OPERATION,
      { ...details, feature },
      cause,
    )
  }
}
