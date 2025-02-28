import { z } from 'zod'

export interface SpecialURL {
  type: string
  originalUrl: string
  isValid: boolean
}

export interface SpecialSiteHandler {
  name: string
  domains: string[]
  parse: (url: string) => SpecialURL
  validate: (url: string) => boolean
  normalize: (url: string) => string
}

export const BaseSpecialURLSchema = z.object({
  type: z.string(),
  originalUrl: z.string(),
  isValid: z.boolean(),
})
