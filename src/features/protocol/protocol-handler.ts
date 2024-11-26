import { ProtocolInfo, ProtocolSecurity, ProtocolCapabilities } from './types';
import { ValidationError } from '../../errors';

export class ProtocolHandler {
  private static readonly DEFAULT_PORTS: Record<string, number> = {
    http: 80,
    https: 443,
    ftp: 21,
    sftp: 22,
    ssh: 22,
    telnet: 23,
    smtp: 25,
    smtps: 465,
    imap: 143,
    imaps: 993,
    pop3: 110,
    pop3s: 995,
    ldap: 389,
    ldaps: 636,
    mongodb: 27017,
    redis: 6379,
    mysql: 3306,
    postgresql: 5432,
    amqp: 5672,
    mqtt: 1883,
    ws: 80,
    wss: 443
  };

  private static readonly SECURE_PROTOCOLS = new Set([
    'https',
    'sftp',
    'smtps',
    'imaps',
    'pop3s',
    'ldaps',
    'wss'
  ]);

  /**
   * Parse and validate a protocol string
   */
  public parse(protocol: string): ProtocolInfo {
    // Remove trailing colons and slashes
    protocol = protocol.toLowerCase().replace(/[:\/]+$/, '');

    if (!this.isValid(protocol)) {
      throw new ValidationError(`Invalid protocol: ${protocol}`);
    }

    return {
      name: protocol,
      secure: this.isSecure(protocol),
      defaultPort: this.getDefaultPort(protocol),
      allowedPorts: this.getAllowedPorts(protocol),
      requiresHost: this.requiresHost(protocol),
      supportsAuth: this.supportsAuth(protocol),
      category: this.getCategory(protocol)
    };
  }

  /**
   * Check if a protocol is valid
   */
  public isValid(protocol: string): boolean {
    // Basic protocol format validation
    return /^[a-z][a-z0-9+.-]*$/.test(protocol);
  }

  /**
   * Check if a protocol is secure
   */
  public isSecure(protocol: string): boolean {
    return ProtocolHandler.SECURE_PROTOCOLS.has(protocol) ||
           protocol.endsWith('s');
  }

  /**
   * Get default port for a protocol
   */
  public getDefaultPort(protocol: string): number | undefined {
    return ProtocolHandler.DEFAULT_PORTS[protocol];
  }

  /**
   * Get allowed ports for a protocol
   */
  public getAllowedPorts(protocol: string): number[] {
    const defaultPort = this.getDefaultPort(protocol);
    if (!defaultPort) {
      return [];
    }
    
    // Some protocols have alternative ports
    const alternativePorts: Record<string, number[]> = {
      http: [8080, 8000, 3000],
      https: [8443, 4443],
      mongodb: [27018, 27019],
      postgresql: [5433]
    };

    return [defaultPort, ...(alternativePorts[protocol] || [])];
  }

  /**
   * Check if protocol requires a host
   */
  public requiresHost(protocol: string): boolean {
    const noHostProtocols = new Set([
      'file',
      'data',
      'about',
      'javascript',
      'mailto'
    ]);
    return !noHostProtocols.has(protocol);
  }

  /**
   * Check if protocol supports authentication
   */
  public supportsAuth(protocol: string): boolean {
    const authProtocols = new Set([
      'http',
      'https',
      'ftp',
      'sftp',
      'ssh',
      'smtp',
      'smtps',
      'imap',
      'imaps',
      'pop3',
      'pop3s',
      'ldap',
      'ldaps',
      'mongodb',
      'redis',
      'mysql',
      'postgresql'
    ]);
    return authProtocols.has(protocol);
  }

  /**
   * Get protocol category
   */
  public getCategory(protocol: string): 'web' | 'mail' | 'file' | 'media' | 'messaging' | 'other' {
    const categories: Record<string, 'web' | 'mail' | 'file' | 'media' | 'messaging' | 'other'> = {
      http: 'web',
      https: 'web',
      ftp: 'file',
      sftp: 'file',
      file: 'file',
      mailto: 'mail',
      smtp: 'mail',
      smtps: 'mail',
      imap: 'mail',
      imaps: 'mail',
      pop3: 'mail',
      pop3s: 'mail',
      rtmp: 'media',
      rtsp: 'media',
      ws: 'messaging',
      wss: 'messaging',
      mqtt: 'messaging',
      amqp: 'messaging'
    };

    return categories[protocol] || 'other';
  }

  /**
   * Get security information for a protocol
   */
  public getSecurity(protocol: string): ProtocolSecurity {
    const info = this.parse(protocol);

    return {
      encrypted: info.secure,
      tlsVersion: info.secure ? 'TLS 1.3' : undefined,
      certificates: info.secure ? [] : undefined,
      ciphers: info.secure ? ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'] : undefined,
      warnings: this.getSecurityWarnings(protocol)
    };
  }

  /**
   * Get capabilities for a protocol
   */
  public getCapabilities(protocol: string): ProtocolCapabilities {
    const info = this.parse(protocol);

    return {
      supportsStreaming: this.supportsStreaming(protocol),
      supportsCompression: this.supportsCompression(protocol),
      supportsProxy: this.supportsProxy(protocol),
      requiresAuthentication: this.requiresAuthentication(protocol),
      maxRequestSize: this.getMaxRequestSize(protocol),
      timeout: this.getDefaultTimeout(protocol)
    };
  }

  private supportsStreaming(protocol: string): boolean {
    return new Set(['http', 'https', 'ws', 'wss', 'rtmp', 'rtsp']).has(protocol);
  }

  private supportsCompression(protocol: string): boolean {
    return new Set(['http', 'https', 'ws', 'wss']).has(protocol);
  }

  private supportsProxy(protocol: string): boolean {
    return new Set(['http', 'https', 'ftp', 'ws', 'wss']).has(protocol);
  }

  private requiresAuthentication(protocol: string): boolean {
    return new Set(['sftp', 'ssh', 'smtps', 'imaps', 'pop3s', 'ldaps']).has(protocol);
  }

  private getMaxRequestSize(protocol: string): number | undefined {
    const sizes: Record<string, number> = {
      http: 2 * 1024 * 1024, // 2MB
      https: 2 * 1024 * 1024,
      ftp: 10 * 1024 * 1024 * 1024, // 10GB
      smtp: 25 * 1024 * 1024 // 25MB
    };
    return sizes[protocol];
  }

  private getDefaultTimeout(protocol: string): number | undefined {
    const timeouts: Record<string, number> = {
      http: 30000, // 30 seconds
      https: 30000,
      ftp: 120000, // 2 minutes
      smtp: 300000 // 5 minutes
    };
    return timeouts[protocol];
  }

  private getSecurityWarnings(protocol: string): string[] {
    const warnings: string[] = [];

    if (!this.isSecure(protocol)) {
      warnings.push('Protocol does not use encryption');
    }

    if (protocol === 'ftp' || protocol === 'telnet') {
      warnings.push('Protocol sends credentials in plaintext');
    }

    if (protocol === 'http') {
      warnings.push('Consider using HTTPS for secure communication');
    }

    return warnings;
  }
}
