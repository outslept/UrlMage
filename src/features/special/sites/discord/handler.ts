import { BaseSpecialSiteHandler } from '../../base/handler';
import { DiscordURL, DiscordURLSchema } from './types';
import { ValidationError } from '../../../../errors';

export class DiscordHandler extends BaseSpecialSiteHandler {
  name = 'discord';
  domains = ['discord.com', 'discord.gg'];

  parse(url: string): DiscordURL {
    const normalizedUrl = this.normalize(url);
    const parsedUrl = new URL(normalizedUrl);
    const segments = this.getPathSegments(parsedUrl);

    let result: Partial<DiscordURL> = {
      type: 'channels',
      originalUrl: url,
      isValid: true
    };

    if (parsedUrl.hostname === 'discord.gg') {
      result = {
        ...result,
        type: 'invite',
        inviteCode: segments[0]
      };
    } else {
      switch (segments[0]) {
        case 'channels':
          if (segments.length >= 2) {
            result = {
              ...result,
              type: 'channels',
              guildId: segments[1],
              channelId: segments[2],
              messageId: segments[3]
            };
          }
          break;

        case 'users':
          result = {
            ...result,
            type: 'users',
            userId: segments[1]
          };
          break;

        case 'invite':
          result = {
            ...result,
            type: 'invite',
            inviteCode: segments[1]
          };
          break;

        default:
          throw new ValidationError(`Invalid Discord URL path: ${parsedUrl.pathname}`);
      }
    }

    // Validate with zod schema
    const validated = DiscordURLSchema.safeParse(result);
    if (!validated.success) {
      throw new ValidationError(`Invalid Discord URL structure: ${validated.error.message}`);
    }

    return validated.data;
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
