import { ValidationError } from '../../errors';
import { PathInfo, PathSegment, PathOptions } from './types';
import { normalize, join, resolve, isAbsolute, relative, parse, format } from 'path';

/**
 * Handler for URL path operations
 */
export class PathHandler {
  private readonly defaultOptions: PathOptions = {
    normalizeSlashes: true,
    removeTrailingSlash: true,
    decodeComponents: true,
    removeEmptySegments: true,
    removeDotSegments: true
  };

  /**
   * Parse and normalize a URL path
   */
  public parse(path: string, options?: Partial<PathOptions>): PathInfo {
    const opts = { ...this.defaultOptions, ...options };
    let normalizedPath = this.normalizePath(path, opts);

    // Parse path into segments
    const segments = this.parseSegments(normalizedPath, opts);

    // Get path properties
    const isRoot = normalizedPath === '/' || normalizedPath === '';
    const isAbsolutePath = normalizedPath.startsWith('/');
    const hasTrailingSlash = normalizedPath.endsWith('/');

    // Parse path components
    const { dir, base, ext, name } = parse(normalizedPath);

    return {
      original: path,
      normalized: normalizedPath,
      segments,
      isRoot,
      isAbsolute: isAbsolutePath,
      hasTrailingSlash,
      directory: dir,
      base,
      extension: ext,
      name
    };
  }

  /**
   * Normalize a URL path
   */
  public normalizePath(path: string, options?: Partial<PathOptions>): string {
    const opts = { ...this.defaultOptions, ...options };
    let normalized = path;

    // Decode URI components if needed
    if (opts.decodeComponents) {
      try {
        normalized = decodeURIComponent(normalized);
      } catch (error) {
        throw new ValidationError(`Invalid URL encoding in path: ${path}`);
      }
    }

    // Normalize slashes
    if (opts.normalizeSlashes) {
      normalized = normalized.replace(/\\/g, '/');
      normalized = normalized.replace(/\/+/g, '/');
    }

    // Remove empty segments
    if (opts.removeEmptySegments) {
      normalized = normalized.replace(/\/\//g, '/');
    }

    // Remove dot segments
    if (opts.removeDotSegments) {
      normalized = this.removeDotSegments(normalized);
    }

    // Remove trailing slash if needed
    if (opts.removeTrailingSlash && normalized.endsWith('/') && normalized !== '/') {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }

  /**
   * Join path segments
   */
  public join(...paths: string[]): string {
    return join(...paths).replace(/\\/g, '/');
  }

  /**
   * Resolve path segments
   */
  public resolve(...paths: string[]): string {
    return resolve(...paths).replace(/\\/g, '/');
  }

  /**
   * Get relative path
   */
  public relative(from: string, to: string): string {
    return relative(from, to).replace(/\\/g, '/');
  }

  /**
   * Check if path is absolute
   */
  public isAbsolute(path: string): boolean {
    return isAbsolute(path) || path.startsWith('/');
  }

  /**
   * Format path from components
   */
  public format(pathInfo: Partial<PathInfo>): string {
    return format({
      dir: pathInfo.directory || '',
      base: pathInfo.base || '',
      ext: pathInfo.extension || '',
      name: pathInfo.name || ''
    });
  }

  /**
   * Parse path into segments
   */
  private parseSegments(path: string, options: PathOptions): PathSegment[] {
    // Split path into segments
    const rawSegments = path.split('/').filter(Boolean);
    
    return rawSegments.map((segment, index) => ({
      value: segment,
      index,
      isFirst: index === 0,
      isLast: index === rawSegments.length - 1,
      isDot: segment === '.',
      isDoubleDot: segment === '..',
      hasExtension: segment.includes('.'),
      extension: segment.includes('.') ? segment.split('.').pop()! : undefined
    }));
  }

  /**
   * Remove dot segments from path
   */
  private removeDotSegments(path: string): string {
    const segments = path.split('/');
    const result: string[] = [];

    for (const segment of segments) {
      if (segment === '.' || segment === '') {
        continue;
      }
      if (segment === '..') {
        result.pop();
        continue;
      }
      result.push(segment);
    }

    // Preserve leading slash
    const prefix = path.startsWith('/') ? '/' : '';
    
    // Preserve trailing slash
    const suffix = path.endsWith('/') ? '/' : '';

    return prefix + result.join('/') + suffix;
  }

  /**
   * Extract parent path
   */
  public getParentPath(path: string): string {
    const info = this.parse(path);
    if (info.isRoot) {
      return '';
    }
    return info.directory || '/';
  }

  /**
   * Get path depth
   */
  public getDepth(path: string): number {
    const info = this.parse(path);
    return info.segments.length;
  }

  /**
   * Check if one path contains another
   */
  public contains(parentPath: string, childPath: string): boolean {
    const normalizedParent = this.normalizePath(parentPath);
    const normalizedChild = this.normalizePath(childPath);
    
    if (normalizedParent === '/') {
      return true;
    }

    return normalizedChild.startsWith(normalizedParent + '/');
  }

  /**
   * Get common path prefix
   */
  public getCommonPrefix(paths: string[]): string {
    if (paths.length === 0) {
      return '';
    }

    const normalized = paths.map(path => this.normalizePath(path));
    const parts = normalized[0].split('/');
    const result: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (normalized.every(path => path.split('/')[i] === part)) {
        result.push(part);
      } else {
        break;
      }
    }

    return result.join('/');
  }
}
