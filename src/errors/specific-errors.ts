import { BaseError } from './base-error'
import { ErrorCode } from './types'

/**
 * Error thrown when URL validation fails
 * @class ValidationError
 * @extends {BaseError}
 */
export class ValidationError extends BaseError {
  /**
   * Creates an instance of ValidationError
   * @param {string} message - Human-readable description of the validation error
   * @param {ErrorCode} [code] - Specific error code
   * @param {Record<string, unknown>} [details] - Additional contextual information
   * @param {Error} [cause] - Original error that caused this error
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INVALID_URL,
    details?: Record<string, unknown>,
    cause?: Error,
  ) {
    super(message, code, details, cause)
  }
}

/**
 * Error thrown when a security risk is detected
 * @class SecurityError
 * @extends {BaseError}
 */
export class SecurityError extends BaseError {
  /**
   * Creates an instance of SecurityError
   * @param {string} message - Human-readable description of the security error
   * @param {ErrorCode} [code] - Specific error code
   * @param {Record<string, unknown>} [details] - Additional contextual information
   * @param {Error} [cause] - Original error that caused this error
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.SECURITY_RISK,
    details?: Record<string, unknown>,
    cause?: Error,
  ) {
    super(message, code, details, cause)
  }
}

/**
 * Error thrown when URL parsing fails
 * @class ParseError
 * @extends {BaseError}
 */
export class ParseError extends BaseError {
  /**
   * Creates an instance of ParseError
   * @param {string} message - Human-readable description of the parse error
   * @param {ErrorCode} [code] - Specific error code
   * @param {Record<string, unknown>} [details] - Additional contextual information
   * @param {Error} [cause] - Original error that caused this error
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.PARSE_ERROR,
    details?: Record<string, unknown>,
    cause?: Error,
  ) {
    super(message, code, details, cause)
  }
}

/**
 * Error thrown when a URL operation fails
 * @class OperationError
 * @extends {BaseError}
 */
export class OperationError extends BaseError {
  /**
   * Creates an instance of OperationError
   * @param {string} message - Human-readable description of the operation error
   * @param {ErrorCode} [code] - Specific error code
   * @param {Record<string, unknown>} [details] - Additional contextual information
   * @param {Error} [cause] - Original error that caused this error
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.OPERATION_FAILED,
    details?: Record<string, unknown>,
    cause?: Error,
  ) {
    super(message, code, details, cause)
  }
}

/**
 * Error thrown when a special service operation fails
 * @class SpecialServiceError
 * @extends {BaseError}
 */
export class SpecialServiceError extends BaseError {
  /**
   * Creates an instance of SpecialServiceError
   * @param {string} message - Human-readable description of the special service error
   * @param {ErrorCode} [code] - Specific error code
   * @param {Record<string, unknown>} [details] - Additional contextual information
   * @param {Error} [cause] - Original error that caused this error
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.SPECIAL_SERVICE_ERROR,
    details?: Record<string, unknown>,
    cause?: Error,
  ) {
    super(message, code, details, cause)
  }
}
