/**
 * Path segment information
 */
export interface PathSegment {
  /** Segment value */
  value: string;
  /** Segment index */
  index: number;
  /** Whether this is the first segment */
  isFirst: boolean;
  /** Whether this is the last segment */
  isLast: boolean;
  /** Whether segment is a dot */
  isDot: boolean;
  /** Whether segment is a double dot */
  isDoubleDot: boolean;
  /** Whether segment has extension */
  hasExtension: boolean;
  /** Segment extension if any */
  extension?: string;
}

/**
 * Path information
 */
export interface PathInfo {
  /** Original path string */
  original: string;
  /** Normalized path string */
  normalized: string;
  /** Path segments */
  segments: PathSegment[];
  /** Whether path is root */
  isRoot: boolean;
  /** Whether path is absolute */
  isAbsolute: boolean;
  /** Whether path has trailing slash */
  hasTrailingSlash: boolean;
  /** Directory part */
  directory: string;
  /** Base name with extension */
  base: string;
  /** File extension */
  extension: string;
  /** File name without extension */
  name: string;
}

/**
 * Path normalization options
 */
export interface PathOptions {
  /** Whether to normalize slashes to forward slashes */
  normalizeSlashes: boolean;
  /** Whether to remove trailing slash */
  removeTrailingSlash: boolean;
  /** Whether to decode URI components */
  decodeComponents: boolean;
  /** Whether to remove empty segments */
  removeEmptySegments: boolean;
  /** Whether to remove dot segments */
  removeDotSegments: boolean;
}

/**
 * Path validation options
 */
export interface PathValidationOptions {
  /** Allowed file extensions */
  allowedExtensions?: string[];
  /** Maximum path length */
  maxLength?: number;
  /** Maximum segment length */
  maxSegmentLength?: number;
  /** Maximum depth */
  maxDepth?: number;
  /** Whether to allow absolute paths */
  allowAbsolute?: boolean;
  /** Whether to allow dot segments */
  allowDotSegments?: boolean;
  /** Whether to allow empty segments */
  allowEmptySegments?: boolean;
  /** Whether to require extension */
  requireExtension?: boolean;
  /** Custom validation function */
  customValidator?: (path: string) => boolean;
}
