import { BaseSpecialSiteHandler } from '../../base/handler';
import { PlayMarketURL, PlayMarketURLSchema } from './types';
import { ValidationError } from '../../../../errors';

export class PlayMarketHandler extends BaseSpecialSiteHandler {
  name = 'playmarket';
  domains = ['play.google.com'];

  parse(url: string): PlayMarketURL {
    const normalizedUrl = this.normalize(url);
    const parsedUrl = new URL(normalizedUrl);
    const segments = this.getPathSegments(parsedUrl);

    if (segments.length === 0 || segments[0] !== 'store') {
      throw new ValidationError('Invalid Play Market URL: must start with /store');
    }

    if (segments.length < 2) {
      throw new ValidationError('Invalid Play Market URL: missing section after /store');
    }

    let result: Partial<PlayMarketURL> = {
      originalUrl: url,
      isValid: true
    };

    switch (segments[1]) {
      case 'apps':
        result = this.parseAppsUrl(segments.slice(2), parsedUrl, result);
        break;

      case 'movies':
      case 'books':
      case 'music':
        result = {
          ...result,
          type: segments[1],
          category: segments[2],
          collectionId: segments[3]
        };
        break;

      default:
        throw new ValidationError(`Invalid Play Market section: ${segments[1]}`);
    }

    // Parse common query parameters
    const lang = this.getQueryParam(parsedUrl, 'hl');
    if (lang) {
      result.language = lang;
    }

    const country = this.getQueryParam(parsedUrl, 'gl');
    if (country) {
      result.country = country;
    }

    // Validate with zod schema
    const validated = PlayMarketURLSchema.safeParse(result);
    if (!validated.success) {
      throw new ValidationError(`Invalid Play Market URL structure: ${validated.error.message}`);
    }

    return validated.data;
  }

  private parseAppsUrl(
    segments: string[],
    parsedUrl: URL,
    result: Partial<PlayMarketURL>
  ): Partial<PlayMarketURL> {
    if (segments.length === 0) {
      return { ...result, type: 'app' };
    }

    switch (segments[0]) {
      case 'details':
        const packageId = this.getQueryParam(parsedUrl, 'id');
        if (!packageId) {
          throw new ValidationError('Invalid Play Market app URL: missing package ID');
        }
        return {
          ...result,
          type: 'app',
          packageName: packageId,
          reviewId: this.getQueryParam(parsedUrl, 'reviewId')
        };

      case 'dev':
        const devId = this.getQueryParam(parsedUrl, 'id');
        if (!devId) {
          throw new ValidationError('Invalid Play Market developer URL: missing developer ID');
        }
        return {
          ...result,
          type: 'developer',
          developerId: devId
        };

      case 'collection':
        if (segments.length < 2) {
          throw new ValidationError('Invalid Play Market collection URL: missing collection ID');
        }
        return {
          ...result,
          type: 'collection',
          collectionId: segments[1]
        };

      case 'search':
        return {
          ...result,
          type: 'search',
          query: this.getQueryParam(parsedUrl, 'q'),
          price: this.getQueryParam(parsedUrl, 'price'),
          rating: this.getQueryParam(parsedUrl, 'rating')
        };

      default:
        throw new ValidationError(`Invalid Play Market apps section: ${segments[0]}`);
    }
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
