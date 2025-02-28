import type { GitHubURL } from './types'
import { ValidationError } from '../../../../errors'
import { BaseSpecialSiteHandler } from '../../base/handler'
import { GitHubURLSchema } from './types'

export class GitHubHandler extends BaseSpecialSiteHandler {
  name = 'github'
  domains = ['github.com']

  parse(url: string): GitHubURL {
    const normalizedUrl = this.normalize(url)
    const parsedUrl = new URL(normalizedUrl)
    const segments = this.getPathSegments(parsedUrl)

    if (segments.length === 0) {
      throw new ValidationError('Invalid GitHub URL: no path segments')
    }

    let result: Partial<GitHubURL> = {
      type: 'profile',
      originalUrl: url,
      isValid: true,
      owner: segments[0],
    }

    if (segments.length === 1) {
      // User profile URL
      return GitHubURLSchema.parse(result)
    }

    // Repository URL
    result.repo = segments[1]

    if (segments.length === 2) {
      result.type = 'repo'
      return GitHubURLSchema.parse(result)
    }

    // Parse specific repository sections
    switch (segments[2]) {
      case 'blob':
      case 'tree':
        if (segments.length < 4) {
          throw new ValidationError(`Invalid GitHub ${segments[2]} URL: missing branch or path`)
        }
        result = {
          ...result,
          type: segments[2] === 'blob' ? 'blob' : 'tree',
          branch: segments[3],
          path: segments.slice(4).join('/'),
        }

        // Parse line numbers for blob URLs
        if (segments[2] === 'blob' && parsedUrl.hash) {
          const lineMatch = parsedUrl.hash.match(/^#L(\d+)(?:-L(\d+))?$/)
          if (lineMatch) {
            result.lineStart = Number.parseInt(lineMatch[1], 10)
            if (lineMatch[2]) {
              result.lineEnd = Number.parseInt(lineMatch[2], 10)
            }
          }
        }
        break

      case 'commit':
        if (segments.length !== 4) {
          throw new ValidationError('Invalid GitHub commit URL: missing commit hash')
        }
        result = {
          ...result,
          type: 'commit',
          commitHash: segments[3],
        }
        break

      case 'issues':
        result = {
          ...result,
          type: 'issues',
        }
        if (segments.length === 4) {
          result.issueNumber = Number.parseInt(segments[3], 10)
        }
        break

      case 'pull':
        if (segments.length !== 4) {
          throw new ValidationError('Invalid GitHub pull request URL: missing PR number')
        }
        result = {
          ...result,
          type: 'pull',
          pullNumber: Number.parseInt(segments[3], 10),
        }
        break

      case 'releases':
        result = {
          ...result,
          type: 'releases',
        }
        if (segments.length === 4 && segments[3] === 'tag') {
          result.releaseTag = segments[4]
        }
        break

      default:
        throw new ValidationError(`Invalid GitHub URL path: ${parsedUrl.pathname}`)
    }

    // Validate with zod schema
    const validated = GitHubURLSchema.safeParse(result)
    if (!validated.success) {
      throw new ValidationError(`Invalid GitHub URL structure: ${validated.error.message}`)
    }

    return validated.data
  }

  override validate(url: string): boolean {
    if (!super.validate(url)) {
      return false
    }

    try {
      this.parse(url)
      return true
    }
    catch {
      return false
    }
  }
}
