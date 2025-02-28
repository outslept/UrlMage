import type {
  ProtocolCapabilities,
  ProtocolFullInfo,
  ProtocolSecurity,
} from './types'
import { ValidationError } from '../../errors'
import { ErrorCode } from '../../errors/types'
import { ProtocolRegistry } from './protocol-registry'
import {
  ProtocolCategory,
} from './types'

/**
 * Utility class for handling and processing URL protocols
 * @class ProtocolHandler
 */
export class ProtocolHandler {
  /**
   * Parses a protocol string and returns detailed information
   * @param {string} protocol - The protocol to parse
   * @returns {ProtocolFullInfo} Detailed information about the protocol
   * @throws {ValidationError} If the protocol format is invalid
   */
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
      // If protocol is not found in registry, create basic information
      return this.createGenericProtocolInfo(normalizedProtocol)
    }
  }

  /**
   * Checks if a protocol has a valid format
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol has a valid format
   */
  public isValid(protocol: string): boolean {
    return /^[a-z][a-z0-9+.-]*$/.test(protocol)
  }

  /**
   * Checks if a protocol is secure
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol is secure
   */
  public isSecure(protocol: string): boolean {
    return ProtocolRegistry.isSecure(protocol)
  }

  /**
   * Gets the default port for a protocol
   * @param {string} protocol - The protocol to check
   * @returns {number | undefined} The default port or undefined if none
   */
  public getDefaultPort(protocol: string): number | undefined {
    return ProtocolRegistry.getDefaultPort(protocol)
  }

  /**
   * Gets a list of allowed ports for a protocol
   * @param {string} protocol - The protocol to check
   * @returns {number[]} Array of allowed port numbers
   */
  public getAllowedPorts(protocol: string): number[] {
    try {
      const protocolInfo = this.parse(protocol)
      return protocolInfo.allowedPorts || []
    }
    catch (error) {
      return []
    }
  }

  /**
   * Checks if a protocol requires a host
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol requires a host
   */
  public requiresHost(protocol: string): boolean {
    return ProtocolRegistry.requiresHost(protocol)
  }

  /**
   * Checks if a protocol supports authentication
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol supports authentication
   */
  public supportsAuth(protocol: string): boolean {
    return ProtocolRegistry.supportsAuth(protocol)
  }

  /**
   * Gets the category of a protocol
   * @param {string} protocol - The protocol to check
   * @returns {string} The protocol category
   */
  public getCategory(protocol: string): string {
    try {
      const protocolInfo = this.parse(protocol)
      return protocolInfo.category
    }
    catch (error) {
      return 'other'
    }
  }

  /**
   * Gets security information for a protocol
   * @param {string} protocol - The protocol to check
   * @returns {ProtocolSecurity} Security information for the protocol
   */
  public getSecurity(protocol: string): ProtocolSecurity {
    try {
      const protocolInfo = this.parse(protocol)
      return protocolInfo.security
    }
    catch (error) {
      // For unknown protocols, assume they are insecure
      return {
        encrypted: false,
        warnings: ['Unknown protocol security properties'],
      }
    }
  }

  /**
   * Gets capability information for a protocol
   * @param {string} protocol - The protocol to check
   * @returns {ProtocolCapabilities} Capability information for the protocol
   */
  public getCapabilities(protocol: string): ProtocolCapabilities {
    try {
      const protocolInfo = this.parse(protocol)
      return protocolInfo.capabilities
    }
    catch (error) {
      // For unknown protocols, provide basic capabilities
      return {
        supportsStreaming: false,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: false,
      }
    }
  }

  /**
   * Creates basic information for unknown protocols
   * @param {string} protocol - The protocol to create information for
   * @returns {ProtocolFullInfo} Basic protocol information
   * @private
   */
  private createGenericProtocolInfo(protocol: string): ProtocolFullInfo {
    // Determine if protocol is secure based on 's' suffix
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

  /**
   * Checks if a protocol is a standard protocol
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol is standard
   */
  public isStandardProtocol(protocol: string): boolean {
    return ProtocolRegistry.hasProtocol(protocol)
  }

  /**
   * Gets a secure alternative for an insecure protocol
   * @param {string} protocol - The protocol to find an alternative for
   * @returns {string | undefined} The secure alternative or undefined if none
   */
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

  /**
   * Checks if a protocol supports a specific usage
   * @param {string} protocol - The protocol to check
   * @param {"browsing" | "download" | "upload" | "streaming" | "messaging"} usage - The usage to check
   * @returns {boolean} True if the protocol supports the usage
   */
  public supportsUsage(
    protocol: string,
    usage: 'browsing' | 'download' | 'upload' | 'streaming' | 'messaging',
  ): boolean {
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)

    // Define which protocols support which usage types
    const usageMap: Record<string, string[]> = {
      browsing: ['http', 'https', 'file'],
      download: ['http', 'https', 'ftp', 'sftp', 'file'],
      upload: ['http', 'https', 'ftp', 'sftp'],
      streaming: ['http', 'https', 'ws', 'wss', 'rtmp', 'rtsp'],
      messaging: ['ws', 'wss', 'mqtt', 'amqp'],
    }

    return usageMap[usage]?.includes(normalizedProtocol) || false
  }

  /**
   * Checks if a protocol requires a secure connection
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol requires a secure connection
   */
  public requiresSecureConnection(protocol: string): boolean {
    // Some protocols should always be used with a secure connection
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

  /**
   * Gets all supported protocols for a specific category
   * @param {string} category - The category to get protocols for
   * @returns {string[]} Array of protocol names in the category
   */
  public getProtocolsForCategory(category: string): string[] {
    return ProtocolRegistry.getProtocolsByCategory(category as any).map(
      p => p.name,
    )
  }

  /**
   * Gets all secure protocols
   * @returns {string[]} Array of secure protocol names
   */
  public getSecureProtocols(): string[] {
    return ProtocolRegistry.getSecureProtocols().map(p => p.name)
  }
}
