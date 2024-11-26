/**
 * Security risk levels
 */
export enum SecurityRiskLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Security scan options
 */
export interface SecurityScanOptions {
  maxRedirects?: number;
  timeoutMs?: number;
  userAgent?: string;
  followRedirects?: boolean;
  checkSsl?: boolean;
  checkDns?: boolean;
  checkBlacklist?: boolean;
}

/**
 * Security check result
 */
export interface SecurityCheckResult {
  passed: boolean;
  riskLevel: SecurityRiskLevel;
  details: string;
}

/**
 * Security scan result
 */
export interface SecurityScanResult {
  url: string;
  riskLevel: SecurityRiskLevel;
  checks: Record<string, SecurityCheckResult>;
  timestamp: number;
}

/**
 * Allowed protocol type
 */
export type AllowedProtocol = 'http:' | 'https:' | 'ftp:' | 'sftp:' | 'file:' | 'data:' | string;

/**
 * Allowed domain type
 */
export type AllowedDomain = string;

/**
 * Security sanitizer options
 */
export interface SecuritySanitizerOptions {
  /**
   * List of allowed protocols
   * @default ['http:', 'https:']
   */
  allowedProtocols?: AllowedProtocol[];

  /**
   * List of allowed domains
   * @default []
   */
  allowedDomains?: AllowedDomain[];

  /**
   * Allow subdomains of allowed domains
   * @default false
   */
  allowSubdomains?: boolean;

  /**
   * Strip username and password from URL
   * @default true
   */
  stripCredentials?: boolean;

  /**
   * Strip fragment (#) from URL
   * @default false
   */
  stripFragment?: boolean;

  /**
   * Strip query parameters from URL
   * @default false
   */
  stripQuery?: boolean;

  /**
   * Maximum URL length
   * @default 2048
   */
  maxLength?: number;

  /**
   * Encode Unicode characters
   * @default true
   */
  encodeUnicode?: boolean;

  /**
   * Remove trailing slash from path
   * @default true
   */
  removeTrailingSlash?: boolean;

  /**
   * Remove default ports (80 for HTTP, 443 for HTTPS)
   * @default true
   */
  removeDefaultPorts?: boolean;

  /**
   * Remove www. from hostname
   * @default false
   */
  removeWWW?: boolean;

  /**
   * Force HTTPS protocol
   * @default false
   */
  forceHttps?: boolean;

  /**
   * Custom sanitizer function
   * @default (url) => url
   */
  customSanitizer?: (url: string) => string;
}
