import type { ProtocolFullInfo } from './types'
import { ValidationError } from '../../errors'
import { ErrorCode } from '../../errors/types'
import { ProtocolCategory } from './types'

/**
 * Central registry for protocol information
 * @class ProtocolRegistry
 */
export class ProtocolRegistry {
  /**
   * Registry of protocol definitions
   * @private
   * @static
   * @readonly
   */
  private static readonly protocols: Record<string, ProtocolFullInfo> = {
    // Web protocols
    http: {
      name: 'http',
      secure: false,
      defaultPort: 80,
      allowedPorts: [80, 8080, 8000, 3000],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.WEB,
      security: {
        encrypted: false,
        warnings: [
          'Protocol does not use encryption',
          'Consider using HTTPS for secure communication',
        ],
      },
      capabilities: {
        supportsStreaming: true,
        supportsCompression: true,
        supportsProxy: true,
        requiresAuthentication: false,
        maxRequestSize: 2 * 1024 * 1024, // 2MB
        timeout: 30000, // 30 seconds
      },
    },
    https: {
      name: 'https',
      secure: true,
      defaultPort: 443,
      allowedPorts: [443, 8443, 4443],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.WEB,
      security: {
        encrypted: true,
        tlsVersion: 'TLS 1.3',
        ciphers: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
        warnings: [],
      },
      capabilities: {
        supportsStreaming: true,
        supportsCompression: true,
        supportsProxy: true,
        requiresAuthentication: false,
        maxRequestSize: 2 * 1024 * 1024, // 2MB
        timeout: 30000, // 30 seconds
      },
    },
    ws: {
      name: 'ws',
      secure: false,
      defaultPort: 80,
      allowedPorts: [80, 8080, 3000],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.MESSAGING,
      security: {
        encrypted: false,
        warnings: [
          'Protocol does not use encryption',
          'Consider using WSS for secure communication',
        ],
      },
      capabilities: {
        supportsStreaming: true,
        supportsCompression: true,
        supportsProxy: true,
        requiresAuthentication: false,
        timeout: 30000, // 30 seconds
      },
    },
    wss: {
      name: 'wss',
      secure: true,
      defaultPort: 443,
      allowedPorts: [443, 8443],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.MESSAGING,
      security: {
        encrypted: true,
        tlsVersion: 'TLS 1.3',
        ciphers: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
        warnings: [],
      },
      capabilities: {
        supportsStreaming: true,
        supportsCompression: true,
        supportsProxy: true,
        requiresAuthentication: false,
        timeout: 30000, // 30 seconds
      },
    },

    // File protocols
    ftp: {
      name: 'ftp',
      secure: false,
      defaultPort: 21,
      allowedPorts: [21],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.FILE,
      security: {
        encrypted: false,
        warnings: [
          'Protocol does not use encryption',
          'Protocol sends credentials in plaintext',
        ],
      },
      capabilities: {
        supportsStreaming: false,
        supportsCompression: false,
        supportsProxy: true,
        requiresAuthentication: false,
        maxRequestSize: 10 * 1024 * 1024 * 1024, // 10GB
        timeout: 120000, // 2 minutes
      },
    },
    sftp: {
      name: 'sftp',
      secure: true,
      defaultPort: 22,
      allowedPorts: [22],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.FILE,
      security: {
        encrypted: true,
        warnings: [],
      },
      capabilities: {
        supportsStreaming: false,
        supportsCompression: true,
        supportsProxy: false,
        requiresAuthentication: true,
        maxRequestSize: 10 * 1024 * 1024 * 1024, // 10GB
        timeout: 120000, // 2 minutes
      },
    },
    file: {
      name: 'file',
      secure: true,
      defaultPort: undefined,
      allowedPorts: [],
      requiresHost: false,
      supportsAuth: false,
      category: ProtocolCategory.FILE,
      security: {
        encrypted: true, // local files are considered secure
        warnings: [],
      },
      capabilities: {
        supportsStreaming: true,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: false,
      },
    },

    // Mail protocols
    mailto: {
      name: 'mailto',
      secure: false,
      defaultPort: undefined,
      allowedPorts: [],
      requiresHost: false,
      supportsAuth: false,
      category: ProtocolCategory.MAIL,
      security: {
        encrypted: false,
        warnings: ['Protocol does not guarantee message encryption'],
      },
      capabilities: {
        supportsStreaming: false,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: false,
      },
    },
    smtp: {
      name: 'smtp',
      secure: false,
      defaultPort: 25,
      allowedPorts: [25, 587],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.MAIL,
      security: {
        encrypted: false,
        warnings: ['Protocol may not use encryption by default'],
      },
      capabilities: {
        supportsStreaming: false,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: true,
        maxRequestSize: 25 * 1024 * 1024, // 25MB
        timeout: 300000, // 5 minutes
      },
    },
    smtps: {
      name: 'smtps',
      secure: true,
      defaultPort: 465,
      allowedPorts: [465],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.MAIL,
      security: {
        encrypted: true,
        warnings: [],
      },
      capabilities: {
        supportsStreaming: false,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: true,
        maxRequestSize: 25 * 1024 * 1024, // 25MB
        timeout: 300000, // 5 minutes
      },
    },
    imap: {
      name: 'imap',
      secure: false,
      defaultPort: 143,
      allowedPorts: [143],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.MAIL,
      security: {
        encrypted: false,
        warnings: ['Protocol does not use encryption by default'],
      },
      capabilities: {
        supportsStreaming: false,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: true,
        timeout: 180000, // 3 minutes
      },
    },
    imaps: {
      name: 'imaps',
      secure: true,
      defaultPort: 993,
      allowedPorts: [993],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.MAIL,
      security: {
        encrypted: true,
        warnings: [],
      },
      capabilities: {
        supportsStreaming: false,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: true,
        timeout: 180000, // 3 minutes
      },
    },

    // Media protocols
    rtmp: {
      name: 'rtmp',
      secure: false,
      defaultPort: 1935,
      allowedPorts: [1935],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.MEDIA,
      security: {
        encrypted: false,
        warnings: ['Protocol does not use encryption'],
      },
      capabilities: {
        supportsStreaming: true,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: false,
        timeout: 60000, // 1 minute
      },
    },
    rtsp: {
      name: 'rtsp',
      secure: false,
      defaultPort: 554,
      allowedPorts: [554],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.MEDIA,
      security: {
        encrypted: false,
        warnings: ['Protocol does not use encryption by default'],
      },
      capabilities: {
        supportsStreaming: true,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: false,
        timeout: 60000, // 1 minute
      },
    },

    // Messaging protocols
    mqtt: {
      name: 'mqtt',
      secure: false,
      defaultPort: 1883,
      allowedPorts: [1883],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.MESSAGING,
      security: {
        encrypted: false,
        warnings: ['Protocol does not use encryption by default'],
      },
      capabilities: {
        supportsStreaming: true,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: false,
        timeout: 30000, // 30 seconds
      },
    },
    amqp: {
      name: 'amqp',
      secure: false,
      defaultPort: 5672,
      allowedPorts: [5672],
      requiresHost: true,
      supportsAuth: true,
      category: ProtocolCategory.MESSAGING,
      security: {
        encrypted: false,
        warnings: ['Protocol does not use encryption by default'],
      },
      capabilities: {
        supportsStreaming: true,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: true,
        timeout: 30000, // 30 seconds
      },
    },
  }

