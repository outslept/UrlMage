import { SecurityError } from '../../errors';
import { SecuritySanitizerOptions, AllowedProtocol, AllowedDomain } from './types';

/**
 * Security sanitizer for URLs
 */
export class SecuritySanitizer {
  private readonly defaultOptions: Required<SecuritySanitizerOptions> = {
    allowedProtocols: ['http:', 'https:'] as AllowedProtocol[],
    allowedDomains: [] as AllowedDomain[],
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
    customSanitizer: (url: string) => url
  };

  /**
   * Create new sanitizer with options
   */
  constructor(private readonly options?: SecuritySanitizerOptions) {}

  /**
   * Sanitize URL according to options
   */
  public sanitize(url: string): string {
    const opts = { ...this.defaultOptions, ...this.options };

    try {
      // Parse URL
      const parsed = new URL(url);

      // Check protocol
      if (opts.allowedProtocols.length && !opts.allowedProtocols.includes(parsed.protocol as AllowedProtocol)) {
        throw new SecurityError('Protocol not allowed', {
          context: { protocol: parsed.protocol, allowed: opts.allowedProtocols }
        });
      }

      // Force HTTPS
      if (opts.forceHttps && parsed.protocol === 'http:') {
        parsed.protocol = 'https:';
      }

      // Check domain
      if (opts.allowedDomains.length) {
        const isAllowed = opts.allowedDomains.some((domain: AllowedDomain) =>
          opts.allowSubdomains
            ? parsed.hostname.endsWith(domain)
            : parsed.hostname === domain
        );
        if (!isAllowed) {
          throw new SecurityError('Domain not allowed', {
            context: { domain: parsed.hostname, allowed: opts.allowedDomains }
          });
        }
      }

      // Strip credentials
      if (opts.stripCredentials) {
        parsed.username = '';
        parsed.password = '';
      }

      // Strip fragment
      if (opts.stripFragment) {
        parsed.hash = '';
      }

      // Strip query
      if (opts.stripQuery) {
        parsed.search = '';
      }

      // Remove www
      if (opts.removeWWW) {
        parsed.hostname = parsed.hostname.replace(/^www\./i, '');
      }

      // Remove default ports
      if (opts.removeDefaultPorts) {
        if ((parsed.protocol === 'http:' && parsed.port === '80') ||
            (parsed.protocol === 'https:' && parsed.port === '443')) {
          parsed.port = '';
        }
      }

      // Remove trailing slash
      if (opts.removeTrailingSlash && parsed.pathname !== '/') {
        parsed.pathname = parsed.pathname.replace(/\/$/, '');
      }

      // Get sanitized URL
      let sanitized = parsed.toString();

      // Encode Unicode
      if (opts.encodeUnicode) {
        sanitized = encodeURI(sanitized);
      }

      // Check length
      if (sanitized.length > opts.maxLength) {
        throw new SecurityError('URL exceeds maximum length', {
          context: { maxLength: opts.maxLength, actualLength: sanitized.length }
        });
      }

      // Run custom sanitizer
      sanitized = opts.customSanitizer(sanitized);

      return sanitized;

    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new SecurityError('Failed to sanitize URL', { cause: error });
      }
      throw error;
    }
  }

  /**
   * Create safe redirect URL
   */
  public createSafeRedirectUrl(baseUrl: string, targetUrl: string): string {
    try {
      // Parse URLs
      const base = new URL(baseUrl);
      const target = new URL(targetUrl);

      // Create safe redirect
      const redirect = new URL(base.toString());
      redirect.searchParams.set('redirect_to', target.toString());

      // Sanitize final URL
      return this.sanitize(redirect.toString());

    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new SecurityError('Failed to create safe redirect URL', { cause: error });
      }
      throw error;
    }
  }
}
