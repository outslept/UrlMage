import { BaseError } from './base-error';
import { ErrorCode } from './types';

/**
 * Validation Errors
 */
export class ValidationError extends BaseError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, details, cause);
  }
}

export class URLValidationError extends ValidationError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, { ...details, code: ErrorCode.INVALID_URL }, cause);
  }
}

/**
 * Security Errors
 */
export class SecurityError extends BaseError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.SECURITY_ERROR, details, cause);
  }
}

export class BlockedContentError extends SecurityError {
  constructor(
    message: string,
    type: 'protocol' | 'domain' | 'ip',
    value: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    const code = {
      protocol: ErrorCode.BLOCKED_PROTOCOL,
      domain: ErrorCode.BLOCKED_DOMAIN,
      ip: ErrorCode.BLOCKED_IP
    }[type];

    super(message, { ...details, code, blockedValue: value }, cause);
  }
}

/**
 * Network Errors
 */
export class NetworkError extends BaseError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.NETWORK_ERROR, details, cause);
  }
}

export class DNSError extends NetworkError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, { ...details, code: ErrorCode.DNS_ERROR }, cause);
  }
}

/**
 * Resource Errors
 */
export class ResourceError extends BaseError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.RESOURCE_ERROR, details, cause);
  }
}

export class NotFoundError extends ResourceError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, { ...details, code: ErrorCode.NOT_FOUND }, cause);
  }
}

/**
 * Internal Errors
 */
export class InternalError extends BaseError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.INTERNAL_ERROR, details, cause);
  }
}

export class ParseError extends InternalError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, { ...details, code: ErrorCode.PARSE_ERROR }, cause);
  }
}

/**
 * Feature Errors
 */
export class FeatureError extends BaseError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.FEATURE_ERROR, details, cause);
  }
}

export class UnsupportedFeatureError extends FeatureError {
  constructor(
    feature: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(
      `Feature "${feature}" is not supported`,
      { ...details, code: ErrorCode.UNSUPPORTED_FEATURE, feature },
      cause
    );
  }
}

/**
 * Integration Errors
 */
export class IntegrationError extends BaseError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.INTEGRATION_ERROR, details, cause);
  }
}

export class APIError extends IntegrationError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, { ...details, code: ErrorCode.API_ERROR }, cause);
  }
}

/**
 * Data Errors
 */
export class DataError extends BaseError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.DATA_ERROR, details, cause);
  }
}

export class InvalidDataError extends DataError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, { ...details, code: ErrorCode.INVALID_DATA }, cause);
  }
}

/**
 * Operation Errors
 */
export class OperationError extends BaseError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.OPERATION_ERROR, details, cause);
  }
}

export class InvalidOperationError extends OperationError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, { ...details, code: ErrorCode.INVALID_OPERATION }, cause);
  }
}
