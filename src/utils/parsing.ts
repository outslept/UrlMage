import { ValidationError } from '../errors'

/**
 * URL parsing utilities
 */
export class ParsingUtils {
  /**
   * Parse URL into components
   */
  public static parseUrl(url: string): URL {
    try {
      return new URL(url)
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Failed to parse URL', { cause: error })
      }
      throw error
    }
  }

  /**
   * Parse query string into object
   */
  public static parseQueryString(query: string): Record<string, string | string[]> {
    try {
      const params = new URLSearchParams(query)
      const result: Record<string, string | string[]> = {}

      for (const [key, value] of params.entries()) {
        if (key in result) {
          const existing = result[key]
          if (Array.isArray(existing)) {
            existing.push(value)
          }
          else {
            result[key] = [existing, value]
          }
        }
        else {
          result[key] = value
        }
      }

      return result
    }
    catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Failed to parse query string', { cause: error })
      }
      throw error
    }
  }

  /**
   * Parse hostname into parts
   */
  public static parseHostname(hostname: string): {
    subdomain: string
    domain: string
    tld: string
  } {
    const parts = hostname.split('.')
    if (parts.length < 2) {
      throw new ValidationError('Invalid hostname format')
    }

    return {
      subdomain: parts.length > 2 ? parts.slice(0, -2).join('.') : '',
      domain: parts[parts.length - 2],
      tld: parts[parts.length - 1],
    }
  }

  /**
   * Parse path into segments
   */
  public static parsePath(path: string): string[] {
    return path.split('/').filter(Boolean)
  }
}
