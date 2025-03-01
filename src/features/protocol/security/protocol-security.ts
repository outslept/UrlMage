import type { ProtocolSecurity } from '../types/security'
import { ProtocolHandler } from '../core/protocol-handler'
import { ProtocolRegistry } from '../core/protocol-registry'

export class ProtocolSecurityChecker {
  private readonly handler: ProtocolHandler

  constructor() {
    this.handler = new ProtocolHandler()
  }

  public getSecurityInfo(protocol: string): ProtocolSecurity {
    return this.handler.getSecurity(protocol)
  }

  public isSecure(protocol: string): boolean {
    return this.handler.isSecure(protocol)
  }

  public getSecurityWarnings(protocol: string): string[] {
    const security = this.getSecurityInfo(protocol)
    return security.warnings || []
  }

  public hasSecurityWarnings(protocol: string): boolean {
    const warnings = this.getSecurityWarnings(protocol)
    return warnings.length > 0
  }

  public getSecureAlternative(protocol: string): string | undefined {
    return this.handler.getSecureAlternative(protocol)
  }

  public requiresTLS(protocol: string): boolean {
    const tlsProtocols = [
      'https',
      'wss',
      'ftps',
      'smtps',
      'imaps',
      'pop3s',
      'ldaps',
    ]
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)
    return tlsProtocols.includes(normalizedProtocol)
  }

  public isEncrypted(protocol: string): boolean {
    const security = this.getSecurityInfo(protocol)
    return security.encrypted
  }

  public getTLSVersion(protocol: string): string | undefined {
    const security = this.getSecurityInfo(protocol)
    return security.tlsVersion
  }

  public getSupportedCiphers(protocol: string): string[] {
    const security = this.getSecurityInfo(protocol)
    return security.ciphers || []
  }
}
