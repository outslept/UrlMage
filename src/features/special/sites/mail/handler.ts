import type { MailURL } from './types'
import { ValidationError } from '../../../../errors'
import { BaseSpecialSiteHandler } from '../../base/handler'
import { MailURLSchema } from './types'

export class MailHandler extends BaseSpecialSiteHandler {
  name = 'mail'
  domains = [
    'mail.google.com',
    'outlook.live.com',
    'outlook.office.com',
    'mail.yahoo.com',
    'mail.proton.me',
  ]

  parse(url: string): MailURL {
    const normalizedUrl = this.normalize(url)
    const parsedUrl = new URL(normalizedUrl)

    // Handle mailto: protocol
    if (parsedUrl.protocol === 'mailto:') {
      return this.parseMailtoUrl(parsedUrl)
    }

    // Handle webmail services
    return this.parseWebmailUrl(parsedUrl)
  }

  private parseMailtoUrl(parsedUrl: URL): MailURL {
    const email = parsedUrl.pathname
    if (!email) {
      throw new ValidationError('Invalid mailto URL: missing email address')
    }

    const searchParams = new URLSearchParams(parsedUrl.search)
    const result: Partial<MailURL> = {
      type: 'mailto',
      email,
      originalUrl: parsedUrl.toString(),
      isValid: true,
      subject: searchParams.get('subject') || undefined,
      body: searchParams.get('body') || undefined,
      cc: searchParams.get('cc') || undefined,
      bcc: searchParams.get('bcc') || undefined,
    }

    // Handle attachments if present
    const attach = searchParams.getAll('attach')
    if (attach.length > 0) {
      result.attachments = attach
    }

    // Validate with zod schema
    const validated = MailURLSchema.safeParse(result)
    if (!validated.success) {
      throw new ValidationError(`Invalid mailto URL structure: ${validated.error.message}`)
    }

    return validated.data
  }

  private parseWebmailUrl(parsedUrl: URL): MailURL {
    const segments = this.getPathSegments(parsedUrl)
    let result: Partial<MailURL> = {
      type: 'webmail',
      originalUrl: parsedUrl.toString(),
      isValid: true,
    }

    // Determine mail service
    if (parsedUrl.hostname.includes('google')) {
      result.service = 'gmail'
      result = this.parseGmailUrl(parsedUrl, segments, result)
    }
    else if (parsedUrl.hostname.includes('outlook')) {
      result.service = 'outlook'
      result = this.parseOutlookUrl(parsedUrl, segments, result)
    }
    else if (parsedUrl.hostname.includes('yahoo')) {
      result.service = 'yahoo'
      result = this.parseYahooUrl(parsedUrl, segments, result)
    }
    else if (parsedUrl.hostname.includes('proton')) {
      result.service = 'protonmail'
      result = this.parseProtonUrl(parsedUrl, segments, result)
    }
    else {
      result.service = 'other'
    }

    // Validate with zod schema
    const validated = MailURLSchema.safeParse(result)
    if (!validated.success) {
      throw new ValidationError(`Invalid webmail URL structure: ${validated.error.message}`)
    }

    return validated.data
  }

  private parseGmailUrl(parsedUrl: URL, segments: string[], result: Partial<MailURL>): Partial<MailURL> {
    if (segments.includes('compose')) {
      return {
        ...result,
        type: 'compose',
        email: this.getQueryParam(parsedUrl, 'to'),
        subject: this.getQueryParam(parsedUrl, 'subject'),
        body: this.getQueryParam(parsedUrl, 'body'),
        cc: this.getQueryParam(parsedUrl, 'cc'),
        bcc: this.getQueryParam(parsedUrl, 'bcc'),
      }
    }

    if (segments.includes('settings')) {
      return {
        ...result,
        type: 'settings',
      }
    }

    return {
      ...result,
      messageId: this.getQueryParam(parsedUrl, 'msgid'),
      searchQuery: this.getQueryParam(parsedUrl, 'q'),
      folder: segments[segments.length - 1],
    }
  }

  private parseOutlookUrl(parsedUrl: URL, segments: string[], result: Partial<MailURL>): Partial<MailURL> {
    if (segments.includes('compose')) {
      return {
        ...result,
        type: 'compose',
        email: this.getQueryParam(parsedUrl, 'to'),
        subject: this.getQueryParam(parsedUrl, 'subject'),
      }
    }

    return {
      ...result,
      messageId: this.getQueryParam(parsedUrl, 'MessageId'),
      folder: segments[segments.length - 1],
    }
  }

  private parseYahooUrl(parsedUrl: URL, segments: string[], result: Partial<MailURL>): Partial<MailURL> {
    if (segments.includes('compose')) {
      return {
        ...result,
        type: 'compose',
        email: this.getQueryParam(parsedUrl, 'to'),
        subject: this.getQueryParam(parsedUrl, 'subject'),
      }
    }

    return {
      ...result,
      messageId: this.getQueryParam(parsedUrl, 'mid'),
      folder: segments[segments.length - 1],
    }
  }

  private parseProtonUrl(parsedUrl: URL, segments: string[], result: Partial<MailURL>): Partial<MailURL> {
    if (segments.includes('compose')) {
      return {
        ...result,
        type: 'compose',
        email: this.getQueryParam(parsedUrl, 'to'),
        subject: this.getQueryParam(parsedUrl, 'subject'),
      }
    }

    return {
      ...result,
      messageId: this.getQueryParam(parsedUrl, 'id'),
      folder: segments[segments.length - 1],
    }
  }

  override validate(url: string): boolean {
    if (!super.validate(url)) {
      // Special case for mailto: protocol
      if (url.startsWith('mailto:')) {
        try {
          this.parse(url)
          return true
        }
        catch {
          return false
        }
      }
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
