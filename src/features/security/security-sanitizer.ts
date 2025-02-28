import type { AllowedProtocol, SecuritySanitizerOptions } from './types'
import { ErrorCode, SecurityError } from '../../errors'

export class SecuritySanitizer {
  /**
   * Default security options for URL sanitization
   * @private
   * @readonly
   */
  private readonly defaultOptions: Required<SecuritySanitizerOptions> = {
    allowedProtocols: ['http:', 'https:'] as AllowedProtocol[],
    allowedDomains: [],
    allowSubdomains: false,
    stripCredentials: true,
    stripFragment: false,
    stripQuery: false,
    maxLength: 2048,
    encodeUnicode: true,
    removeTrailingSlash: true,
    removeDefaultPorts: true,
    removeWWW: false,
    forceHttps: false,
    customSanitizer: (url: string) => url,
  }

  /**
   * Creates an instance of SecuritySanitizer
   * @param {SecuritySanitizerOptions} [options] - Custom sanitization options
   */
  constructor(private readonly options?: SecuritySanitizerOptions) {}

  /**
   * Sanitizes a URL according to configured security options
   * @param {string} url - The URL to sanitize
   * @returns {string} The sanitized URL
   * @throws {SecurityError} If the URL fails security checks
   */
  public sanitize(url: string): string {
    const opts = { ...this.defaultOptions, ...this.options }

    try {
      // Parse URL
      const parsed = new URL(url)

      // Check protocol
      if (
        opts.allowedProtocols.length
        && !opts.allowedProtocols.includes(parsed.protocol as AllowedProtocol)
      ) {
        throw new SecurityError(
          `Protocol not allowed: ${parsed.protocol}. Allowed protocols: ${opts.allowedProtocols.join(', ')}`,
          ErrorCode.UNSAFE_PROTOCOL,
        )
      }

      // Force HTTPS
      if (opts.forceHttps && parsed.protocol === 'http:') {
        parsed.protocol = 'https:'
      }

      // Check domain
      if (opts.allowedDomains.length) {
        const isAllowed = opts.allowedDomains.some(domain =>
          opts.allowSubdomains
            ? parsed.hostname.endsWith(domain)
            : parsed.hostname === domain,
        )
        if (!isAllowed) {
          throw new SecurityError(
            `Domain not allowed: ${parsed.hostname}. Allowed domains: ${opts.allowedDomains.join(', ')}`,
            ErrorCode.MALICIOUS_URL,
          )
        }
      }

      // Strip credentials
      if (opts.stripCredentials) {
        parsed.username = ''
        parsed.password = ''
      }

      // Strip fragment
      if (opts.stripFragment) {
        parsed.hash = ''
      }

      // Strip query
      if (opts.stripQuery) {
        parsed.search = ''
      }

      // Remove www
      if (opts.removeWWW) {
        parsed.hostname = parsed.hostname.replace(/^www\./i, '')
      }

      // Remove default ports
      if (opts.removeDefaultPorts) {
        if (
          (parsed.protocol === 'http:' && parsed.port === '80')
          || (parsed.protocol === 'https:' && parsed.port === '443')
        ) {
          parsed.port = ''
        }
      }

      // Remove trailing slash
      if (opts.removeTrailingSlash && parsed.pathname !== '/') {
        parsed.pathname = parsed.pathname.replace(/\/$/, '')
      }

      // Get sanitized URL
      let sanitized = parsed.toString()

      // Encode Unicode
      if (opts.encodeUnicode) {
        sanitized = encodeURI(sanitized)
      }

      // Check length
      if (sanitized.length > opts.maxLength) {
        throw new SecurityError(
          `URL exceeds maximum length: ${sanitized.length} > ${opts.maxLength}`,
          ErrorCode.URL_TOO_LONG,
        )
      }

      // Run custom sanitizer
      sanitized = opts.customSanitizer(sanitized)

      return sanitized
    }
    catch (error) {
      if (error instanceof SecurityError) {
        throw error
      }

      const errorMessage
        = error instanceof Error
          ? `Failed to sanitize URL: ${error.message}`
          : 'Failed to sanitize URL: Unknown error'

      throw new SecurityError(errorMessage, ErrorCode.OPERATION_FAILED)
    }
  }

  /**
   * Creates a safe redirect URL by embedding the target URL as a query parameter
   * @param {string} baseUrl - The base URL to redirect through
   * @param {string} targetUrl - The target URL to redirect to
   * @returns {string} A sanitized URL that safely redirects to the target
   * @throws {SecurityError} If the redirect URL creation fails
   */
  public createSafeRedirectUrl(baseUrl: string, targetUrl: string): string {
    try {
      // Parse URLs
      const base = new URL(baseUrl)
      const target = new URL(targetUrl)

      // Create safe redirect
      const redirect = new URL(base.toString())
      redirect.searchParams.set('redirect_to', target.toString())

      // Sanitize final URL
      return this.sanitize(redirect.toString())
    }
    catch (error) {
      if (error instanceof SecurityError) {
        throw error
      }

      // same
      const errorMessage
        = error instanceof Error
          ? `Failed to create safe redirect URL: ${error.message}`
          : 'Failed to create safe redirect URL: Unknown error'

      throw new SecurityError(errorMessage, ErrorCode.OPERATION_FAILED)
    }
  }
}
