import { BaseError } from '../base-error';
import { ErrorCode } from '../types';
import * as SpecificErrors from '../specific-errors';

/**
 * Factory for creating error instances
 */
export class ErrorFactory {
  /**
   * Create an error instance from an error code
   */
  public static fromCode(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ): BaseError {
    // Find the appropriate error class based on the code category
    const category = Math.floor(code / 1000) * 1000;
    
    switch (category) {
      case 1000: // Validation
        return new SpecificErrors.ValidationError(message, details, cause);
      case 2000: // Security
        return new SpecificErrors.SecurityError(message, details, cause);
      case 3000: // Network
        return new SpecificErrors.NetworkError(message, details, cause);
      case 4000: // Resource
        return new SpecificErrors.ResourceError(message, details, cause);
      case 5000: // Internal
        return new SpecificErrors.InternalError(message, details, cause);
      case 6000: // Feature
        return new SpecificErrors.FeatureError(message, details, cause);
      case 7000: // Integration
        return new SpecificErrors.IntegrationError(message, details, cause);
      case 8000: // Data
        return new SpecificErrors.DataError(message, details, cause);
      case 9000: // Operation
        return new SpecificErrors.OperationError(message, details, cause);
      default:
        return new BaseError(message, code, details, cause);
    }
  }

  /**
   * Create an error instance from an unknown error
   */
  public static fromError(error: unknown): BaseError {
    if (error instanceof BaseError) {
      return error;
    }

    if (error instanceof Error) {
      return new BaseError(
        error.message,
        ErrorCode.INTERNAL_ERROR,
        { originalError: error.name },
        error
      );
    }

    return new BaseError(
      String(error),
      ErrorCode.INTERNAL_ERROR,
      { originalError: typeof error }
    );
  }

  /**
   * Create an error instance for a blocked operation
   */
  public static blocked(
    type: 'protocol' | 'domain' | 'ip',
    value: string,
    details?: Record<string, unknown>,
    cause?: Error
  ): SpecificErrors.BlockedContentError {
    return new SpecificErrors.BlockedContentError(
      `Blocked ${type}: ${value}`,
      type,
      value,
      details,
      cause
    );
  }

  /**
   * Create an error instance for an unsupported feature
   */
  public static unsupported(
    feature: string,
    details?: Record<string, unknown>,
    cause?: Error
  ): SpecificErrors.UnsupportedFeatureError {
    return new SpecificErrors.UnsupportedFeatureError(feature, details, cause);
  }
}
