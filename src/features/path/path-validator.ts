import type { PathValidationOptions } from './types'
import { ValidationError } from '../../errors'
import { ErrorCode } from '../../errors/types'
import { PathHandler } from './path-handler'

export class PathValidator {
  /** Handler for path operations */
  private readonly handler: PathHandler

  /**
   * Creates an instance of PathValidator
   */
  constructor() {
    this.handler = new PathHandler()
  }

  /**
   * Validates a path according to specified options
   * @param {string} path - The path to validate
   * @param {PathValidationOptions} [options] - Validation options
   * @throws {ValidationError} If the path fails validation
   */
  public validate(path: string, options: PathValidationOptions = {}): void {
    // Parse the path to get detailed information
    const info = this.handler.parse(path)

    // Check maximum path length
    if (options.maxLength && path.length > options.maxLength) {
      throw new ValidationError(
        `Path length ${path.length} exceeds maximum length ${options.maxLength}`,
        ErrorCode.INVALID_PATH,
      )
    }

    // Check maximum segment length
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

    // Check maximum depth (number of segments)
    if (options.maxDepth && info.segments.length > options.maxDepth) {
      throw new ValidationError(
        `Path depth ${info.segments.length} exceeds maximum depth ${options.maxDepth}`,
        ErrorCode.INVALID_PATH,
      )
    }

    // Check if absolute paths are allowed
    if (options.allowAbsolute === false && info.isAbsolute) {
      throw new ValidationError(
        'Absolute paths are not allowed',
        ErrorCode.INVALID_PATH,
      )
    }

    // Check if dot segments (. and ..) are allowed
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

    // Check if empty segments are allowed
    if (options.allowEmptySegments === false) {
      const hasEmptySegments = path.includes('//')
      if (hasEmptySegments) {
        throw new ValidationError(
          'Empty segments are not allowed',
          ErrorCode.INVALID_PATH,
        )
      }
    }

    // Check if file extension is required
    if (options.requireExtension && !info.extension) {
      throw new ValidationError(
        'File extension is required',
        ErrorCode.INVALID_PATH,
      )
    }

    // Check if extension is in the allowed list
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

    // Run custom validation if provided
    if (options.customValidator && !options.customValidator(path)) {
      throw new ValidationError(
        'Path failed custom validation',
        ErrorCode.INVALID_PATH,
      )
    }
  }

  /**
   * Validates a file extension against a list of allowed extensions
   * @param {string} path - The path to validate
   * @param {string[]} allowedExtensions - List of allowed file extensions
   * @throws {ValidationError} If the extension is missing or not allowed
   */
  public validateExtension(path: string, allowedExtensions: string[]): void {
    const info = this.handler.parse(path)

    // Check if extension exists
    if (!info.extension) {
      throw new ValidationError(
        'File extension is required',
        ErrorCode.INVALID_PATH,
      )
    }

    // Check if extension is in the allowed list
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
   * Validates the depth of a path
   * @param {string} path - The path to validate
   * @param {number} maxDepth - Maximum allowed depth
   * @throws {ValidationError} If the path is deeper than allowed
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
   * Validates the characters in a path against a regular expression
   * @param {string} path - The path to validate
   * @param {RegExp} [pattern] - Pattern of allowed characters
   * @throws {ValidationError} If the path contains invalid characters
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
   * Validates that a path is contained within a root path
   * @param {string} path - The path to validate
   * @param {string} root - The root path that should contain the path
   * @throws {ValidationError} If the path is outside the root
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
   * Validates the segments of a path
   * @param {string} path - The path to validate
   * @param {object} [options] - Validation options
   * @param {number} [options.minSegments] - Minimum number of segments required
   * @param {number} [options.maxSegments] - Maximum number of segments allowed
   * @param {RegExp} [options.segmentPattern] - Pattern for valid segment characters
   * @throws {ValidationError} If the segments fail validation
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

    // Check minimum number of segments
    if (options.minSegments && info.segments.length < options.minSegments) {
      throw new ValidationError(
        `Path has ${info.segments.length} segments, `
        + `minimum required is ${options.minSegments}`,
        ErrorCode.INVALID_PATH,
      )
    }

    // Check the segment pattern
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
