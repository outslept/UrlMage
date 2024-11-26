import { SpecialSiteHandler, SpecialURL } from './types';
import { ValidationError } from '../../../errors';

export abstract class BaseSpecialSiteHandler implements SpecialSiteHandler {
  abstract name: string;
  abstract domains: string[];

  abstract parse(url: string): SpecialURL;

  validate(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return this.domains.some(domain => 
        parsedUrl.hostname === domain || 
        parsedUrl.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  normalize(url: string): string {
    try {
      const parsedUrl = new URL(url);
      // Convert to lowercase
      parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
      // Remove trailing slash
      parsedUrl.pathname = parsedUrl.pathname.replace(/\/$/, '');
      return parsedUrl.toString();
    } catch {
      throw new ValidationError(`Invalid URL: ${url}`);
    }
  }

  protected getQueryParam(url: URL, param: string): string | undefined {
    return url.searchParams.get(param) || undefined;
  }

  protected getPathSegments(url: URL): string[] {
    return url.pathname.split('/').filter(Boolean);
  }
}
