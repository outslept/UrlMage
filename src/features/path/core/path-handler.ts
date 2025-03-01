import type { PathInfo, PathOptions } from '../types/path'
import * as pathe from 'pathe'
import { ErrorCode, ValidationError } from '../../../errors'
import { PathParser } from './path-parser'

export class PathHandler {
  private readonly parser: PathParser
  private readonly defaultOptions: PathOptions = {
    normalizeSlashes: true,
    removeTrailingSlash: true,
    decodeComponents: true,
    removeEmptySegments: true,
    removeDotSegments: true,
  }

  constructor() {
    this.parser = new PathParser()
  }

  /**
   * Parses a path string into a structured PathInfo object.
   * Includes normalized form, segments, and various path properties.
   */
  public parse(path: string, options?: Partial<PathOptions>): PathInfo {
    const opts = { ...this.defaultOptions, ...options }

    const normalizedPath = this.normalizePath(path, opts)

    const segments = this.parser.parseSegments(normalizedPath)

    const isRoot = normalizedPath === '/' || normalizedPath === ''
    const isAbsolutePath = normalizedPath.startsWith('/')
    const hasTrailingSlash = normalizedPath.endsWith('/')

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
      extension: ext.startsWith('.') ? ext.slice(1) : ext,
      name,
    }
  }

  /**
   * Normalizes a path according to the specified options.
   * Handles URL decoding, slash normalization, empty/dot segment removal,
   * and trailing slash handling.
   */
  public normalizePath(path: string, options?: Partial<PathOptions>): string {
    const opts = { ...this.defaultOptions, ...options }
    let normalized = path

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

    if (opts.normalizeSlashes) {
      normalized = pathe.normalize(normalized)
      normalized = normalized.replace(/\/+/g, '/')
    }

    if (opts.removeEmptySegments) {
      normalized = normalized.replace(/\/\//g, '/')
    }

    if (opts.removeDotSegments) {
      normalized = this.parser.removeDotSegments(normalized)
    }

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
   * Joins multiple path segments into a single path.
   */
  public join(...paths: string[]): string {
    return pathe.join(...paths)
  }

  /**
   * Resolves a sequence of paths to an absolute path.
   */
  public resolve(...paths: string[]): string {
    return pathe.resolve(...paths)
  }

  /**
   * Calculates the relative path from one path to another.
   */
  public relative(from: string, to: string): string {
    return pathe.relative(from, to)
  }

  /**
   * Determines if a path is absolute.
   */
  public isAbsolute(path: string): boolean {
    return pathe.isAbsolute(path)
  }

  /**
   * Creates a path string from a PathInfo object.
   */
  public format(pathInfo: Partial<PathInfo>): string {
    return pathe.format({
      dir: pathInfo.directory ?? '',
      base: pathInfo.base ?? '',
      ext: pathInfo.extension ? `.${pathInfo.extension}` : '',
      name: pathInfo.name ?? '',
    })
  }

  /**
   * Gets the parent directory path.
   */
  public getParentPath(path: string): string {
    return pathe.dirname(path)
  }

  /**
   * Calculates the depth of a path (number of segments).
   */
  public getDepth(path: string): number {
    const info = this.parse(path)
    return info.segments.length
  }

  /**
   * Checks if one path contains another path.
   * A path contains another if it is an ancestor or the same path.
   */
  public contains(parentPath: string, childPath: string): boolean {
    const normalizedParent = this.normalizePath(parentPath)
    const normalizedChild = this.normalizePath(childPath)

    if (normalizedParent === '/') {
      return true
    }

    return (
      normalizedChild === normalizedParent
      || normalizedChild.startsWith(`${normalizedParent}/`)
    )
  }

  /**
   * Finds the common prefix path shared by all given paths.
   */
  public getCommonPrefix(paths: string[]): string {
    if (paths.length === 0) {
      return ''
    }

    const normalized = paths.map(path => this.normalizePath(path))

    const parts = normalized[0].split('/')
    const result: string[] = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

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
   * Gets the basename of a path, optionally removing a specified extension.
   */
  public basename(path: string, ext?: string): string {
    return pathe.basename(path, ext)
  }

  /**
   * Gets the extension of a path, including the leading dot.
   */
  public extname(path: string): string {
    return pathe.extname(path)
  }

  /**
   * Determines if a path likely refers to a directory.
   * Paths ending with a slash or without an extension are considered directories.
   */
  public isDirectory(path: string): boolean {
    return path.endsWith('/') || !this.extname(path)
  }

  /**
   * Determines if a path likely refers to a file.
   * The inverse of isDirectory.
   */
  public isFile(path: string): boolean {
    return !this.isDirectory(path)
  }

  /**
   * Ensures a path ends with a trailing slash.
   */
  public ensureTrailingSlash(path: string): string {
    if (!path.endsWith('/')) {
      return `${path}/`
    }
    return path
  }

  /**
   * Removes a trailing slash from a path, unless it's the root path.
   */
  public removeTrailingSlash(path: string): string {
    if (path === '/') {
      return path
    }
    return path.endsWith('/') ? path.slice(0, -1) : path
  }

  /**
   * Ensures a path starts with the specified prefix.
   */
  public ensurePrefix(path: string, prefix: string): string {
    if (!path.startsWith(prefix)) {
      return prefix + path
    }
    return path
  }

  /**
   * Removes a prefix from a path if it exists.
   */
  public removePrefix(path: string, prefix: string): string {
    if (path.startsWith(prefix)) {
      return path.slice(prefix.length)
    }
    return path
  }

  /**
   * Gets all ancestor paths for a given path.
   * Returns an array of paths from the root to the parent of the given path.
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

    return results.slice(0, -1)
  }

  /**
   * Checks if a path is a direct child of another path.
   * A direct child has exactly one more segment than its parent.
   */
  public isChildOf(childPath: string, parentPath: string): boolean {
    const normalizedChild = this.normalizePath(childPath)
    const normalizedParent = this.normalizePath(parentPath)

    if (normalizedParent === '/') {
      return normalizedChild !== '/'
    }

    if (normalizedChild.startsWith(`${normalizedParent}/`)) {
      const remainder = normalizedChild.slice(normalizedParent.length + 1)
      return !remainder.includes('/')
    }

    return false
  }

  /**
   * Checks if a path is a descendant of another path.
   * Uses the contains method to determine the ancestor-descendant relationship.
   */
  public isDescendantOf(descendantPath: string, ancestorPath: string): boolean {
    return this.contains(ancestorPath, descendantPath)
  }

  /**
   * Determines if a path is the root path ('/' or '').
   */
  public isRoot(path: string): boolean {
    const normalized = this.normalizePath(path)
    return normalized === '/' || normalized === ''
  }

  /**
   * Extracts an array of segment values from a path.
   */
  public getSegments(path: string): string[] {
    return this.parse(path).segments.map(segment => segment.value)
  }

  /**
   * Replaces the extension of a path with a new one.
   * If the path has no extension, the new extension is appended.
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
      path.slice(0, -info.extension.length - 1)
      + (newExtension.startsWith('.') ? newExtension : `.${newExtension}`)
    )
  }

  /**
   * Adds a suffix to a path, before the extension if one exists.
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
