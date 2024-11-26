export class URLConverter {
  static toDataURI(url: URL, mimeType: string, data: string): URL {
    return new URL(`data:${mimeType},${encodeURIComponent(data)}`)
  }

  static toMailto(email: string): URL {
    return new URL(`mailto:${email}`)
  }

  static toLocalFileURL(path: string): URL {
    return new URL(`file://${path}`)
  }

  static gitUrlToHttps(gitUrl: string): string {
    return gitUrl
      .replace(/^git@/, 'https://')
      .replace(/:/, '/')
      .replace(/\.git$/, '')
  }

  static normalizeURL(url: URL): URL {
    const normalized = new URL(url.href)
    normalized.pathname = normalized.pathname.replace(/\/+/g, '/')
    if (normalized.pathname !== '/' && normalized.pathname.endsWith('/')) {
      normalized.pathname = normalized.pathname.slice(0, -1)
    }
    return normalized
  }
}