import type { ProtocolFullInfo } from '../types/protocol'
import { ValidationError } from '../../errors'
import { ErrorCode } from '../../errors/types'
import { ProtocolCategory } from '../types/protocol'

export class ProtocolRegistry {

  private static readonly protocols: Record<string, ProtocolFullInfo> = {

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
        maxRequestSize: 2 * 1024 * 1024, 
        timeout: 30000, 
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
        maxRequestSize: 2 * 1024 * 1024, 
        timeout: 30000, 
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
        timeout: 30000, 
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
        timeout: 30000, 
      },
    },

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
        maxRequestSize: 10 * 1024 * 1024 * 1024, 
        timeout: 120000, 
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
        maxRequestSize: 10 * 1024 * 1024 * 1024, 
        timeout: 120000, 
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
        encrypted: true, 
        warnings: [],
      },
      capabilities: {
        supportsStreaming: true,
        supportsCompression: false,
        supportsProxy: false,
        requiresAuthentication: false,
      },
    },

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
        maxRequestSize: 25 * 1024 * 1024, 
        timeout: 300000, 
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
        maxRequestSize: 25 * 1024 * 1024, 
        timeout: 300000, 
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
        timeout: 180000, 
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
        timeout: 180000, 
      },
    },

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
        timeout: 60000, 
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
        timeout: 60000, 
      },
    },

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
        timeout: 30000, 
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
        timeout: 30000, 
      },
    },
  }

  public static hasProtocol(protocol: string): boolean {
    const normalizedProtocol = this.normalizeProtocol(protocol)
    return normalizedProtocol in this.protocols
  }

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

  public static getAllProtocols(): ProtocolFullInfo[] {
    return Object.values(this.protocols)
  }

  public static getProtocolsByCategory(
    category: ProtocolCategory,
  ): ProtocolFullInfo[] {
    return Object.values(this.protocols).filter(
      protocol => protocol.category === category,
    )
  }

  public static getSecureProtocols(): ProtocolFullInfo[] {
    return Object.values(this.protocols).filter(protocol => protocol.secure)
  }

  public static normalizeProtocol(protocol: string): string {
    return protocol.toLowerCase().replace(/[:/]+$/, '')
  }

  public static isSecure(protocol: string): boolean {
    try {
      const protocolInfo = this.getProtocol(protocol)
      return protocolInfo.secure
    }
    catch (error) {
      return false
    }
  }

  public static getDefaultPort(protocol: string): number | undefined {
    try {
      const protocolInfo = this.getProtocol(protocol)
      return protocolInfo.defaultPort
    }
    catch (error) {
      return undefined
    }
  }

  public static isPortAllowed(protocol: string, port: number): boolean {
    try {
      const protocolInfo = this.getProtocol(protocol)

      if (
        !protocolInfo.allowedPorts
        || protocolInfo.allowedPorts.length === 0
      ) {
        return port >= 1 && port <= 65535
      }

      return protocolInfo.allowedPorts.includes(port)
    }
    catch (error) {
      return port >= 1 && port <= 65535
    }
  }

  public static requiresHost(protocol: string): boolean {
    try {
      const protocolInfo = this.getProtocol(protocol)
      return protocolInfo.requiresHost
    }
    catch (error) {
      return true
    }
  }

  public static supportsAuth(protocol: string): boolean {
    try {
      const protocolInfo = this.getProtocol(protocol)
      return protocolInfo.supportsAuth
    }
    catch (error) {
      return false
    }
  }
}
