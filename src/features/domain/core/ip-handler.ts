import { isIP } from 'node:net'
import { ValidationError } from '../../../errors'
import { ErrorCode } from '../../../errors/types'
import { IpAddress } from '../types/domain'

export class IpHandler {
  // Parse an IP address string into structured information
  public parseIP(ip: string): IpAddress {
    // Verify this is a valid IP address (returns 4 for IPv4, 6 for IPv6, 0 for invalid)
    const version = isIP(ip)
    if (!version) {
      throw new ValidationError(
        `Invalid IP address: ${ip}`,
        ErrorCode.INVALID_IP,
      )
    }

    // Return structured information about the IP address
    return {
      address: ip,
      version: version === 4 ? 'v4' : 'v6',  // Convert numeric version to string format
      isPrivate: this.isPrivateIP(ip),        // Check if IP is in private address ranges
      isLoopback: this.isLoopbackIP(ip),      // Check if IP is a loopback address
      isMulticast: this.isMulticastIP(ip),    // Check if IP is a multicast address
    }
  }

  // Determines if an IP address is in a private address range
  public isPrivateIP(ip: string): boolean {
    const version = isIP(ip)
    if (version === 0)
      return false

    if (version === 4) {
      // Parse IPv4 address into octets
      const addr = this.parseIPv4(ip)
      if (!addr)
        return false

      // Check against known private IPv4 address ranges:
      // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16 (link-local)
      return (
        addr[0] === 10 
        || (addr[0] === 172 && addr[1] >= 16 && addr[1] <= 31) 
        || (addr[0] === 192 && addr[1] === 168) 
        || (addr[0] === 169 && addr[1] === 254) 
      )
    }

    if (version === 6) {
      // Check against known private IPv6 address ranges:
      // fe80::/10 (link-local), fc00::/7 (unique local addresses)
      return (
        ip.toLowerCase().startsWith('fe80:')  // Link-local
        || ip.toLowerCase().startsWith('fc00:')  // Unique local
        || ip.toLowerCase().startsWith('fd00:')  // Unique local
      )
    }

    return false
  }

  // Determines if an IP address is a loopback address
  public isLoopbackIP(ip: string): boolean {
    const version = isIP(ip)
    if (version === 0)
      return false

    if (version === 4) {
      // Parse IPv4 address into octets
      const addr = this.parseIPv4(ip)
      if (!addr)
        return false
      // IPv4 loopback addresses are in the 127.0.0.0/8 range
      return addr[0] === 127
    }

    if (version === 6) {
      // IPv6 loopback address is ::1
      return ip === '::1'
    }

    return false
  }

  // Determines if an IP address is a multicast address
  public isMulticastIP(ip: string): boolean {
    const version = isIP(ip)
    if (version === 0)
      return false

    if (version === 4) {
      // Parse IPv4 address into octets
      const addr = this.parseIPv4(ip)
      if (!addr)
        return false
      // IPv4 multicast addresses are in the 224.0.0.0-239.255.255.255 range
      return addr[0] >= 224 && addr[0] <= 239
    }

    if (version === 6) {
      // IPv6 multicast addresses start with ff
      return ip.toLowerCase().startsWith('ff')
    }

    return false
  }

  // Helper method to parse IPv4 addresses into numeric octets
  public parseIPv4(ip: string): number[] | null {
    if (isIP(ip) !== 4)
      return null
    // Split the address by dots and convert each octet to a number
    return ip.split('.').map(Number)
  }
}