  /**
   * Checks if a protocol exists in the registry
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol is registered
   */
  public static hasProtocol(protocol: string): boolean {
    const normalizedProtocol = this.normalizeProtocol(protocol)
    return normalizedProtocol in this.protocols
  }

  /**
   * Gets information about a protocol
   * @param {string} protocol - The protocol to get information for
   * @returns {ProtocolFullInfo} Detailed protocol information
   * @throws {ValidationError} If the protocol is unknown
   */
  public static getProtocol(protocol: string): ProtocolFullInfo {
    const normalizedProtocol = this.normalizeProtocol(protocol)

    if (!this.hasProtocol(normalizedProtocol)) {
      throw new ValidationError(
        `Unknown protocol: ${protocol}`,
        ErrorCode.INVALID_PROTOCOL,
      )
    }

    return this.protocols[normalizedProtocol]
  }

  /**
   * Gets a list of all registered protocols
   * @returns {ProtocolFullInfo[]} Array of all protocol definitions
   */
  public static getAllProtocols(): ProtocolFullInfo[] {
    return Object.values(this.protocols)
  }

  /**
   * Gets a list of protocols in a specific category
   * @param {ProtocolCategory} category - The category to filter by
   * @returns {ProtocolFullInfo[]} Array of protocols in the category
   */
  public static getProtocolsByCategory(
    category: ProtocolCategory,
  ): ProtocolFullInfo[] {
    return Object.values(this.protocols).filter(
      protocol => protocol.category === category,
    )
  }

