import { ValidationError } from '../errors'

/**
 * URL validation utilities
 */
export class ValidationUtils {
  /**
   * Validate URL format
   */
  public static validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Invalid URL', { cause: error })
      }
      throw error
    }
  }

  /**
   * Validate hostname format
   */
  public static validateHostname(hostname: string): boolean {
    // RFC 1123 hostname validation
    const pattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    if (!pattern.test(hostname)) {
      throw new ValidationError('Invalid hostname format')
    }
    return true
  }

  /**
   * Validate path format
   */
  public static validatePath(path: string): boolean {
    // Basic path validation
    if (!path.startsWith('/')) {
      throw new ValidationError('Path must start with /')
    }
    return true
  }

  /**
   * Validate query string format
   */
  public static validateQueryString(query: string): boolean {
    try {
      new URLSearchParams(query)
      return true
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Invalid query string', { cause: error })
      }
      throw error
    }
  }

  /**
   * Validate port number
   */
  public static validatePort(port: string | number): boolean {
    const portNum = typeof port === 'string' ? Number.parseInt(port, 10) : port
    if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
      throw new ValidationError('Invalid port number')
    }
    return true
  }
}
