import { ProtocolSecurityChecker } from './protocol-security'

export class EncryptionChecker {
  private readonly securityChecker: ProtocolSecurityChecker

  constructor() {
    this.securityChecker = new ProtocolSecurityChecker()
  }

  public usesEncryption(protocol: string): boolean {
    return this.securityChecker.isEncrypted(protocol)
  }

  public usesTLS(protocol: string): boolean {
    return this.securityChecker.requiresTLS(protocol)
  }

  public getEncryptionStrength(protocol: string): 'high' | 'medium' | 'low' | 'none' {
    if (!this.usesEncryption(protocol)) {
      return 'none'
    }

    const security = this.securityChecker.getSecurityInfo(protocol)
    
    // Check TLS version for strength determination
    if (security.tlsVersion) {
      if (security.tlsVersion.includes('1.3')) {
        return 'high'
      } else if (security.tlsVersion.includes('1.2')) {
        return 'medium'
      } else {
        return 'low'
      }
    }
    
    // If no specific TLS version but protocol is encrypted
    if (this.securityChecker.isSecure(protocol)) {
      return 'medium'
    }
    
    return 'low'
  }

  public hasStrongEncryption(protocol: string): boolean {
    return this.getEncryptionStrength(protocol) === 'high'
  }

  public hasWeakEncryption(protocol: string): boolean {
    const strength = this.getEncryptionStrength(protocol)
    return strength === 'low' || strength === 'none'
  }

  public isEncryptionSecure(protocol: string): boolean {
    const strength = this.getEncryptionStrength(protocol)
    return strength === 'high' || strength === 'medium'
  }

  public getSecureAlternative(protocol: string): string | undefined {
    if (this.isEncryptionSecure(protocol)) {
      return undefined // Already secure
    }
    
    return this.securityChecker.getSecureAlternative(protocol)
  }
}
