import { ErrorCode, ValidationError } from "../../../errors"
import { ProtocolCapabilities } from "../types/capabilities"
import { ProtocolCategory, ProtocolFullInfo } from "../types/protocol"
import { ProtocolSecurity } from "../types/security"
import { ProtocolParser } from "./protocol-parser"
import { ProtocolRegistry } from "./protocol-registry"

export class ProtocolHandler {
  private readonly parser: ProtocolParser

  constructor() {
    this.parser = new ProtocolParser()
  }

  public parse(protocol: string): ProtocolFullInfo {
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)

    if (!this.isValid(normalizedProtocol)) {
      throw new ValidationError(
        `Invalid protocol format: ${protocol}`,
        ErrorCode.INVALID_PROTOCOL,
      )
    }

    try {
      return ProtocolRegistry.getProtocol(normalizedProtocol)
    }
    catch (error) {
      return this.createGenericProtocolInfo(normalizedProtocol)
    }
  }

  public isValid(protocol: string): boolean {
    return this.parser.isValidFormat(protocol)
  }

  public isSecure(protocol: string): boolean {
    return ProtocolRegistry.isSecure(protocol)
  }

  public getDefaultPort(protocol: string): number | undefined {
    return ProtocolRegistry.getDefaultPort(protocol)
  }

  public getAllowedPorts(protocol: string): number[] {
    try {
      const protocolInfo = this.parse(protocol)
      return protocolInfo.allowedPorts || []
    }
    catch (error) {
      return []
    }
  }

  public requiresHost(protocol: string): boolean {
    return ProtocolRegistry.requiresHost(protocol)
  }

  public supportsAuth(protocol: string): boolean {
    return ProtocolRegistry.supportsAuth(protocol)
  }

  public getCategory(protocol: string): string {
    try {
      const protocolInfo = this.parse(protocol)
      return protocolInfo.category
    }
    catch (error) {
      return 'other'
    }
  }

  public getSecurity(protocol: string): ProtocolSecurity {
    try {
      const protocolInfo = this.parse(protocol)
      return protocolInfo.security
    }
    catch (error) {
      return {
        encrypted: false,
        warnings: ['Unknown protocol security properties'],
      }
    }
  }

  public getCapabilities(protocol: string): ProtocolCapabilities {
    try {
      const protocolInfo = this.parse(protocol)
      return protocolInfo.capabilities
    }
    catch (error) {
      return {
        supportsStreaming: false,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: false,
      }
    }
  }

  private createGenericProtocolInfo(protocol: string): ProtocolFullInfo {
    const isSecure = protocol.endsWith('s')

    return {
      name: protocol,
      secure: isSecure,
      defaultPort: undefined,
      allowedPorts: [],
      requiresHost: true,
      supportsAuth: false,
      category: ProtocolCategory.OTHER,
      security: {
        encrypted: isSecure,
        warnings: isSecure ? [] : ['Protocol may not use encryption'],
      },
      capabilities: {
        supportsStreaming: false,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: false,
      },
    }
  }

  public isStandardProtocol(protocol: string): boolean {
    return ProtocolRegistry.hasProtocol(protocol)
  }

  public getSecureAlternative(protocol: string): string | undefined {
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

    return alternatives[normalizedProtocol]
  }

  public supportsUsage(
    protocol: string,
    usage: 'browsing' | 'download' | 'upload' | 'streaming' | 'messaging',
  ): boolean {
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)

    const usageMap: Record<string, string[]> = {
      browsing: ['http', 'https', 'file'],
      download: ['http', 'https', 'ftp', 'sftp', 'file'],
      upload: ['http', 'https', 'ftp', 'sftp'],
      streaming: ['http', 'https', 'ws', 'wss', 'rtmp', 'rtsp'],
      messaging: ['ws', 'wss', 'mqtt', 'amqp'],
    }

    return usageMap[usage]?.includes(normalizedProtocol) || false
  }

  public requiresSecureConnection(protocol: string): boolean {
    const secureOnlyProtocols = [
      'https',
      'wss',
      'sftp',
      'smtps',
      'imaps',
      'pop3s',
      'ldaps',
    ]
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)

    return secureOnlyProtocols.includes(normalizedProtocol)
  }

  public getProtocolsForCategory(category: string): string[] {
    return ProtocolRegistry.getProtocolsByCategory(category as any).map(
      p => p.name,
    )
  }

  public getSecureProtocols(): string[] {
    return ProtocolRegistry.getSecureProtocols().map(p => p.name)
  }
}
