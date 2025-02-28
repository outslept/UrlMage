/**
 * Security risk levels for URL analysis
 * @enum {string}
 */
export enum SecurityRiskLevel {
  /** No security risk detected */
  NONE = 'none',

  /** Low security risk detected */
  LOW = 'low',

  /** Medium security risk detected */
  MEDIUM = 'medium',

  /** High security risk detected */
  HIGH = 'high',

  /** Critical security risk detected */
  CRITICAL = 'critical',
}

/**
 * Options for security scanning of URLs
 * @interface SecurityScanOptions
 */
export interface SecurityScanOptions {
  /** Maximum number of redirects to follow */
  maxRedirects?: number

  /** Timeout in milliseconds for scan operations */
  timeoutMs?: number

  /** User agent string to use for requests */
  userAgent?: string

  /** Whether to follow redirects during scanning */
  followRedirects?: boolean

  /** Whether to check SSL certificate validity */
  checkSsl?: boolean

  /** Whether to perform DNS lookup checks */
  checkDns?: boolean

  /** Whether to check URL against blacklists */
  checkBlacklist?: boolean
}

/**
 * Result of an individual security check
 * @interface SecurityCheckResult
 */
export interface SecurityCheckResult {
  /** Whether the check passed */
  passed: boolean

  /** Risk level associated with this check */
  riskLevel: SecurityRiskLevel

  /** Detailed information about the check result */
  details: string
}

/**
 * Complete result of a security scan
 * @interface SecurityScanResult
 */
export interface SecurityScanResult {
  /** The URL that was scanned */
  url: string

  /** Overall risk level determined from all checks */
  riskLevel: SecurityRiskLevel

  /** Results of individual security checks performed */
  checks: Record<string, SecurityCheckResult>

  /** Unix timestamp when the scan was completed */
  timestamp: number
}

/**
 * Type representing allowed URL protocols
 * Can be common protocols like 'http:' or custom protocol strings
 * @typedef {string} AllowedProtocol
 */
export type AllowedProtocol =
  | 'http:'
  | 'https:'
  | 'ftp:'
  | 'sftp:'
  | 'file:'
  | 'data:'
  | string

/**
 * Options for URL security sanitization
 * @interface SecuritySanitizerOptions
 */
export interface SecuritySanitizerOptions {
  /**
   * List of allowed protocols
   * @default ['http:', 'https:']
   */
  allowedProtocols?: AllowedProtocol[]

  /**
   * List of allowed domains
   * @default []
   */
  allowedDomains?: string[]

  /**
   * Allow subdomains of allowed domains
   * @default false
   */
  allowSubdomains?: boolean

  /**
   * Strip username and password from URL
   * @default true
   */
  stripCredentials?: boolean

  /**
   * Strip fragment (#) from URL
   * @default false
   */
  stripFragment?: boolean

  /**
   * Strip query parameters from URL
   * @default false
   */
  stripQuery?: boolean

  /**
   * Maximum URL length
   * @default 2048
   */
  maxLength?: number

  /**
   * Encode Unicode characters
   * @default true
   */
  encodeUnicode?: boolean

  /**
   * Remove trailing slash from path
   * @default true
   */
  removeTrailingSlash?: boolean

  /**
   * Remove default ports (80 for HTTP, 443 for HTTPS)
   * @default true
   */
  removeDefaultPorts?: boolean

  /**
   * Remove www. from hostname
   * @default false
   */
  removeWWW?: boolean

  /**
   * Force HTTPS protocol
   * @default false
   */
  forceHttps?: boolean

  /**
   * Custom sanitizer function
   * @default (url) => url
   */
  customSanitizer?: (url: string) => string
}
