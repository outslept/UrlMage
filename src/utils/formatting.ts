import { ValidationError } from '../errors';

/**
 * URL formatting utilities
 */
export class FormattingUtils {
  /**
   * Format URL with options
   */
  public static formatUrl(url: string, options: {
    trimSlashes?: boolean;
    toLowerCase?: boolean;
    removeTrailingSlash?: boolean;
    removeDefaultPort?: boolean;
    removeWWW?: boolean;
    removeFragment?: boolean;
    sortQueryParams?: boolean;
    removeEmptyQueryParams?: boolean;
  } = {}): string {
    const {
      trimSlashes = true,
      toLowerCase = true,
      removeTrailingSlash = true,
      removeDefaultPort = true,
      removeWWW = false,
      removeFragment = false,
      sortQueryParams = false,
      removeEmptyQueryParams = true
    } = options;

    try {
      const parsed = new URL(url);

      // Apply transformations
      let formatted = url;

      if (toLowerCase) {
        formatted = formatted.toLowerCase();
      }

      if (removeDefaultPort) {
        formatted = this.removeDefaultPorts(formatted);
      }

      if (removeWWW) {
        formatted = formatted.replace(/^(https?:\/\/)www\./i, '$1');
      }

      if (removeFragment) {
        formatted = formatted.split('#')[0];
      }

      if (sortQueryParams) {
        formatted = this.sortQueryParameters(formatted);
      }

      if (removeEmptyQueryParams) {
        formatted = this.removeEmptyParameters(formatted);
      }

      if (trimSlashes) {
        formatted = formatted.replace(/([^:]\/)\/+/g, '$1');
      }

      if (removeTrailingSlash) {
        formatted = formatted.replace(/\/+$/, '');
      }

      return formatted;

    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Failed to format URL', { cause: error });
      }
      throw error;
    }
  }

  /**
   * Remove default ports from URL
   */
  private static removeDefaultPorts(url: string): string {
    return url.replace(/(:80\/|:443\/)/g, '/');
  }

  /**
   * Sort query parameters alphabetically
   */
  private static sortQueryParameters(url: string): string {
    const [base, query] = url.split('?');
    if (!query) return url;

    const params = query.split('&').sort();
    return `${base}?${params.join('&')}`;
  }

  /**
   * Remove empty query parameters
   */
  private static removeEmptyParameters(url: string): string {
    const [base, query] = url.split('?');
    if (!query) return url;

    const params = query.split('&').filter(param => {
      const [, value] = param.split('=');
      return value !== undefined && value !== '';
    });

    return params.length ? `${base}?${params.join('&')}` : base;
  }
}