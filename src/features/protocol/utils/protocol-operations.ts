import { ProtocolParser } from '../core/protocol-parser'
import { ProtocolRegistry } from '../core/protocol-registry'

export class ProtocolOperations {
  private readonly parser: ProtocolParser

  constructor() {
    this.parser = new ProtocolParser()
  }

  public convertToSecureUrl(url: string): string {
    if (!url) return url
    
    try {
      const urlObj = new URL(url)
      const protocol = this.parser.extractFromUrl(url)
      
      if (!protocol) return url
      
      const secureProtocol = this.parser.toSecureProtocol(protocol)
      
      if (secureProtocol !== protocol) {
        urlObj.protocol = `${secureProtocol}:`
        return urlObj.toString()
      }
      
      return url
    } catch (error) {
      // Invalid URL, return original
      return url
    }
  }

  public normalizeUrl(url: string): string {
    if (!url) return url
    
    try {
      const urlObj = new URL(url)
      return urlObj.toString()
    } catch (error) {
      // If it's not a valid URL, try to fix common issues
      
      // Check if missing protocol
      if (!url.includes('://')) {
        // Assume http by default
        return this.normalizeUrl(`http://${url}`)
      }
      
      // If still invalid, return original
      return url
    }
  }

  public getDefaultPortForUrl(url: string): number | undefined {
    const protocol = this.parser.extractFromUrl(url)
    if (!protocol) return undefined
    
    return ProtocolRegistry.getDefaultPort(protocol)
  }

  public usesDefaultPort(url: string): boolean {
    try {
      const urlObj = new URL(url)
      if (!urlObj.port) {
        return true
      }
      
      const defaultPort = this.getDefaultPortForUrl(url)
      if (!defaultPort) return false
      
      return parseInt(urlObj.port, 10) === defaultPort
    } catch (error) {
      return false
    }
  }

  public removeDefaultPort(url: string): string {
    if (!url) return url
    
    try {
      const urlObj = new URL(url)
      const defaultPort = this.getDefaultPortForUrl(url)
      
      if (defaultPort && urlObj.port && parseInt(urlObj.port, 10) === defaultPort) {
        urlObj.port = ''
        return urlObj.toString()
      }
      
      return url
    } catch (error) {
      return url
    }
  }

  public isUrlSuitableFor(
    url: string, 
    usage: 'browsing' | 'download' | 'upload' | 'streaming' | 'messaging'
  ): boolean {
    const protocol = this.parser.extractFromUrl(url)
    if (!protocol) return false
    
    const usageMap: Record<string, string[]> = {
      browsing: ['http', 'https', 'file'],
      download: ['http', 'https', 'ftp', 'sftp', 'file'],
      upload: ['http', 'https', 'ftp', 'sftp'],
      streaming: ['http', 'https', 'ws', 'wss', 'rtmp', 'rtsp'],
      messaging: ['ws', 'wss', 'mqtt', 'amqp'],
    }
    
    return usageMap[usage]?.includes(protocol) || false
  }
}
