import punycode from 'node:punycode'
import { ValidationError } from '../../../errors'
import { ErrorCode } from '../../../errors/types'

export class PunycodeUtils {
  // Converts a Unicode domain to its Punycode representation (for DNS compatibility)
  public toPunycode(domain: string): string {
    try {
      // Split the domain into its component parts (by dots)
      const parts = domain.split('.')

      // Process each part separately
      const punycodeparts = parts.map((part) => {
        // Check if the part contains any non-ASCII characters
        if (/[^\x00-\x7F]/.test(part)) {
          // Convert non-ASCII parts to Punycode format with xn-- prefix
          return `xn--${punycode.encode(part)}`
        }
        // Leave ASCII parts unchanged
        return part
      })

      // Rejoin the parts with dots
      return punycodeparts.join('.')
    }
    catch (error) {
      // Handle errors during encoding
      if (error instanceof Error) {
        throw new ValidationError(
          `Failed to convert to Punycode: ${error.message}`,
          ErrorCode.ENCODING_ERROR,
        )
      }
      // Handle unexpected error types
      throw new ValidationError(
        'Failed to convert to Punycode: Unknown error',
        ErrorCode.ENCODING_ERROR,
      )
    }
  }

  // Converts a Punycode domain back to its Unicode representation
  public fromPunycode(domain: string): string {
    try {
      // Split the domain into its component parts
      const parts = domain.split('.')

      // Process each part separately
      const unicodeParts = parts.map((part) => {
        // Check if the part is in Punycode format (starts with xn--)
        if (part.startsWith('xn--')) {
          // Convert Punycode parts back to Unicode, removing the xn-- prefix
          return punycode.decode(part.slice(4))
        }
        // Leave non-Punycode parts unchanged
        return part
      })

      // Rejoin the parts with dots
      return unicodeParts.join('.')
    }
    catch (error) {
      // Handle errors during decoding
      if (error instanceof Error) {
        throw new ValidationError(
          `Failed to convert from Punycode: ${error.message}`,
          ErrorCode.DECODING_ERROR,
        )
      }
      // Handle unexpected error types
      throw new ValidationError(
        'Failed to convert from Punycode: Unknown error',
        ErrorCode.DECODING_ERROR,
      )
    }
  }
}
