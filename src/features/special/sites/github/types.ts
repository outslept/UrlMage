import { z } from 'zod'
import { BaseSpecialURLSchema } from '../../base/types'

export const GitHubURLSchema = BaseSpecialURLSchema.extend({
  type: z.enum(['repo', 'blob', 'tree', 'commit', 'issues', 'pull', 'releases', 'profile']),
  owner: z.string(),
  repo: z.string().optional(),
  branch: z.string().optional(),
  path: z.string().optional(),
  lineStart: z.number().optional(),
  lineEnd: z.number().optional(),
  issueNumber: z.number().optional(),
  pullNumber: z.number().optional(),
  commitHash: z.string().optional(),
  releaseTag: z.string().optional(),
})

export type GitHubURL = z.infer<typeof GitHubURLSchema>
