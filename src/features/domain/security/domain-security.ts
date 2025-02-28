import { isIP } from 'node:net'
import { ValidationError } from '../../../errors'
import { ErrorCode } from '../../../errors/types'
import { DomainHandler } from '../core/domain-handler'
import { SUSPICIOUS_TLDS } from '../constants'
import { PhishingDetector } from './phishing'
import { ReputationChecker } from './reputation-checker'

export class DomainSecurity {
  private readonly domainHandler: DomainHandler
  private readonly phishingDetector: PhishingDetector
  private readonly reputationChecker: ReputationChecker
  private readonly suspiciousTLDs = SUSPICIOUS_TLDS  // List of TLDs known for abuse

  constructor() {
    this.domainHandler = new DomainHandler()
    this.phishingDetector = new PhishingDetector(this.domainHandler)
    this.reputationChecker = new ReputationChecker(this.domainHandler)
  }

  // Determines if a domain meets basic security criteria
  public async isSecure(domain: string): Promise<boolean> {
    try {
      // Normalize the domain for consistent processing
      const normalizedDomain = this.domainHandler.normalize(domain)

      // For IP addresses, check IP-specific security concerns
      if (isIP(normalizedDomain)) {
        return !this.isUnsafeIP(normalizedDomain)
      }

      // Parse the domain to access its components
      const info = this.domainHandler.parse(normalizedDomain)

      // Local domains (like .localhost, .local) are considered insecure
      if (info.isLocal) {
        return false
      }

      // Check if the domain uses a TLD known for abuse
      if (info.tld && this.suspiciousTLDs.includes(info.tld.toLowerCase())) {
        return false
      }

      // Domain passed all basic security checks
      return true
    }
    catch (error) {
      // Handle errors during security assessment
      if (error instanceof Error) {
        throw new ValidationError(
          `Failed to check domain security: ${error.message}`,
          ErrorCode.SECURITY_RISK,
        )
      }
      throw new ValidationError(
        'Failed to check domain security: Unknown error',
        ErrorCode.SECURITY_RISK,
      )
    }
  }

  // Delegates trust checking to the reputation checker
  public isTrusted(domain: string, trustedDomains: string[]): boolean {
    return this.reputationChecker.isTrusted(domain, trustedDomains)
  }

  // Delegates blacklist checking to the reputation checker
  public isBlacklisted(domain: string, blacklist: string[]): boolean {
    return this.reputationChecker.isBlacklisted(domain, blacklist)
  }

  // Delegates phishing detection to the phishing detector
  public isPotentialPhishing(domain: string, targetDomain: string): boolean {
    return this.phishingDetector.isPotentialPhishing(domain, targetDomain)
  }

  // Determines if an IP address is unsafe for general use
  private isUnsafeIP(ip: string): boolean {
    // Validate that the input is actually an IP address
    if (!isIP(ip)) {
      return true
    }

    // Parse the IP to get detailed information
    const ipInfo = this.domainHandler.parseIP(ip)
    
    // IPs in private networks, loopback addresses, and multicast addresses
    // are considered unsafe for general internet usage
    return ipInfo.isPrivate || ipInfo.isLoopback || ipInfo.isMulticast
  }
}
