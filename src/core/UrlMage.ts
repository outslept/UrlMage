// import { z } from 'zod';
// import pMemoize from 'p-memoize';
// import { nanoid } from 'nanoid';
// import { pino } from 'pino';
// OVERHAUL THIS AFTER I SLEEP A BIT
// import { PROTOCOLS, REGEX, URL_VALIDATION } from './constants';
// import {
//   URLComponentsSchema,
//   URLValidationOptionsSchema,
//   QueryValueSchema,
//   QueryParamsSchema,
//   type URLComponents,
//   type URLValidationOptions,
//   type QueryValue,
//   type QueryParams
// } from './types';

// import { FormattingUtils } from '../utils/formatting';
// import { ParsingUtils } from '../utils/parsing';
// import { EncodingUtils } from '../utils/encoding';
// import { PathHandler } from '../features/path/path-handler';
// import type { PathInfo, PathOptions } from '../features/path/types';

// const logger = pino({
//   level: 'info',
//   name: 'urlmage'
// });

// /**
//  * UrlMage - Advanced URL manipulation library
//  */
// export class UrlMage {
//   private url: URL;
//   private readonly id: string;
//   private readonly pathHandler: PathHandler;
//   private readonly options: URLValidationOptions;

//   constructor(url: string, options?: Partial<URLValidationOptions>) {
//     this.options = URLValidationOptionsSchema.parse({
//       ...URLValidationOptionsSchema.parse({}),
//       ...options
//     });

//     try {
//       // Validate and parse URL
//       this.url = new URL(url);
//       this.validateUrl();

//       // Initialize handlers
//       this.pathHandler = new PathHandler();

//       // Generate instance ID
//       this.id = nanoid();

//       logger.debug({ id: this.id, url }, 'Created new UrlMage instance');
//     } catch (error) {
//       logger.error({ url, error }, 'Failed to create UrlMage instance');
//       throw error;
//     }
//   }

//   // Core Methods
//   toString(): string {
//     return this.url.toString();
//   }

//   toJSON(): string {
//     return this.url.toString();
//   }

//   clone(): UrlMage {
//     return new UrlMage(this.url.toString(), this.options);
//   }

//   // Components Methods
//   private getComponentsMemoized = pMemoize((): URLComponents => ({
//     protocol: this.url.protocol as URLComponents['protocol'],
//     hostname: this.url.hostname,
//     port: this.url.port,
//     pathname: this.url.pathname,
//     search: this.url.search,
//     hash: this.url.hash,
//     username: this.url.username,
//     password: this.url.password
//   }));

//   getComponents(): URLComponents {
//     return URLComponentsSchema.parse(this.getComponentsMemoized());
//   }

//   // Path Methods
//   getPathInfo(options?: Partial<PathOptions>): PathInfo {
//     return this.pathHandler.parse(this.url.pathname, options);
//   }

//   setPath(path: string): UrlMage {
//     const normalized = this.pathHandler.normalizePath(path);
//     this.url.pathname = normalized;
//     return this;
//   }

//   appendPath(path: string): UrlMage {
//     const normalized = this.pathHandler.normalizePath(path);
//     this.url.pathname = this.pathHandler.join(this.url.pathname, normalized);
//     return this;
//   }

//   prependPath(path: string): UrlMage {
//     const normalized = this.pathHandler.normalizePath(path);
//     this.url.pathname = this.pathHandler.join(normalized, this.url.pathname);
//     return this;
//   }

//   getPathSegments(): string[] {
//     return this.pathHandler.parse(this.url.pathname).segments.map(s => s.value);
//   }

//   getPathSegment(index: number): string | null {
//     const segments = this.getPathSegments();
//     return segments[index] ?? null;
//   }

//   setPathSegment(index: number, value: string): UrlMage {
//     const segments = this.getPathSegments();
//     if (index >= 0 && index < segments.length) {
//       segments[index] = value;
//       this.url.pathname = '/' + segments.join('/');
//     }
//     return this;
//   }

//   private parseQueryValue(value: QueryValue): string {
//     if (Array.isArray(value)) {
//       return value.map(String).join(',');
//     }
//     return String(value);
//   }

//   addQueryParam(key: string, value: QueryValue): UrlMage {
//     const parsedValue = QueryValueSchema.parse(value);
//     this.url.searchParams.set(key, this.parseQueryValue(parsedValue));
//     logger.debug({ id: this.id, key, value }, 'Added query parameter');
//     return this;
//   }

//   removeQueryParam(key: string): UrlMage {
//     this.url.searchParams.delete(key);
//     logger.debug({ id: this.id, key }, 'Removed query parameter');
//     return this;
//   }

//   getQueryParam(key: string): string | null {
//     return this.url.searchParams.get(key);
//   }

//   hasQueryParam(key: string): boolean {
//     return this.url.searchParams.has(key);
//   }

//   clearQueryParams(): UrlMage {
//     this.url.search = '';
//     logger.debug({ id: this.id }, 'Cleared all query parameters');
//     return this;
//   }

//   setQueryParams(params: QueryParams): UrlMage {
//     const validatedParams = QueryParamsSchema.parse(params);
//     this.clearQueryParams();
//     Object.entries(validatedParams).forEach(([key, value]) => {
//       this.addQueryParam(key, value);
//     });
//     return this;
//   }

//   // Formatting Methods
//   format(options: Parameters<typeof FormattingUtils.formatUrl>[1] = {}): UrlMage {
//     const formatted = FormattingUtils.formatUrl(this.url.toString(), options);
//     this.url = new URL(formatted);
//     return this;
//   }

//   formatForDisplay(options: Parameters<typeof FormattingUtils.formatForDisplay>[1] = {}): string {
//     return FormattingUtils.formatForDisplay(this.url.toString(), options);
//   }

//   formatForSEO(): UrlMage {
//     const formatted = FormattingUtils.formatForSEO(this.url.toString());
//     this.url = new URL(formatted);
//     return this;
//   }

//   // Security Methods
//   private validateUrl(): void {
//     const { allowedProtocols, requireSecure, maxLength, allowCredentials } = this.options;

//     // Check protocol
//     if (!allowedProtocols.includes(this.url.protocol as any)) {
//       throw new Error(`Protocol ${this.url.protocol} is not allowed`);
//     }

//     // Check HTTPS requirement
//     if (requireSecure && this.url.protocol !== 'https:') {
//       throw new Error('HTTPS is required');
//     }

//     // Check URL length
//     if (this.url.toString().length > maxLength) {
//       throw new Error(`URL length exceeds maximum of ${maxLength} characters`);
//     }

//     // Check credentials
//     if (!allowCredentials && (this.url.username || this.url.password)) {
//       throw new Error('Credentials are not allowed');
//     }
//   }

//   removeCredentials(): UrlMage {
//     this.url.username = '';
//     this.url.password = '';
//     logger.debug({ id: this.id }, 'Removed credentials from URL');
//     return this;
//   }

//   toSecure(): UrlMage {
//     this.url.protocol = 'https:';
//     return this;
//   }

//   isSecure(): boolean {
//     return this.url.protocol === 'https:';
//   }

//   // Pattern Matching Methods
//   matches(pattern: string): boolean {
//     try {
//       const urlPattern = new URLPattern(pattern);
//       return urlPattern.test(this.url.toString());
//     } catch {
//       return false;
//     }
//   }
// }
