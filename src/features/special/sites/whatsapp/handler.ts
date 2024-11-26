import { BaseSpecialSiteHandler } from '../../base/handler';
import { WhatsAppURL, WhatsAppURLSchema } from './types';
import { ValidationError } from '../../../../errors';

export class WhatsAppHandler extends BaseSpecialSiteHandler {
  name = 'whatsapp';
  domains = ['wa.me', 'api.whatsapp.com', 'chat.whatsapp.com'];

  parse(url: string): WhatsAppURL {
    const normalizedUrl = this.normalize(url);
    const parsedUrl = new URL(normalizedUrl);
    const segments = this.getPathSegments(parsedUrl);

    let result: Partial<WhatsAppURL> = {
      originalUrl: url,
      isValid: true
    };

    // Handle different WhatsApp domains
    switch (parsedUrl.hostname) {
      case 'chat.whatsapp.com':
        // Group invite links
        if (segments.length === 0) {
          throw new ValidationError('Invalid WhatsApp group URL: missing group ID');
        }
        result = {
          ...result,
          type: 'group',
          groupId: segments[0]
        };
        break;

      case 'wa.me':
      case 'api.whatsapp.com':
        if (segments.length === 0) {
          throw new ValidationError('Invalid WhatsApp URL: missing phone number or action');
        }

        if (segments[0] === 'send' || segments[0] === 'share') {
          // Handle send/share URLs
          result = {
            ...result,
            type: segments[0]
          };

          if (segments[0] === 'send') {
            const phone = segments[1];
            if (phone) {
              result.phoneNumber = this.normalizePhoneNumber(phone);
            }
            result.text = this.getQueryParam(parsedUrl, 'text');
          } else {
            result.shareText = this.getQueryParam(parsedUrl, 'text');
            result.shareUrl = this.getQueryParam(parsedUrl, 'url');
          }
        } else {
          // Handle direct chat URLs
          result = {
            ...result,
            type: 'chat',
            phoneNumber: this.normalizePhoneNumber(segments[0]),
            text: this.getQueryParam(parsedUrl, 'text')
          };
        }
        break;

      default:
        throw new ValidationError(`Invalid WhatsApp domain: ${parsedUrl.hostname}`);
    }

    // Validate with zod schema
    const validated = WhatsAppURLSchema.safeParse(result);
    if (!validated.success) {
      throw new ValidationError(`Invalid WhatsApp URL structure: ${validated.error.message}`);
    }

    return validated.data;
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove any non-digit characters
    return phone.replace(/\\D/g, '');
  }

  override validate(url: string): boolean {
    if (!super.validate(url)) {
      return false;
    }

    try {
      this.parse(url);
      return true;
    } catch {
      return false;
    }
  }
}
