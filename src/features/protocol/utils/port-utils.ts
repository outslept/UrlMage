import { ProtocolRegistry } from '../core/protocol-registry'
import { ProtocolParser } from '../core/protocol-parser'

export class PortUtils {
  private readonly parser: ProtocolParser

  constructor() {
    this.parser = new ProtocolParser()
  }

  public getCommonPortsForProtocol(protocol: string): number[] {
    try {
      const protocolInfo = ProtocolRegistry.getProtocol(protocol)
      if (protocolInfo.allowedPorts && protocolInfo.allowedPorts.length > 0) {
        return protocolInfo.allowedPorts
      }
      
      if (protocolInfo.defaultPort) {
        return [protocolInfo.defaultPort]
      }
      
      return []
    } catch (error) {
      // Protocol not found in registry
      return []
    }
  }

  public isCommonPortForProtocol(protocol: string, port: number): boolean {
    const commonPorts = this.getCommonPortsForProtocol(protocol)
    return commonPorts.includes(port)
  }

  public getProtocolsForPort(port: number): string[] {
    const protocols: string[] = []
    
    const allProtocols = ProtocolRegistry.getAllProtocols()
    for (const protocol of allProtocols) {
      if (protocol.defaultPort === port) {
        protocols.push(protocol.name)
      } else if (protocol.allowedPorts && protocol.allowedPorts.includes(port)) {
        protocols.push(protocol.name)
      }
    }
    
    return protocols
  }

  public isWellKnownPort(port: number): boolean {
    return Number.isInteger(port) && port >= 0 && port <= 1023
  }

  public isRegisteredPort(port: number): boolean {
    return Number.isInteger(port) && port >= 1024 && port <= 49151
  }

  public isDynamicPort(port: number): boolean {
    return Number.isInteger(port) && port >= 49152 && port <= 65535
  }

  public extractPortFromUrl(url: string): number | undefined {
    return this.parser.extractPortFromUrl(url)
  }

  public getPortCategoryDescription(port: number): string {
    if (this.isWellKnownPort(port)) {
      return 'Well-known port (0-1023)'
    } else if (this.isRegisteredPort(port)) {
      return 'Registered port (1024-49151)'
    } else if (this.isDynamicPort(port)) {
      return 'Dynamic/private port (49152-65535)'
    } else {
      return 'Invalid port'
    }
  }
}
