/**
 * Error code enumeration for the URL manipulation library
 * @enum {number}
 */
export enum ErrorCode {
  /**
   * Base error code for invalid URL format
   * @type {number}
   */
  INVALID_URL = 100,

  /**
   * Error when URL protocol is invalid
   * @type {number}
   */
  INVALID_PROTOCOL = 101,

  /**
   * Error when hostname is malformed or invalid
   * @type {number}
   */
  INVALID_HOSTNAME = 102,

  /**
   * Error when port number is out of range or invalid
   * @type {number}
   */
  INVALID_PORT = 103,

  /**
   * Error when URL path contains invalid characters or format
   * @type {number}
   */
  INVALID_PATH = 104,

  /**
   * Error when query string has invalid format
   * @type {number}
   */
  INVALID_QUERY = 105,

  /**
   * Error when URL fragment is invalid
   * @type {number}
   */
  INVALID_FRAGMENT = 106,

  /**
   * Error when username or password in URL is invalid
   * @type {number}
   */
  INVALID_CREDENTIALS = 107,

  /**
   * Error when URL exceeds maximum allowed length
   * @type {number}
   */
  URL_TOO_LONG = 108,

  /**
   * Error when IP address is invalid
   * @type {number}
   */
  INVALID_IP = 109,

  /**
   * Error when an operation is not supported
   * @type {number}
   */
  INVALID_OPERATION = 110,

  /**
   * Base error code for security-related issues
   * @type {number}
   */
  SECURITY_RISK = 200,

  /**
   * Error when URL is identified as potentially malicious
   * @type {number}
   */
  MALICIOUS_URL = 201,

  /**
   * Error when URL uses a protocol considered unsafe
   * @type {number}
   */
  UNSAFE_PROTOCOL = 202,

  /**
   * Error when URL contains potential cross-site scripting vectors
   * @type {number}
   */
  POTENTIAL_XSS = 203,

  /**
   * Error when URL represents a potential open redirect vulnerability
   * @type {number}
   */
  OPEN_REDIRECT = 204,

  /**
   * Base error code for URL parsing failures
   * @type {number}
   */
  PARSE_ERROR = 300,

  /**
   * Error when URL encoding fails
   * @type {number}
   */
  ENCODING_ERROR = 301,

  /**
   * Error when URL decoding fails
   * @type {number}
   */
  DECODING_ERROR = 302,

  /**
   * Base error code for general operation failures
   * @type {number}
   */
  OPERATION_FAILED = 400,

  /**
   * Error when attempting an operation not supported by the library
   * @type {number}
   */
  UNSUPPORTED_OPERATION = 401,

  /**
   * Error when requested feature is not yet implemented
   * @type {number}
   */
  FEATURE_NOT_IMPLEMENTED = 402,

  /**
   * Base error code for special service-related errors
   * @type {number}
   */
  SPECIAL_SERVICE_ERROR = 500,

  /**
   * Error when URL refers to a service not supported by the library
   * @type {number}
   */
  UNSUPPORTED_SERVICE = 501,
}
