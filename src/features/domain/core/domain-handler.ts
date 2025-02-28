import { DomainInfo, IpAddress } from '../types/domain'
import { DomainParser } from './domain-parser'
import { IpHandler } from './ip-handler'
import { PunycodeUtils } from '../utils/punycode'
import { DomainOperations, IDomainHandler } from '../utils/domain-operations'

// Acts as a facade for various domain-related operations
export class DomainHandler implements IDomainHandler {
  private readonly domainParser: DomainParser       // For parsing domain structures
  private readonly ipHandler: IpHandler             // For handling IP addresses
  private readonly punycodeUtils: PunycodeUtils     // For Punycode conversions
  private readonly domainOperations: DomainOperations // For domain manipulation operations

  constructor() {
    // Initialize all the required components
    this.domainParser = new DomainParser()
    this.ipHandler = new IpHandler()
    this.punycodeUtils = new PunycodeUtils()
    // Note: DomainOperations requires this DomainHandler instance
    this.domainOperations = new DomainOperations(this);
  }

  // Parse a domain string into structured information
  public parse(domain: string): DomainInfo {
    return this.domainParser.parse(domain)
  }

  // Parse an IP address string into structured information
  public parseIP(ip: string): IpAddress {
    return this.ipHandler.parseIP(ip)
  }

  // Normalize a domain for consistent processing
  public normalize(domain: string): string {
    return this.domainParser.normalize(domain)
  }

  // Convert a domain with international characters to Punycode
  public toPunycode(domain: string): string {
    return this.punycodeUtils.toPunycode(domain)
  }

  // Convert a Punycode domain back to Unicode representation
  public fromPunycode(domain: string): string {
    return this.punycodeUtils.fromPunycode(domain)
  }

  // Get the root domain (registrable part + TLD)
  public getRootDomain(domain: string): string {
    return this.domainOperations.getRootDomain(domain)
  }

  // Get all subdomains as an array of strings
  public getSubdomains(domain: string): string[] {
    return this.domainOperations.getSubdomains(domain)
  }

  // Add a subdomain to an existing domain
  public addSubdomain(domain: string, subdomain: string): string {
    return this.domainOperations.addSubdomain(domain, subdomain)
  }

  // Remove the leftmost subdomain from a domain
  public removeSubdomain(domain: string): string {
    return this.domainOperations.removeSubdomain(domain)
  }

  // Replace all subdomains with a new one
  public replaceSubdomains(domain: string, newSubdomain: string): string {
    return this.domainOperations.replaceSubdomains(domain, newSubdomain)
  }

  // Get the number of subdomain levels
  public getSubdomainDepth(domain: string): number {
    return this.domainOperations.getSubdomainDepth(domain)
  }

  // Check if one domain is a subdomain of another
  public isSubdomainOf(domain: string, parentDomain: string): boolean {
    return this.domainOperations.isSubdomainOf(domain, parentDomain)
  }
}
