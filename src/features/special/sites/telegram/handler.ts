import type { TelegramURL } from './types'
import { ValidationError } from '../../../../errors'
import { BaseSpecialSiteHandler } from '../../base/handler'
import { TelegramURLSchema } from './types'

export class TelegramHandler extends BaseSpecialSiteHandler {
  name = 'telegram'
  domains = ['t.me', 'telegram.me', 'telegram.dog']

  parse(url: string): TelegramURL {
    const normalizedUrl = this.normalize(url)
    const parsedUrl = new URL(normalizedUrl)
    const segments = this.getPathSegments(parsedUrl)

    if (segments.length === 0) {
      throw new ValidationError('Invalid Telegram URL: missing path segments')
    }

    const [firstSegment, ...rest] = segments

    let result: TelegramURL

    // Handle special paths
    switch (firstSegment) {
      case 'joinchat':
        if (rest.length === 0) {
          throw new ValidationError('Invalid Telegram join chat URL: missing chat identifier')
        }
        result = TelegramURLSchema.parse({
          type: 'joinchat',
          identifier: rest[0],
          originalUrl: url,
          isValid: true,
        })
        break

      case 'addstickers':
        if (rest.length === 0) {
          throw new ValidationError('Invalid Telegram sticker URL: missing set name')
        }
        result = TelegramURLSchema.parse({
          type: 'addstickers',
          identifier: rest[0],
          setName: rest[0],
          originalUrl: url,
          isValid: true,
        })
        break

      case 'share':
        result = TelegramURLSchema.parse({
          type: 'share',
          identifier: firstSegment,
          shareUrl: this.getQueryParam(parsedUrl, 'url') || '',
          shareText: this.getQueryParam(parsedUrl, 'text'),
          originalUrl: url,
          isValid: true,
        })
        break

      case 'proxy':
        result = TelegramURLSchema.parse({
          type: 'proxy',
          identifier: firstSegment,
          server: this.getQueryParam(parsedUrl, 'server'),
          port: this.getQueryParam(parsedUrl, 'port'),
          secret: this.getQueryParam(parsedUrl, 'secret'),
          originalUrl: url,
          isValid: true,
        })
        break

      default:
        // Handle channel/user/group URLs
        const baseResult = {
          identifier: firstSegment,
          originalUrl: url,
          isValid: true,
          type: firstSegment.startsWith('@')
            ? 'user'
            : firstSegment.startsWith('+')
              ? 'group'
              : 'channel' as const,
        }

        // Add optional parameters
        const extendedResult: Record<string, any> = { ...baseResult }

        if (rest.length > 0) {
          extendedResult.messageId = rest[0]
          if (rest.length > 1) {
            extendedResult.threadId = rest[1]
            if (rest.length > 2) {
              extendedResult.comment = rest[2]
            }
          }
        }

        const startParam = this.getQueryParam(parsedUrl, 'start')
        if (startParam) {
          extendedResult.startParam = startParam
        }

        // Validate with schema
        result = TelegramURLSchema.parse(extendedResult)
        break
    }

    return result
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
