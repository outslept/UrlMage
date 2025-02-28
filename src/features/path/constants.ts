/**
 * Common file extensions organized by content category
 */
export const FILE_EXTENSIONS = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'],
  ARCHIVES: ['zip', 'rar', 'tar', 'gz', '7z'],
  AUDIO: ['mp3', 'wav', 'ogg', 'flac', 'aac'],
  VIDEO: ['mp4', 'webm', 'avi', 'mov', 'mkv'],
  CODE: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'yaml', 'yml'],
}

/**
 * Pattern for characters not allowed in file paths
 * Based on Windows file system restrictions, which are typically the most restrictive
 */
export const UNSAFE_PATH_CHARS_PATTERN = /[<>:"|?*\x00-\x1F]/g

/**
 * Maximum path length in characters
 * Matches Windows MAX_PATH limitation (most restrictive common system)
 */
export const DEFAULT_MAX_PATH_LENGTH = 260

/**
 * Maximum length for a single path segment (filename or directory name)
 * Common limitation across most modern filesystems
 */
export const DEFAULT_MAX_SEGMENT_LENGTH = 255

/**
 * Pattern for validating safe filenames
 * Allows alphanumeric characters, underscores, hyphens, periods, spaces and parentheses
 */
export const SAFE_FILENAME_PATTERN = /^[a-zA-Z0-9_\-. ()]+$/

/**
 * Pattern for detecting URL-encoded characters (e.g., %20 for space)
 * Used when processing paths that may contain encoded characters
 */
export const URL_ENCODED_PATTERN = /%[0-9A-Fa-f]{2}/
