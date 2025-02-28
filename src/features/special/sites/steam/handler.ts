import type { SteamURL } from './types'
import { ValidationError } from '../../../../errors'
import { BaseSpecialSiteHandler } from '../../base/handler'
import { SteamURLSchema } from './types'

export class SteamHandler extends BaseSpecialSiteHandler {
  name = 'steam'
  domains = ['store.steampowered.com', 'steamcommunity.com']

  parse(url: string): SteamURL {
    const normalizedUrl = this.normalize(url)
    const parsedUrl = new URL(normalizedUrl)
    const segments = this.getPathSegments(parsedUrl)

    let result: Partial<SteamURL> = {
      originalUrl: url,
      isValid: true,
    }

    // Determine URL type based on hostname and path
    if (parsedUrl.hostname === 'store.steampowered.com') {
      result = this.parseStoreUrl(parsedUrl, segments, result)
    }
    else if (parsedUrl.hostname === 'steamcommunity.com') {
      result = this.parseCommunityUrl(parsedUrl, segments, result)
    }
    else {
      throw new ValidationError(`Invalid Steam domain: ${parsedUrl.hostname}`)
    }

    // Parse common query parameters
    const lang = this.getQueryParam(parsedUrl, 'l')
    if (lang) {
      result.language = lang
    }

    const currency = this.getQueryParam(parsedUrl, 'cc')
    if (currency) {
      result.currency = currency
    }

    // Validate with zod schema
    const validated = SteamURLSchema.safeParse(result)
    if (!validated.success) {
      throw new ValidationError(`Invalid Steam URL structure: ${validated.error.message}`)
    }

    return validated.data
  }

  private parseStoreUrl(url: URL, segments: string[], result: Partial<SteamURL>): Partial<SteamURL> {
    if (segments.length === 0) {
      return { ...result, type: 'store' }
    }

    switch (segments[0]) {
      case 'app':
        if (segments.length < 2) {
          throw new ValidationError('Invalid Steam store app URL: missing app ID')
        }
        return {
          ...result,
          type: 'app',
          appId: segments[1],
          section: segments[2],
          subsection: segments[3],
        }

      case 'market':
        return {
          ...result,
          type: 'market',
          marketHashName: this.getQueryParam(url, 'hash_name'),
        }

      default:
        return {
          ...result,
          type: 'store',
          section: segments[0],
          subsection: segments[1],
        }
    }
  }

  private parseCommunityUrl(url: URL, segments: string[], result: Partial<SteamURL>): Partial<SteamURL> {
    if (segments.length === 0) {
      return { ...result, type: 'community' }
    }

    switch (segments[0]) {
      case 'id':
        if (segments.length < 2) {
          throw new ValidationError('Invalid Steam community ID URL: missing custom URL')
        }
        return {
          ...result,
          type: 'id',
          customUrl: segments[1],
          section: segments[2],
          subsection: segments[3],
        }

      case 'profiles':
        if (segments.length < 2) {
          throw new ValidationError('Invalid Steam profile URL: missing profile ID')
        }
        return {
          ...result,
          type: 'profile',
          profileId: segments[1],
          section: segments[2],
          subsection: segments[3],
        }

      case 'market':
        if (segments.length >= 3 && segments[1] === 'listings') {
          return {
            ...result,
            type: 'market',
            marketListingId: segments[2],
          }
        }
        return {
          ...result,
          type: 'market',
          marketHashName: this.getQueryParam(url, 'hash_name'),
        }

      case 'games':
        return {
          ...result,
          type: 'games',
          gameId: segments[1],
        }

      default:
        return {
          ...result,
          type: 'community',
          section: segments[0],
          subsection: segments[1],
        }
    }
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
