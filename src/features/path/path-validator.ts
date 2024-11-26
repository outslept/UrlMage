import { ValidationError } from '../../errors';
import { PathValidationOptions } from './types';
import { PathHandler } from './path-handler';

/**
 * Validator for URL paths
 */
export class PathValidator {
  private handler: PathHandler;

  constructor() {
    this.handler = new PathHandler();
  }

  /**
   * Validate a path against options
   */
  public validate(path: string, options: PathValidationOptions = {}): void {
    const info = this.handler.parse(path);

    // Check path length
    if (options.maxLength && path.length > options.maxLength) {
      throw new ValidationError(
        `Path length ${path.length} exceeds maximum length ${options.maxLength}`
      );
    }

    // Check segment length
    if (options.maxSegmentLength) {
      const longSegment = info.segments.find(
        segment => segment.value.length > options.maxSegmentLength!
      );
      if (longSegment) {
        throw new ValidationError(
          `Segment "${longSegment.value}" length ${longSegment.value.length} ` +
          `exceeds maximum length ${options.maxSegmentLength}`
        );
      }
    }

    // Check path depth
    if (options.maxDepth && info.segments.length > options.maxDepth) {
      throw new ValidationError(
        `Path depth ${info.segments.length} exceeds maximum depth ${options.maxDepth}`
      );
    }

    // Check absolute path
    if (options.allowAbsolute === false && info.isAbsolute) {
      throw new ValidationError('Absolute paths are not allowed');
    }

    // Check dot segments
    if (options.allowDotSegments === false) {
      const hasDotSegments = info.segments.some(
        segment => segment.isDot || segment.isDoubleDot
      );
      if (hasDotSegments) {
        throw new ValidationError('Dot segments are not allowed');
      }
    }

    // Check empty segments
    if (options.allowEmptySegments === false) {
      const hasEmptySegments = path.includes('//');
      if (hasEmptySegments) {
        throw new ValidationError('Empty segments are not allowed');
      }
    }

    // Check extension
    if (options.requireExtension && !info.extension) {
      throw new ValidationError('File extension is required');
    }

    // Check allowed extensions
    if (options.allowedExtensions && info.extension) {
      const ext = info.extension.toLowerCase();
      if (!options.allowedExtensions.includes(ext)) {
        throw new ValidationError(
          `Extension "${ext}" is not allowed. ` +
          `Allowed extensions: ${options.allowedExtensions.join(', ')}`
        );
      }
    }

    // Run custom validator
    if (options.customValidator && !options.customValidator(path)) {
      throw new ValidationError('Path failed custom validation');
    }
  }

  /**
   * Validate file extension
   */
  public validateExtension(path: string, allowedExtensions: string[]): void {
    const info = this.handler.parse(path);

    if (!info.extension) {
      throw new ValidationError('File extension is required');
    }

    const ext = info.extension.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new ValidationError(
        `Extension "${ext}" is not allowed. ` +
        `Allowed extensions: ${allowedExtensions.join(', ')}`
      );
    }
  }

  /**
   * Validate path depth
   */
  public validateDepth(path: string, maxDepth: number): void {
    const depth = this.handler.getDepth(path);
    if (depth > maxDepth) {
      throw new ValidationError(
        `Path depth ${depth} exceeds maximum depth ${maxDepth}`
      );
    }
  }

  /**
   * Validate path characters
   */
  public validateCharacters(path: string, pattern: RegExp = /^[\w\-./]+$/): void {
    if (!pattern.test(path)) {
      throw new ValidationError(
        'Path contains invalid characters. ' +
        'Only alphanumeric characters, hyphens, dots, and slashes are allowed.'
      );
    }
  }

  /**
   * Validate path is within root
   */
  public validateWithinRoot(path: string, root: string): void {
    const normalizedPath = this.handler.normalizePath(path);
    const normalizedRoot = this.handler.normalizePath(root);

    if (!this.handler.contains(normalizedRoot, normalizedPath)) {
      throw new ValidationError(
        `Path "${path}" is outside of root "${root}"`
      );
    }
  }

  /**
   * Validate path segments
   */
  public validateSegments(path: string, options: {
    minSegments?: number;
    maxSegments?: number;
    segmentPattern?: RegExp;
  } = {}): void {
    const info = this.handler.parse(path);

    if (options.minSegments && info.segments.length < options.minSegments) {
      throw new ValidationError(
        `Path has ${info.segments.length} segments, ` +
        `minimum required is ${options.minSegments}`
      );
    }

    if (options.maxSegments && info.segments.length > options.maxSegments) {
      throw new ValidationError(
        `Path has ${info.segments.length} segments, ` +
        `maximum allowed is ${options.maxSegments}`
      );
    }

    if (options.segmentPattern) {
      const invalidSegment = info.segments.find(
        segment => !options.segmentPattern!.test(segment.value)
      );
      if (invalidSegment) {
        throw new ValidationError(
          `Segment "${invalidSegment.value}" contains invalid characters`
        );
      }
    }
  }
}
