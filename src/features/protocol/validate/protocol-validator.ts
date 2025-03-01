import { ErrorCode, ValidationError } from '../../../errors'
import { ProtocolHandler } from '../core/protocol-handler'
import { ProtocolRegistry } from '../core/protocol-registry'
import { PortValidator } from './port-validator'

export class ProtocolValidator {
  private readonly handler: ProtocolHandler
  private readonly portValidator: PortValidator

  constructor() {
    this.handler = new ProtocolHandler()
    this.portValidator = new PortValidator()
  }

  public validate(protocol: string): void {
    if (!protocol) {
      throw new ValidationError(
        'Protocol is required',
        ErrorCode.INVALID_PROTOCOL,
      )
    }

    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)

    if (!this.handler.isValid(normalizedProtocol)) {
      throw new ValidationError(
        `Invalid protocol format: ${protocol}`,
        ErrorCode.INVALID_PROTOCOL,
      )
    }

    try {
      this.handler.parse(normalizedProtocol)
    }
    catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new ValidationError(
        `Failed to validate protocol: ${protocol}`,
        ErrorCode.INVALID_PROTOCOL,
      )
    }
  }

  public isStandard(protocol: string): boolean {
    return this.handler.isStandardProtocol(protocol)
  }

  public validatePort(protocol: string, port: number): void {
    this.portValidator.validate(protocol, port)
  }

  public requiresSecure(protocol: string): boolean {
    return this.handler.requiresSecureConnection(protocol)
  }

  public supportsAuth(protocol: string): boolean {
    return this.handler.supportsAuth(protocol)
  }

  public requiresHost(protocol: string): boolean {
    return this.handler.requiresHost(protocol)
  }

  public getDefaultPort(protocol: string): number | undefined {
    return this.handler.getDefaultPort(protocol)
  }

  public getAllowedPorts(protocol: string): number[] {
    return this.handler.getAllowedPorts(protocol)
  }

  public getCategory(protocol: string): string {
    return this.handler.getCategory(protocol)
  }

  public isSecure(protocol: string): boolean {
    return this.handler.isSecure(protocol)
  }

  public getSecureAlternative(protocol: string): string | undefined {
    return this.handler.getSecureAlternative(protocol)
  }

  public hasSecurityWarnings(protocol: string): boolean {
    const security = this.handler.getSecurity(protocol)
    return security.warnings !== undefined && security.warnings.length > 0
  }

  public getSecurityWarnings(protocol: string): string[] {
    const security = this.handler.getSecurity(protocol)
    return security.warnings || []
  }

  public validateForUsage(
    protocol: string,
    usage: 'browsing' | 'download' | 'upload' | 'streaming' | 'messaging',
  ): void {
    if (!this.handler.supportsUsage(protocol, usage)) {
      throw new ValidationError(
        `Protocol ${protocol} does not support ${usage}`,
        ErrorCode.UNSUPPORTED_OPERATION,
      )
    }
  }

  public validateForSecureUsage(protocol: string): void {
    if (!this.handler.isSecure(protocol)) {
      const secureAlternative = this.handler.getSecureAlternative(protocol)

      if (secureAlternative) {
        throw new ValidationError(
          `Protocol ${protocol} is not secure. Consider using ${secureAlternative} instead.`,
          ErrorCode.UNSAFE_PROTOCOL,
        )
      }
      else {
        throw new ValidationError(
          `Protocol ${protocol} is not secure.`,
          ErrorCode.UNSAFE_PROTOCOL,
        )
      }
    }
  }

  public isDangerous(protocol: string): boolean {
    const dangerousProtocols = [
      'javascript',
      'data',
      'vbscript',
      'jscript',
      'livescript',
      'mocha',
    ]

    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)
    return dangerousProtocols.includes(normalizedProtocol)
  }

  public isDeprecated(protocol: string): boolean {
    const deprecatedProtocols = ['telnet', 'gopher', 'wais']
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)
    return deprecatedProtocols.includes(normalizedProtocol)
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
}
