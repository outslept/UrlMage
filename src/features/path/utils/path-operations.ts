import { UNSAFE_PATH_CHARS_PATTERN } from '../constants'
import { PathHandler } from '../core/path-handler'

export class PathOperations {
  private readonly handler: PathHandler

  constructor() {
    this.handler = new PathHandler()
  }

  /**
   * Removes unsafe characters from a path, replacing them with a specified character.
   */
  public sanitizePath(path: string, replacement: string = '-'): string {
    return path.replace(UNSAFE_PATH_CHARS_PATTERN, replacement)
  }

  /**
   * Creates a unique path by appending a counter if the base path already exists.
   * For example: "file.txt" → "file-1.txt" → "file-2.txt"
   */
  public createUniquePath(basePath: string, existingPaths: string[]): string {
    if (!existingPaths.includes(basePath)) {
      return basePath
    }

    const info = this.handler.parse(basePath)
    const extension = info.extension ? `.${info.extension}` : ''
    const baseWithoutExt = info.extension
      ? basePath.slice(0, -(info.extension.length + 1))
      : basePath

    let counter = 1
    let uniquePath = ''

    do {
      uniquePath = `${baseWithoutExt}-${counter}${extension}`
      counter++
    } while (existingPaths.includes(uniquePath))

    return uniquePath
  }

  /**
   * Converts a path to a URL-friendly slug by normalizing and replacing
   * special characters with hyphens.
   */
  public pathToSlug(path: string): string {
    return this.handler
      .normalizePath(path)
      .replace(/^\/+|\/+$/g, '')
      .replace(/\//g, '-')
      .replace(/[^\w-.]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
  }

  /**
   * Retrieves a path segment by index. Supports negative indices to count from the end.
   */
  public getSegmentByIndex(path: string, index: number): string | undefined {
    const segments = this.handler.getSegments(path)

    if (index < 0) {
      index = segments.length + index
    }

    return segments[index]
  }

  /**
   * Checks if a path matches a glob pattern.
   * Supports * (single directory wildcard) and ** (recursive wildcard).
   */
  public matchesGlob(path: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '###GLOBSTAR###')
      .replace(/\*/g, '[^/]*')
      .replace(/###GLOBSTAR###/g, '.*')
      .replace(/\?/g, '[^/]')

    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(path)
  }

  /**
   * Checks if a path is a direct child of another path.
   */
  public isDirectChild(parentPath: string, childPath: string): boolean {
    return this.handler.isChildOf(childPath, parentPath)
  }

  /**
   * Checks if a path is a descendant (direct or indirect) of another path.
   */
  public isDescendant(parentPath: string, childPath: string): boolean {
    return this.handler.isDescendantOf(childPath, parentPath)
  }
}
