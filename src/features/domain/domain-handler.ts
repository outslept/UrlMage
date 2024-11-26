import { z } from 'zod';
import { DomainInfo, DomainPart, IpAddress } from './types';
import { isIP } from 'net';
import { parseDomain, ParseResultType } from 'parse-domain';
import { ValidationError } from '../../errors';

export class DomainHandler {
  /**
   * Parse a domain string into its constituent parts
   */
  public parse(domain: string): DomainInfo {
    // Remove protocol and path if present
    domain = domain.replace(/^[a-zA-Z]+:\/\//, '').split('/')[0];
    
    // Check if it's an IP address
    if (isIP(domain)) {
      return {
        fullDomain: domain,
        parts: [],
        tld: '',
        isIp: true,
        isLocal: this.isPrivateIP(domain) || this.isLoopbackIP(domain),
        isValid: true
      };
    }

    const parseResult = parseDomain(domain);
    
    if (!parseResult || parseResult.type === ParseResultType.Invalid) {
      throw new ValidationError(`Invalid domain: ${domain}`);
    }

    if (parseResult.type === ParseResultType.NotListed) {
      // Handle local domains
      return {
        fullDomain: domain,
        parts: [{ name: domain, level: 0, isPublicSuffix: false, isRegistrable: true }],
        tld: '',
        isIp: false,
        isLocal: true,
        isValid: true
      };
    }

    if (parseResult.type !== ParseResultType.Listed) {
      throw new ValidationError(`Invalid domain type: ${parseResult.type}`);
    }

    const { subDomains, domain: sld, topLevelDomains } = parseResult;
    const tld = topLevelDomains ? topLevelDomains.join('.') : '';

    if (!sld) {
      throw new ValidationError(`Invalid domain structure: ${domain}`);
    }

    const parts: DomainPart[] = [];
    let level = 0;

    // Add subdomains
    if (subDomains && subDomains.length > 0) {
      [...subDomains].reverse().forEach(sub => {
        parts.push({
          name: sub,
          level: level++,
          isPublicSuffix: false,
          isRegistrable: false
        });
      });
    }

    // Add SLD
    parts.push({
      name: sld,
      level: level++,
      isPublicSuffix: false,
      isRegistrable: true
    });

    // Add TLD
    if (tld) {
      parts.push({
        name: tld,
        level: level,
        isPublicSuffix: true,
        isRegistrable: false
      });
    }

    return {
      fullDomain: domain,
      parts,
      tld: tld || '',
      sld,
      subdomain: subDomains && subDomains.length > 0 ? subDomains.join('.') : undefined,
      isIp: false,
      isLocal: false,
      isValid: true
    };
  }

  /**
   * Parse an IP address string
   */
  public parseIP(ip: string): IpAddress {
    const version = isIP(ip);
    if (!version) {
      throw new ValidationError(`Invalid IP address: ${ip}`);
    }

    return {
      address: ip,
      version: version === 4 ? 'v4' : 'v6',
      isPrivate: this.isPrivateIP(ip),
      isLoopback: this.isLoopbackIP(ip),
      isMulticast: this.isMulticastIP(ip)
    };
  }

  /**
   * Normalize a domain name
   */
  public normalize(domain: string): string {
    // Remove protocol and path if present
    domain = domain.replace(/^[a-zA-Z]+:\/\//, '').split('/')[0];
    
    // Convert to lowercase
    domain = domain.toLowerCase();
    
    // Remove trailing dot
    domain = domain.replace(/\.$/, '');
    
    // Punycode conversion for IDN
    try {
      const url = new URL(`http://${domain}`);
      return url.hostname;
    } catch {
      return domain;
    }
  }

  /**
   * Get the root domain (TLD + SLD) from a domain string
   */
  public getRootDomain(domain: string): string {
    const info = this.parse(domain);
    if (info.isIp) {
      return domain;
    }

    const registrablePart = info.parts.find(part => part.isRegistrable);
    const tldPart = info.parts.find(part => part.isPublicSuffix);

    if (!registrablePart || !tldPart) {
      return domain;
    }

    return `${registrablePart.name}.${tldPart.name}`;
  }

  /**
   * Get all subdomains from a domain
   */
  public getSubdomains(domain: string): string[] {
    const info = this.parse(domain);
    if (info.isIp) {
      return [];
    }
    return info.parts
      .filter(part => !part.isPublicSuffix && !part.isRegistrable)
      .map(part => part.name);
  }

  /**
   * Add a subdomain to a domain
   */
  public addSubdomain(domain: string, subdomain: string): string {
    const info = this.parse(domain);
    if (info.isIp) {
      throw new ValidationError('Cannot add subdomain to IP address');
    }

    // Validate subdomain
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(subdomain)) {
      throw new ValidationError(
        'Invalid subdomain. Must start and end with alphanumeric characters and can contain hyphens in between.'
      );
    }

    return `${subdomain}.${domain}`;
  }

  /**
   * Remove the leftmost subdomain from a domain
   */
  public removeSubdomain(domain: string): string {
    const info = this.parse(domain);
    if (info.isIp) {
      return domain;
    }

    const parts = info.parts;
    if (parts.length <= 2) { // Only TLD and SLD
      return domain;
    }

    return parts
      .slice(1) // Remove first subdomain
      .map(part => part.name)
      .join('.');
  }

  /**
   * Replace all subdomains with a new one
   */
  public replaceSubdomains(domain: string, newSubdomain: string): string {
    const info = this.parse(domain);
    if (info.isIp) {
      throw new ValidationError('Cannot replace subdomains in IP address');
    }

    const rootDomain = this.getRootDomain(domain);
    return this.addSubdomain(rootDomain, newSubdomain);
  }

  /**
   * Get subdomain level (depth)
   */
  public getSubdomainDepth(domain: string): number {
    return this.getSubdomains(domain).length;
  }

  /**
   * Check if one domain is a subdomain of another
   */
  public isSubdomainOf(domain: string, parentDomain: string): boolean {
    const domainInfo = this.parse(domain);
    const parentInfo = this.parse(parentDomain);

    if (domainInfo.isIp || parentInfo.isIp) {
      return false;
    }

    const domainRoot = this.getRootDomain(domain);
    const parentRoot = this.getRootDomain(parentDomain);

    // First check if they share the same root domain
    if (domainRoot !== parentRoot) {
      return false;
    }

    // Get subdomains for both
    const domainSubs = this.getSubdomains(domain);
    const parentSubs = this.getSubdomains(parentDomain);

    // Domain must have more subdomains than parent
    if (domainSubs.length <= parentSubs.length) {
      return false;
    }

    // Check if parent's subdomains match the end of domain's subdomains
    const domainSubStr = domainSubs.join('.');
    const parentSubStr = parentSubs.join('.');

    return domainSubStr.endsWith(parentSubStr);
  }

  /**
   * Check if IP is private
   */
  private isPrivateIP(ip: string): boolean {
    const addr = this.parseIPv4(ip);
    if (!addr) return false;

    return (
      (addr[0] === 10) ||
      (addr[0] === 172 && addr[1] >= 16 && addr[1] <= 31) ||
      (addr[0] === 192 && addr[1] === 168)
    );
  }

  /**
   * Check if IP is loopback
   */
  private isLoopbackIP(ip: string): boolean {
    const addr = this.parseIPv4(ip);
    if (!addr) return false;

    return addr[0] === 127;
  }

  /**
   * Check if IP is multicast
   */
  private isMulticastIP(ip: string): boolean {
    const addr = this.parseIPv4(ip);
    if (!addr) return false;
    return addr[0] >= 224 && addr[0] <= 239;
  }

  /**
   * Parse IPv4 address into octets
   */
  private parseIPv4(ip: string): number[] | null {
    if (!isIP(ip) || isIP(ip) === 6) return null;
    return ip.split('.').map(Number);
  }
}
