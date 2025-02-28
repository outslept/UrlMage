import type { PathSegment } from '../types/path'
import * as pathe from 'pathe'

export class PathParser {
  /**
   * Parses a path into an array of segment objects with metadata.
   * Each segment includes position information, special segment flags,
   * and extension data if applicable.
   */
  public parseSegments(path: string): PathSegment[] {
    const rawSegments = path.split('/').filter(Boolean)

    return rawSegments.map((segment, index) => ({
      value: segment,
      index,
      isFirst: index === 0,
      isLast: index === rawSegments.length - 1,
      isDot: segment === '.',
      isDoubleDot: segment === '..',
      hasExtension:
        segment.includes('.') && segment !== '.' && segment !== '..',
      extension: this.getExtension(segment),
    }))
  }

  /**
   * Extracts the file extension from a path segment.
   * Returns undefined for special segments like '.' and '..' or segments without extensions.
   */
  private getExtension(segment: string): string | undefined {
    if (segment === '.' || segment === '..') {
      return undefined
    }

    const parts = segment.split('.')
    if (parts.length > 1) {
      return parts.pop()
    }

    return undefined
  }

  /**
   * Parses a path into its components using the pathe library.
   * Returns an object with dir, root, base, name, and ext properties.
   */
  public parseComponents(path: string) {
    return pathe.parse(path)
  }

  /**
   * Resolves a path by removing dot segments (. and ..).
   * Preserves leading and trailing slashes from the original path.
   */
  public removeDotSegments(path: string): string {
    const segments = path.split('/')
    const result: string[] = []

    for (const segment of segments) {
      if (segment === '.' || segment === '') {
        continue
      }
      if (segment === '..') {
        result.pop()
        continue
      }
      result.push(segment)
    }

    const prefix = path.startsWith('/') ? '/' : ''
    const suffix = path.endsWith('/') && result.length > 0 ? '/' : ''

    return prefix + result.join('/') + suffix
  }
}
