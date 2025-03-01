import { ProtocolRegistry } from '../core/protocol-registry'
import { ProtocolSecurityChecker } from './protocol-security'

export class SecurityWarningsGenerator {
  private readonly securityChecker: ProtocolSecurityChecker

  constructor() {
    this.securityChecker = new ProtocolSecurityChecker()
  }

  public getWarnings(protocol: string): string[] {
    const registeredWarnings = this.securityChecker.getSecurityWarnings(protocol)

    if (registeredWarnings.length > 0) {
      return registeredWarnings
    }

    // Generate warnings if none are registered
    return this.generateWarnings(protocol)
  }

  private generateWarnings(protocol: string): string[] {
    const warnings: string[] = []
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)

    // Check if protocol is secure
    if (!this.securityChecker.isSecure(normalizedProtocol)) {
      warnings.push('Protocol does not use encryption')

      // Check if secure alternative exists
      const secureAlternative = this.securityChecker.getSecureAlternative(normalizedProtocol)
      if (secureAlternative) {
        warnings.push(`Consider using ${secureAlternative.toUpperCase()} for secure communication`)
      }
    }

    // Check for deprecated protocols
    if (this.isDeprecated(normalizedProtocol)) {
      warnings.push('This protocol is deprecated and may have security vulnerabilities')
    }

    // Check for dangerous protocols
    if (this.isDangerous(normalizedProtocol)) {
      warnings.push('This protocol may be unsafe and could be used for malicious purposes')
    }

    return warnings
  }

  private isDeprecated(protocol: string): boolean {
    const deprecatedProtocols = ['telnet', 'gopher', 'wais', 'ftp']
    return deprecatedProtocols.includes(protocol)
  }

  private isDangerous(protocol: string): boolean {
    const dangerousProtocols = [
      'javascript',
      'data',
      'vbscript',
      'jscript',
      'livescript',
      'mocha',
    ]
    return dangerousProtocols.includes(protocol)
  }

  public isSuitableForSensitiveInfo(protocol: string): boolean {
    return this.securityChecker.isSecure(protocol)
      && !this.securityChecker.hasSecurityWarnings(protocol)
  }

  public getSecurityRecommendations(protocol: string): string[] {
    const recommendations: string[] = []
    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)

    if (!this.securityChecker.isSecure(normalizedProtocol)) {
      const secureAlternative = this.securityChecker.getSecureAlternative(normalizedProtocol)
      if (secureAlternative) {
        recommendations.push(`Use ${secureAlternative} instead of ${normalizedProtocol}`)
      }
      else {
        recommendations.push('Use a secure protocol for sensitive information')
      }
    }

    if (this.securityChecker.hasSecurityWarnings(normalizedProtocol)) {
      recommendations.push('Review security warnings before using this protocol')
    }

    return recommendations
  }
}
