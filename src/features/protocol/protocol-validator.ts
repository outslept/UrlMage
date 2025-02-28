import { ValidationError } from '../../errors'
import { ErrorCode } from '../../errors/types'
import { ProtocolHandler } from './protocol-handler'
import { ProtocolRegistry } from './protocol-registry'

/**
 * Class for validating URL protocols against security and format requirements
 * @class ProtocolValidator
 */
export class ProtocolValidator {
  /** Handler for protocol operations */
  private handler: ProtocolHandler

  /**
   * Creates an instance of ProtocolValidator
   */
  constructor() {
    this.handler = new ProtocolHandler()
  }

  /**
   * Validates a protocol string
   * @param {string} protocol - The protocol to validate
   * @throws {ValidationError} If the protocol is invalid
   */
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

    // Try to get protocol information
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

  /**
   * Checks if a protocol is a standard protocol
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol is standard
   */
  public isStandard(protocol: string): boolean {
    return this.handler.isStandardProtocol(protocol)
  }

  /**
   * Validates a port number for a specific protocol
   * @param {string} protocol - The protocol to validate the port for
   * @param {number} port - The port number to validate
   * @throws {ValidationError} If the port is invalid for the protocol
   */
  public validatePort(protocol: string, port: number): void {
    if (port === undefined || port === null) {
      throw new ValidationError('Port is required', ErrorCode.INVALID_PORT)
    }

    if (!Number.isInteger(port)) {
      throw new ValidationError(
        'Port must be an integer',
        ErrorCode.INVALID_PORT,
      )
    }

    if (port < 1 || port > 65535) {
      throw new ValidationError(
        'Port must be between 1 and 65535',
        ErrorCode.INVALID_PORT,
      )
    }

    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)

    // Check if the port is allowed for this protocol
    if (!ProtocolRegistry.isPortAllowed(normalizedProtocol, port)) {
      const allowedPorts = this.handler.getAllowedPorts(normalizedProtocol)

      if (allowedPorts.length > 0) {
        throw new ValidationError(
          `Invalid port ${port} for protocol ${protocol}. Allowed ports are: ${allowedPorts.join(', ')}`,
          ErrorCode.INVALID_PORT,
        )
      }
    }
  }

  /**
   * Checks if a protocol requires a secure connection
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol requires security
   */
  public requiresSecure(protocol: string): boolean {
    return this.handler.requiresSecureConnection(protocol)
  }

  /**
   * Checks if a protocol supports authentication
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol supports authentication
   */
  public supportsAuth(protocol: string): boolean {
    return this.handler.supportsAuth(protocol)
  }

  /**
   * Checks if a protocol requires a host
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol requires a host
   */
  public requiresHost(protocol: string): boolean {
    return this.handler.requiresHost(protocol)
  }

  /**
   * Gets the default port for a protocol
   * @param {string} protocol - The protocol to check
   * @returns {number | undefined} The default port or undefined if none
   */
  public getDefaultPort(protocol: string): number | undefined {
    return this.handler.getDefaultPort(protocol)
  }

  /**
   * Gets a list of allowed ports for a protocol
   * @param {string} protocol - The protocol to check
   * @returns {number[]} Array of allowed port numbers
   */
  public getAllowedPorts(protocol: string): number[] {
    return this.handler.getAllowedPorts(protocol)
  }

  /**
   * Gets the category of a protocol
   * @param {string} protocol - The protocol to check
   * @returns {string} The protocol category
   */
  public getCategory(protocol: string): string {
    return this.handler.getCategory(protocol)
  }

  /**
   * Checks if a protocol is secure
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol is secure
   */
  public isSecure(protocol: string): boolean {
    return this.handler.isSecure(protocol)
  }

  /**
   * Gets a secure alternative for an insecure protocol
   * @param {string} protocol - The protocol to find an alternative for
   * @returns {string | undefined} The secure alternative or undefined if none
   */
  public getSecureAlternative(protocol: string): string | undefined {
    return this.handler.getSecureAlternative(protocol)
  }

  /**
   * Checks if a protocol has known security warnings
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol has security warnings
   */
  public hasSecurityWarnings(protocol: string): boolean {
    const security = this.handler.getSecurity(protocol)
    return security.warnings !== undefined && security.warnings.length > 0
  }

  /**
   * Gets the list of security warnings for a protocol
   * @param {string} protocol - The protocol to check
   * @returns {string[]} Array of security warning messages
   */
  public getSecurityWarnings(protocol: string): string[] {
    const security = this.handler.getSecurity(protocol)
    return security.warnings || []
  }

  /**
   * Validates a protocol for a specific usage scenario
   * @param {string} protocol - The protocol to validate
   * @param {"browsing" | "download" | "upload" | "streaming" | "messaging"} usage - The intended usage
   * @throws {ValidationError} If the protocol doesn't support the usage
   */
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

  /**
   * Validates a protocol for secure usage
   * @param {string} protocol - The protocol to validate
   * @throws {ValidationError} If the protocol is not secure
   */
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

  /**
   * Checks if a protocol is potentially dangerous
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol is considered dangerous
   */
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

  /**
   * Checks if a protocol is deprecated
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol is deprecated
   */
  public isDeprecated(protocol: string): boolean {
    const deprecatedProtocols = ['telnet', 'gopher', 'wais']
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)
    return deprecatedProtocols.includes(normalizedProtocol)
  }

  /**
   * Checks if a protocol requires TLS (Transport Layer Security)
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol requires TLS
   */
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