  /**
   * Gets a list of secure protocols
   * @returns {ProtocolFullInfo[]} Array of secure protocols
   */
  public static getSecureProtocols(): ProtocolFullInfo[] {
    return Object.values(this.protocols).filter(protocol => protocol.secure)
  }

  /**
   * Normalizes a protocol name (removes colons and slashes, converts to lowercase)
   * @param {string} protocol - The protocol to normalize
   * @returns {string} The normalized protocol name
   */
  public static normalizeProtocol(protocol: string): string {
    return protocol.toLowerCase().replace(/[:/]+$/, '')
  }

  /**
   * Checks if a protocol is secure
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol is secure
   */
  public static isSecure(protocol: string): boolean {
    try {
      const protocolInfo = this.getProtocol(protocol)
      return protocolInfo.secure
    }
    catch (error) {
      // For unknown protocols, assume they are insecure
      return false
    }
  }

  /**
   * Gets the default port for a protocol
   * @param {string} protocol - The protocol to check
   * @returns {number | undefined} The default port or undefined if none
   */
  public static getDefaultPort(protocol: string): number | undefined {
    try {
      const protocolInfo = this.getProtocol(protocol)
      return protocolInfo.defaultPort
    }
    catch (error) {
      return undefined
    }
  }

  /**
   * Checks if a port is allowed for a protocol
   * @param {string} protocol - The protocol to check
   * @param {number} port - The port to validate
   * @returns {boolean} True if the port is allowed
   */
  public static isPortAllowed(protocol: string, port: number): boolean {
    try {
      const protocolInfo = this.getProtocol(protocol)

      // If allowed ports list is empty, allow any valid port
      if (
        !protocolInfo.allowedPorts
        || protocolInfo.allowedPorts.length === 0
      ) {
        return port >= 1 && port <= 65535
      }

      return protocolInfo.allowedPorts.includes(port)
    }
    catch (error) {
      // For unknown protocols, check only the range
      return port >= 1 && port <= 65535
    }
  }

  /**
   * Checks if a protocol requires a host
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol requires a host
   */
  public static requiresHost(protocol: string): boolean {
    try {
      const protocolInfo = this.getProtocol(protocol)
      return protocolInfo.requiresHost
    }
    catch (error) {
      // For unknown protocols, assume a host is required
      return true
    }
  }

  /**
   * Checks if a protocol supports authentication
   * @param {string} protocol - The protocol to check
   * @returns {boolean} True if the protocol supports authentication
   */
  public static supportsAuth(protocol: string): boolean {
    try {
      const protocolInfo = this.getProtocol(protocol)
      return protocolInfo.supportsAuth
    }
    catch (error) {
      // For unknown protocols, assume authentication is not supported
      return false
    }
  }
}
