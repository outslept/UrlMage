import type { SpecialSiteHandler, SpecialURL } from './types'
import { ValidationError } from '../../../errors'

export class SpecialSiteManager {
  private readonly handlers: Map<string, SpecialSiteHandler> = new Map()

  register(handler: SpecialSiteHandler): void {
    this.handlers.set(handler.name, handler)
  }

  parse(url: string): SpecialURL | null {
    try {
      // const parsedUrl = new URL(url);

      for (const handler of this.handlers.values()) {
        if (handler.validate(url)) {
          return handler.parse(url)
        }
      }

      return null
    }
    catch {
      return null
    }
  }

  validate(url: string): boolean {
    try {
      // const parsedUrl = new URL(url);

      for (const handler of this.handlers.values()) {
        if (handler.validate(url)) {
          return true
        }
      }

      return false
    }
    catch {
      return false
    }
  }

  normalize(url: string): string {
    try {
      // const parsedUrl = new URL(url);

      for (const handler of this.handlers.values()) {
        if (handler.validate(url)) {
          return handler.normalize(url)
        }
      }

      throw new ValidationError('No handler found for URL')
    }
    catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new ValidationError(`Invalid URL: ${url}`)
    }
  }

  getHandler(name: string): SpecialSiteHandler | undefined {
    return this.handlers.get(name)
  }

  getAllHandlers(): SpecialSiteHandler[] {
    return Array.from(this.handlers.values())
  }
}
