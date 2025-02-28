import type { PathInfo, PathOptions, PathSegment } from './types'
import * as pathe from 'pathe'
import { ValidationError } from '../../errors'
import { ErrorCode } from '../../errors/types'

export class PathHandler {
  /**
   * Default options for path processing
   * @private
   * @readonly
   */
  private readonly defaultOptions: PathOptions = {
    normalizeSlashes: true,
    removeTrailingSlash: true,
    decodeComponents: true,
    removeEmptySegments: true,
    removeDotSegments: true,
  }

  /**
   * Parses a path and returns detailed information about it
   * @param {string} path - The path to parse
   * @param {Partial<PathOptions>} [options] - Options for path processing
   * @returns {PathInfo} Detailed information about the path
   */
  public parse(path: string, options?: Partial<PathOptions>): PathInfo {
    const opts = { ...this.defaultOptions, ...options }

    // Normalize the path according to options
    const normalizedPath = this.normalizePath(path, opts)

    // Get path segments
    const segments = this.parseSegments(normalizedPath)

    // Determine path properties
    const isRoot = normalizedPath === '/' || normalizedPath === ''
    const isAbsolutePath = normalizedPath.startsWith('/')
    const hasTrailingSlash = normalizedPath.endsWith('/')

    // Parse path components
    const { dir, base, ext, name } = pathe.parse(normalizedPath)

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
      name,
    }
  }

  /**
   * Normalizes a path according to options
   * @param {string} path - The path to normalize
   * @param {Partial<PathOptions>} [options] - Options for path normalization
   * @returns {string} The normalized path
   * @throws {ValidationError} If decoding fails
   */
  public normalizePath(path: string, options?: Partial<PathOptions>): string {
    const opts = { ...this.defaultOptions, ...options }
    let normalized = path

    // Decode URL components if needed
    if (opts.decodeComponents) {
      try {
        normalized = decodeURIComponent(normalized)
      }
      catch (error) {
        throw new ValidationError(
          `Invalid URL encoding in path: ${path}`,
          ErrorCode.DECODING_ERROR,
        )
      }
    }

    // Normalize slashes (use forward slashes instead of backslashes)
    if (opts.normalizeSlashes) {
      normalized = pathe.normalize(normalized)
      // Additionally replace multiple slashes with a single one
      normalized = normalized.replace(/\/+/g, '/')
    }

    // Remove empty segments
    if (opts.removeEmptySegments) {
      normalized = normalized.replace(/\/\//g, '/')
    }

    // Remove dot segments (., ..)
    if (opts.removeDotSegments) {
      normalized = this.removeDotSegments(normalized)
    }

    // Remove trailing slash if needed
    if (
      opts.removeTrailingSlash
      && normalized.endsWith('/')
      && normalized !== '/'
    ) {
      normalized = normalized.slice(0, -1)
    }

    return normalized
  }

  /**
   * Joins multiple path segments
   * @param {...string} paths - Path segments to join
   * @returns {string} The joined path
   */
  public join(...paths: string[]): string {
    return pathe.join(...paths)
  }

  /**
   * Resolves relative paths to absolute
   * @param {...string} paths - Path segments to resolve
   * @returns {string} The resolved absolute path
   */
  public resolve(...paths: string[]): string {
    return pathe.resolve(...paths)
  }

  /**
   * Computes a relative path from one path to another
   * @param {string} from - Source path
   * @param {string} to - Target path
   * @returns {string} The relative path
   */
  public relative(from: string, to: string): string {
    return pathe.relative(from, to)
  }

  /**
   * Checks if a path is absolute
   * @param {string} path - The path to check
   * @returns {boolean} True if the path is absolute
   */
  public isAbsolute(path: string): boolean {
    return pathe.isAbsolute(path)
  }

  /**
   * Formats a path object into a path string
   * @param {Partial<PathInfo>} pathInfo - The path information object
   * @returns {string} The formatted path string
   */
  public format(pathInfo: Partial<PathInfo>): string {
    return pathe.format({
      dir: pathInfo.directory || '',
      base: pathInfo.base || '',
      ext: pathInfo.extension || '',
      name: pathInfo.name || '',
    })
  }

  /**
   * Parses a path into segments
   * @param {string} path - The path to parse
   * @returns {PathSegment[]} Array of path segments with additional information
   * @private
   */
  private parseSegments(path: string): PathSegment[] {
    // Split path by slashes and filter out empty segments
    const rawSegments = path.split('/').filter(Boolean)

    // Create segment objects with additional information
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
   * Gets the extension of a segment, if any
   * @param {string} segment - The segment to check
   * @returns {string | undefined} The extension without dot, or undefined
   * @private
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
   * Removes dot segments (., ..) from a path
   * @param {string} path - The path to process
   * @returns {string} Path with dot segments resolved
   * @private
   */
  private removeDotSegments(path: string): string {
    // Split path into segments
    const segments = path.split('/')
    const result: string[] = []

    // Process each segment
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

    // Restore prefix and suffix
    const prefix = path.startsWith('/') ? '/' : ''
    const suffix = path.endsWith('/') && result.length > 0 ? '/' : ''

    return prefix + result.join('/') + suffix
  }

  /**
   * Gets the parent path
   * @param {string} path - The path to get the parent of
   * @returns {string} The parent path
   */
  public getParentPath(path: string): string {
    return pathe.dirname(path)
  }

  /**
   * Gets the depth of a path (number of segments)
   * @param {string} path - The path to analyze
   * @returns {number} The number of path segments
   */
  public getDepth(path: string): number {
    const info = this.parse(path)
    return info.segments.length
  }

  /**
   * Checks if a parent path contains a child path
   * @param {string} parentPath - The potential parent path
   * @param {string} childPath - The potential child path
   * @returns {boolean} True if the parent path contains the child path
   */
  public contains(parentPath: string, childPath: string): boolean {
    const normalizedParent = this.normalizePath(parentPath)
    const normalizedChild = this.normalizePath(childPath)

    // Root path contains all paths
    if (normalizedParent === '/') {
      return true
    }

    // Check if child path starts with parent path
    return (
      normalizedChild === normalizedParent
      || normalizedChild.startsWith(`${normalizedParent}/`)
    )
  }

  /**
   * Gets the common prefix for multiple paths
   * @param {string[]} paths - The paths to find common prefix for
   * @returns {string} The common path prefix
   */
  public getCommonPrefix(paths: string[]): string {
    if (paths.length === 0) {
      return ''
    }

    // Normalize all paths
    const normalized = paths.map(path => this.normalizePath(path))

    // Split first path into segments
    const parts = normalized[0].split('/')
    const result: string[] = []

    // Check each segment
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      // If segment matches in all paths, add it to result
      if (
        normalized.every((path) => {
          const pathParts = path.split('/')
          return pathParts[i] === part
        })
      ) {
        result.push(part)
      }
      else {
        break
      }
    }

    return result.join('/')
  }

  /**
   * Gets the base name of a path (last segment)
   * @param {string} path - The path to process
   * @param {string} [ext] - Extension to remove from the basename
   * @returns {string} The base name
   */
  public basename(path: string, ext?: string): string {
    return pathe.basename(path, ext)
  }

  /**
   * Gets the file extension of a path
   * @param {string} path - The path to process
   * @returns {string} The file extension with leading dot
   */
  public extname(path: string): string {
    return pathe.extname(path)
  }

  /**
   * Checks if a path points to a directory
   * @param {string} path - The path to check
   * @returns {boolean} True if the path looks like a directory
   */
  public isDirectory(path: string): boolean {
    return path.endsWith('/') || !this.extname(path)
  }

  /**
   * Checks if a path points to a file
   * @param {string} path - The path to check
   * @returns {boolean} True if the path looks like a file
   */
  public isFile(path: string): boolean {
    return !this.isDirectory(path)
  }

  /**
   * Adds a trailing slash to a path if it doesn't have one
   * @param {string} path - The path to process
   * @returns {string} Path with trailing slash
   */
  public ensureTrailingSlash(path: string): string {
    if (!path.endsWith('/')) {
      return `${path}/`
    }
    return path
  }

  /**
   * Removes a trailing slash from a path if it has one
   * @param {string} path - The path to process
   * @returns {string} Path without trailing slash
   */
  public removeTrailingSlash(path: string): string {
    if (path === '/') {
      return path
    }
    return path.endsWith('/') ? path.slice(0, -1) : path
  }

  /**
   * Adds a prefix to a path if it doesn't have one
   * @param {string} path - The path to process
   * @param {string} prefix - The prefix to add
   * @returns {string} Path with the prefix
   */
  public ensurePrefix(path: string, prefix: string): string {
    if (!path.startsWith(prefix)) {
      return prefix + path
    }
    return path
  }

  /**
   * Removes a prefix from a path if it has one
   * @param {string} path - The path to process
   * @param {string} prefix - The prefix to remove
   * @returns {string} Path without the prefix
   */
  public removePrefix(path: string, prefix: string): string {
    if (path.startsWith(prefix)) {
      return path.slice(prefix.length)
    }
    return path
  }

  /**
   * Gets all possible ancestor paths
   * @param {string} path - The path to process
   * @returns {string[]} Array of ancestor paths, from root to parent
   */
  public getAncestorPaths(path: string): string[] {
    const normalized = this.normalizePath(path)
    const segments = normalized.split('/').filter(Boolean)
    const results: string[] = []

    let current = ''

    if (normalized.startsWith('/')) {
      current = '/'
      results.push(current)
    }

    for (const segment of segments) {
      current = current === '/' ? `/${segment}` : `${current}/${segment}`
      results.push(current)
    }

    return results.slice(0, -1) // Exclude the path itself
  }

  /**
   * Checks if a path is a direct child of another path
   * @param {string} childPath - The potential child path
   * @param {string} parentPath - The potential parent path
   * @returns {boolean} True if childPath is direct child of parentPath
   */
  public isChildOf(childPath: string, parentPath: string): boolean {
    const normalizedChild = this.normalizePath(childPath)
    const normalizedParent = this.normalizePath(parentPath)

    if (normalizedParent === '/') {
      return normalizedChild !== '/'
    }

    // Path is a child if parent path is a prefix,
    // and there's only one additional segment between them
    if (normalizedChild.startsWith(`${normalizedParent}/`)) {
      const remainder = normalizedChild.slice(normalizedParent.length + 1)
      return !remainder.includes('/')
    }

    return false
  }

  /**
   * Checks if a path is a descendant of another path
   * @param {string} descendantPath - The potential descendant path
   * @param {string} ancestorPath - The potential ancestor path
   * @returns {boolean} True if descendantPath is descendant of ancestorPath
   */
  public isDescendantOf(descendantPath: string, ancestorPath: string): boolean {
    return this.contains(ancestorPath, descendantPath)
  }

  /**
   * Checks if a path is the root path
   * @param {string} path - The path to check
   * @returns {boolean} True if the path is root
   */
  public isRoot(path: string): boolean {
    const normalized = this.normalizePath(path)
    return normalized === '/' || normalized === ''
  }

  /**
   * Gets all segments of a path
   * @param {string} path - The path to process
   * @returns {string[]} Array of path segments
   */
  public getSegments(path: string): string[] {
    return this.parse(path).segments.map(segment => segment.value)
  }

  /**
   * Replaces the extension of a file path
   * @param {string} path - The path to process
   * @param {string} newExtension - The new extension to use
   * @returns {string} Path with replaced extension
   */
  public replaceExtension(path: string, newExtension: string): string {
    const info = this.parse(path)
    if (!info.extension) {
      return (
        path
        + (newExtension.startsWith('.') ? newExtension : `.${newExtension}`)
      )
    }

    return (
      path.slice(0, -info.extension.length)
      + (newExtension.startsWith('.') ? newExtension.slice(1) : newExtension)
    )
  }

  /**
   * Adds a suffix to a filename while preserving the extension
   * @param {string} path - The path to process
   * @param {string} suffix - The suffix to add
   * @returns {string} Path with suffix added to the filename
   */
  public addSuffix(path: string, suffix: string): string {
    const info = this.parse(path)
    if (!info.extension) {
      return path + suffix
    }

    return (
      `${path.slice(0, -(info.extension.length + 1))
      + suffix
      }.${
        info.extension}`
    )
  }
}
