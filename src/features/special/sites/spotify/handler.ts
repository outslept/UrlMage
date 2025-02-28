import type { SpotifyURL } from './types'
import { ValidationError } from '../../../../errors'
import { BaseSpecialSiteHandler } from '../../base/handler'
import { SpotifyURLSchema } from './types'

export class SpotifyHandler extends BaseSpecialSiteHandler {
  name = 'spotify'
  domains = ['open.spotify.com', 'play.spotify.com']

  parse(url: string): SpotifyURL {
    const normalizedUrl = this.normalize(url)
    const parsedUrl = new URL(normalizedUrl)
    const segments = this.getPathSegments(parsedUrl)

    if (segments.length < 2) {
      throw new ValidationError('Invalid Spotify URL: missing type or ID')
    }

    const [type, id, ...rest] = segments

    // Validate type
    if (!SpotifyURLSchema.shape.type.safeParse(type).success) {
      throw new ValidationError(`Invalid Spotify URL type: ${type}`)
    }

    const result: Partial<SpotifyURL> = {
      type: type as SpotifyURL['type'],
      id,
      originalUrl: url,
      isValid: true,
    }

    // Parse additional parameters
    if (type === 'playlist' && rest.length > 0) {
      result.creator = rest[0]
    }

    const market = this.getQueryParam(parsedUrl, 'market')
    if (market) {
      result.market = market
    }

    const position = this.getQueryParam(parsedUrl, 'position')
    if (position) {
      result.position = Number.parseInt(position, 10)
    }

    const context = this.getQueryParam(parsedUrl, 'context')
    if (context) {
      result.context = context
    }

    // Validate with zod schema
    const validated = SpotifyURLSchema.safeParse(result)
    if (!validated.success) {
      throw new ValidationError(`Invalid Spotify URL structure: ${validated.error.message}`)
    }

    return validated.data
  }

  override validate(url: string): boolean {
    if (!super.validate(url)) {
      return false
    }

    try {
      this.parse(url)
      return true
    }
    catch {
      return false
    }
  }
}
