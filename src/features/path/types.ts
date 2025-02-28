import { z } from 'zod'

/**
 * Represents a segment of a path
 * @interface PathSegment
 */
export interface PathSegment {
  /** The value of the segment */
  value: string

  /** The zero-based index of the segment within the path */
  index: number

  /** Whether this segment is the first in the path */
  isFirst: boolean

  /** Whether this segment is the last in the path */
  isLast: boolean

  /** Whether this segment is a single dot (.) */
  isDot: boolean

  /** Whether this segment is a double dot (..) */
  isDoubleDot: boolean

  /** Whether this segment has a file extension */
  hasExtension: boolean

  /** The file extension of the segment, if any (without the dot) */
  extension?: string
}

/**
 * Contains comprehensive information about a path
 * @interface PathInfo
 */
export interface PathInfo {
  /** The original path string */
  original: string

  /** The normalized path string */
  normalized: string

  /** Array of path segments */
  segments: PathSegment[]

  /** Whether the path is a root path (e.g., "/") */
  isRoot: boolean

  /** Whether the path is absolute (starts with a slash) */
  isAbsolute: boolean

  /** Whether the path has a trailing slash */
  hasTrailingSlash: boolean

  /** The directory part of the path */
  directory: string

  /** The base name of the path (filename with extension) */
  base: string

  /** The file extension (without the dot) */
  extension: string

  /** The filename without extension */
  name: string
}

/**
 * Options for path normalization operations
 * @interface PathOptions
 */
export interface PathOptions {
  /** Whether to normalize backslashes to forward slashes */
  normalizeSlashes: boolean

  /** Whether to remove trailing slashes */
  removeTrailingSlash: boolean

  /** Whether to decode URL-encoded components */
  decodeComponents: boolean

  /** Whether to remove empty segments (e.g., "a//b" -> "a/b") */
  removeEmptySegments: boolean

  /** Whether to resolve dot segments (., ..) */
  removeDotSegments: boolean
}

/**
 * Options for path validation operations
 * @interface PathValidationOptions
 */
export interface PathValidationOptions {
  /** List of allowed file extensions */
  allowedExtensions?: string[]

  /** Maximum allowed length of the entire path */
  maxLength?: number

  /** Maximum allowed length of any single segment */
  maxSegmentLength?: number

  /** Maximum allowed depth (number of segments) */
  maxDepth?: number

  /** Whether absolute paths are allowed */
  allowAbsolute?: boolean

  /** Whether dot segments (. and ..) are allowed */
  allowDotSegments?: boolean

  /** Whether empty segments are allowed */
  allowEmptySegments?: boolean

  /** Whether a file extension is required */
  requireExtension?: boolean

  /** Custom validation function */
  customValidator?: (path: string) => boolean
}

/**
 * Zod schema for validating PathSegment objects
 * @const {z.ZodObject} PathSegmentSchema
 */
export const PathSegmentSchema = z.object({
  value: z.string(),
  index: z.number().int().nonnegative(),
  isFirst: z.boolean(),
  isLast: z.boolean(),
  isDot: z.boolean(),
  isDoubleDot: z.boolean(),
  hasExtension: z.boolean(),
  extension: z.string().optional(),
})

/**
 * Zod schema for validating PathInfo objects
 * @const {z.ZodObject} PathInfoSchema
 */
export const PathInfoSchema = z.object({
  original: z.string(),
  normalized: z.string(),
  segments: z.array(PathSegmentSchema),
  isRoot: z.boolean(),
  isAbsolute: z.boolean(),
  hasTrailingSlash: z.boolean(),
  directory: z.string(),
  base: z.string(),
  extension: z.string(),
  name: z.string(),
})

/**
 * Zod schema for validating PathOptions objects
 * @const {z.ZodObject} PathOptionsSchema
 */
export const PathOptionsSchema = z.object({
  normalizeSlashes: z.boolean(),
  removeTrailingSlash: z.boolean(),
  decodeComponents: z.boolean(),
  removeEmptySegments: z.boolean(),
  removeDotSegments: z.boolean(),
})

/**
 * Zod schema for validating PathValidationOptions objects
 * @const {z.ZodObject} PathValidationOptionsSchema
 */
export const PathValidationOptionsSchema = z.object({
  allowedExtensions: z.array(z.string()).optional(),
  maxLength: z.number().int().positive().optional(),
  maxSegmentLength: z.number().int().positive().optional(),
  maxDepth: z.number().int().positive().optional(),
  allowAbsolute: z.boolean().optional(),
  allowDotSegments: z.boolean().optional(),
  allowEmptySegments: z.boolean().optional(),
  requireExtension: z.boolean().optional(),
  customValidator: z
    .function()
    .args(z.string())
    .returns(z.boolean())
    .optional(),
})
