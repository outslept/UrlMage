import { ValidationError } from '../errors';

/**
 * URL encoding utilities
 */
export class EncodingUtils {
  /**
   * Encode URL component with custom options
   */
  public static encodeComponent(value: string, options: {
    encodeSlash?: boolean;
    encodeAt?: boolean;
    encodeColon?: boolean;
    encodeDot?: boolean;
    encodeAsterisk?: boolean;
  } = {}): string {
    const {
      encodeSlash = false,
      encodeAt = false,
      encodeColon = false,
      encodeDot = false,
      encodeAsterisk = false
    } = options;

    let encoded = encodeURIComponent(value);

    // Selectively decode certain characters
    if (!encodeSlash) {
      encoded = encoded.replace(/%2F/g, '/');
    }
    if (!encodeAt) {
      encoded = encoded.replace(/%40/g, '@');
    }
    if (!encodeColon) {
      encoded = encoded.replace(/%3A/g, ':');
    }
    if (!encodeDot) {
      encoded = encoded.replace(/%2E/g, '.');
    }
    if (!encodeAsterisk) {
      encoded = encoded.replace(/%2A/g, '*');
    }

    return encoded;
  }

  /**
   * Decode URL component safely
   */
  public static decodeComponent(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Failed to decode component', { cause: error });
      }
      throw error;
    }
  }

  /**
   * Encode query parameter
   */
  public static encodeQueryParam(value: string): string {
    return this.encodeComponent(value, {
      encodeAsterisk: true,
      encodeDot: false,
      encodeColon: true,
      encodeSlash: true,
      encodeAt: true
    });
  }

  /**
   * Encode path segment
   */
  public static encodePathSegment(value: string): string {
    return this.encodeComponent(value, {
      encodeAsterisk: true,
      encodeDot: false,
      encodeColon: true,
      encodeSlash: true,
      encodeAt: true
    });
  }

  /**
   * Encode hostname
   */
  public static encodeHostname(value: string): string {
    return this.encodeComponent(value, {
      encodeAsterisk: true,
      encodeDot: false,
      encodeColon: true,
      encodeSlash: true,
      encodeAt: true
    });
  }

  /**
   * Encode entire URL
   */
  public static encodeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      
      // Encode each component separately
      return `${parsed.protocol}//${
        this.encodeHostname(parsed.hostname)
      }${
        parsed.port ? ':' + parsed.port : ''
      }${
        parsed.pathname.split('/').map(segment => 
          segment ? this.encodePathSegment(segment) : ''
        ).join('/')
      }${
        parsed.search ? '?' + parsed.search.slice(1).split('&').map(param => {
          const [key, value] = param.split('=');
          return `${this.encodeQueryParam(key)}=${
            value ? this.encodeQueryParam(value) : ''
          }`;
        }).join('&') : ''
      }${
        parsed.hash ? '#' + this.encodeComponent(parsed.hash.slice(1)) : ''
      }`;
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Failed to decode URL', { cause: error });
      }
      throw error;
    }
  }

  /**
   * Decode entire URL
   */
  public static decodeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      
      // Decode each component separately
      return `${parsed.protocol}//${
        decodeURIComponent(parsed.hostname)
      }${
        parsed.port ? ':' + parsed.port : ''
      }${
        parsed.pathname.split('/').map(segment => 
          segment ? decodeURIComponent(segment) : ''
        ).join('/')
      }${
        parsed.search ? '?' + parsed.search.slice(1).split('&').map(param => {
          const [key, value] = param.split('=');
          return `${decodeURIComponent(key)}=${
            value ? decodeURIComponent(value) : ''
          }`;
        }).join('&') : ''
      }${
        parsed.hash ? '#' + decodeURIComponent(parsed.hash.slice(1)) : ''
      }`;
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Failed to decode URL', { cause: error });
      }
      throw error;
    }
  }
}
