import type { PathValidationOptions } from '../types/path'
import { PathHandler } from '../core/path-handler'
import { ErrorCode, ValidationError } from '../../../errors'

export class PathValidator {
  private readonly handler: PathHandler

  constructor() {
    this.handler = new PathHandler()
  }

  /**
   * Performs comprehensive path validation against the provided options.
   * Throws ValidationError with appropriate message if validation fails.
   */
  public validate(path: string, options: PathValidationOptions = {}): void {
    const info = this.handler.parse(path)

    if (options.maxLength && path.length > options.maxLength) {
      throw new ValidationError(
        `Path length ${path.length} exceeds maximum length ${options.maxLength}`,
        ErrorCode.INVALID_PATH,
      )
    }

    if (options.maxSegmentLength) {
      const longSegment = info.segments.find(
        segment => segment.value.length > options.maxSegmentLength!,
      )
      if (longSegment) {
        throw new ValidationError(
          `Segment "${longSegment.value}" length ${longSegment.value.length} `
          + `exceeds maximum length ${options.maxSegmentLength}`,
          ErrorCode.INVALID_PATH,
        )
      }
    }

    if (options.maxDepth && info.segments.length > options.maxDepth) {
      throw new ValidationError(
        `Path depth ${info.segments.length} exceeds maximum depth ${options.maxDepth}`,
        ErrorCode.INVALID_PATH,
      )
    }

    if (options.allowAbsolute === false && info.isAbsolute) {
      throw new ValidationError(
        'Absolute paths are not allowed',
        ErrorCode.INVALID_PATH,
      )
    }

    if (options.allowDotSegments === false) {
      const hasDotSegments = info.segments.some(
        segment => segment.isDot || segment.isDoubleDot,
      )
      if (hasDotSegments) {
        throw new ValidationError(
          'Dot segments (. or ..) are not allowed',
          ErrorCode.INVALID_PATH,
        )
      }
    }

    if (options.allowEmptySegments === false) {
      const hasEmptySegments = path.includes('//')
      if (hasEmptySegments) {
        throw new ValidationError(
          'Empty segments are not allowed',
          ErrorCode.INVALID_PATH,
        )
      }
    }

    if (options.requireExtension && !info.extension) {
      throw new ValidationError(
        'File extension is required',
        ErrorCode.INVALID_PATH,
      )
    }

    if (options.allowedExtensions && info.extension) {
      const ext = info.extension.toLowerCase()
      if (!options.allowedExtensions.includes(ext)) {
        throw new ValidationError(
          `Extension "${ext}" is not allowed. `
          + `Allowed extensions: ${options.allowedExtensions.join(', ')}`,
          ErrorCode.INVALID_PATH,
        )
      }
    }

    if (options.customValidator && !options.customValidator(path)) {
      throw new ValidationError(
        'Path failed custom validation',
        ErrorCode.INVALID_PATH,
      )
    }
  }

  /**
   * Validates that a path has one of the allowed file extensions.
   * Throws if the path has no extension or if it's not in the allowed list.
   */
  public validateExtension(path: string, allowedExtensions: string[]): void {
    const info = this.handler.parse(path)

    if (!info.extension) {
      throw new ValidationError(
        'File extension is required',
        ErrorCode.INVALID_PATH,
      )
    }

    const ext = info.extension.toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      throw new ValidationError(
        `Extension "${ext}" is not allowed. `
        + `Allowed extensions: ${allowedExtensions.join(', ')}`,
        ErrorCode.INVALID_PATH,
      )
    }
  }

  /**
   * Validates that a path does not exceed the specified maximum depth.
   */
  public validateDepth(path: string, maxDepth: number): void {
    const depth = this.handler.getDepth(path)
    if (depth > maxDepth) {
      throw new ValidationError(
        `Path depth ${depth} exceeds maximum depth ${maxDepth}`,
        ErrorCode.INVALID_PATH,
      )
    }
  }

  /**
   * Validates that a path contains only allowed characters.
   * Default pattern allows alphanumeric characters, hyphens, dots, and slashes.
   */
  public validateCharacters(
    path: string,
    pattern: RegExp = /^[\w\-./]+$/,
  ): void {
    if (!pattern.test(path)) {
      throw new ValidationError(
        'Path contains invalid characters. '
        + 'Only alphanumeric characters, hyphens, dots, and slashes are allowed.',
        ErrorCode.INVALID_PATH,
      )
    }
  }

  /**
   * Validates that a path is contained within a specified root directory.
   * Prevents directory traversal attacks.
   */
  public validateWithinRoot(path: string, root: string): void {
    const normalizedPath = this.handler.normalizePath(path)
    const normalizedRoot = this.handler.normalizePath(root)

    if (!this.handler.contains(normalizedRoot, normalizedPath)) {
      throw new ValidationError(
        `Path "${path}" is outside of root "${root}"`,
        ErrorCode.INVALID_PATH,
      )
    }
  }

  /**
   * Validates path segments against constraints like minimum/maximum count
   * and character patterns.
   */
  public validateSegments(
    path: string,
    options: {
      minSegments?: number
      maxSegments?: number
      segmentPattern?: RegExp
    } = {},
  ): void {
    const info = this.handler.parse(path)

    if (options.minSegments && info.segments.length < options.minSegments) {
      throw new ValidationError(
        `Path has ${info.segments.length} segments, `
        + `minimum required is ${options.minSegments}`,
        ErrorCode.INVALID_PATH,
      )
    }

    if (options.maxSegments && info.segments.length > options.maxSegments) {
      throw new ValidationError(
        `Path has ${info.segments.length} segments, `
        + `maximum allowed is ${options.maxSegments}`,
        ErrorCode.INVALID_PATH,
      )
    }

    if (options.segmentPattern) {
      const invalidSegment = info.segments.find(
        segment => !options.segmentPattern!.test(segment.value),
      )
      if (invalidSegment) {
        throw new ValidationError(
          `Segment "${invalidSegment.value}" contains invalid characters`,
          ErrorCode.INVALID_PATH,
        )
      }
    }
  }
}
