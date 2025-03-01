import { ProtocolRegistry } from './protocol-registry'

export class ProtocolParser {
  public isValidFormat(protocol: string): boolean {
    return /^[a-z][a-z0-9+.-]*$/.test(protocol)
  }

  public extractFromUrl(url: string): string | undefined {
    if (!url)
      return undefined

    const match = url.match(/^([a-z][a-z0-9+.-]*):\/\//)
    if (match) {
      return ProtocolRegistry.normalizeProtocol(match[1])
    }

    return undefined
  }

  public isUrlSecure(url: string): boolean {
    const protocol = this.extractFromUrl(url)
    if (!protocol)
      return false

    return ProtocolRegistry.isSecure(protocol)
  }

  public extractPortFromUrl(url: string): number | undefined {
    if (!url)
      return undefined

    try {
      const urlObj = new URL(url)
      if (urlObj.port) {
        return Number.parseInt(urlObj.port, 10)
      }

      // If port is not specified, try to get default port for protocol
      const protocol = this.extractFromUrl(url)
      if (protocol) {
        return ProtocolRegistry.getDefaultPort(protocol)
      }
    }
    catch (error) {
    // Invalid URL, cannot extract port
    }

    return undefined
  }

  public hasValidProtocol(url: string): boolean {
    const protocol = this.extractFromUrl(url)
    if (!protocol)
      return false

    return this.isValidFormat(protocol)
  }

  public toSecureProtocol(protocol: string): string {
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)

    const alternatives: Record<string, string> = {
      http: 'https',
      ws: 'wss',
      ftp: 'sftp',
      smtp: 'smtps',
      imap: 'imaps',
      pop3: 'pop3s',
      ldap: 'ldaps',
    }

    return alternatives[normalizedProtocol] || normalizedProtocol
  }

  public hasRestrictedPorts(protocol: string): boolean {
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)
    try {
      const protocolInfo = ProtocolRegistry.getProtocol(normalizedProtocol)
      return protocolInfo.allowedPorts !== undefined
        && protocolInfo.allowedPorts.length > 0
    }
    catch (error) {
      return false
    }
  }
}
