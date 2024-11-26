import { DomainHandler } from './domain-handler';
import { ValidationError } from '../../errors';

export class DomainSecurity {
  private domainHandler: DomainHandler;

  constructor() {
    this.domainHandler = new DomainHandler();
  }

  /**
   * Check if domain is secure
   */
  public async isSecure(domain: string): Promise<boolean> {
    try {
      const info = this.domainHandler.parse(domain);
      
      // IP addresses are considered insecure
      if (info.isIp) {
        return false;
      }

      // Local domains are considered insecure
      if (info.isLocal) {
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(`Failed to check domain security: ${error.message}`);
      }
      throw new ValidationError('Failed to check domain security: Unknown error');
    }
  }

  /**
   * Check if domain is trusted
   */
  public isTrusted(domain: string, trustedDomains: string[]): boolean {
    try {
      const info = this.domainHandler.parse(domain);
      
      // IP addresses are never trusted
      if (info.isIp) {
        return false;
      }

      // Check if domain or any parent domain is in trusted list
      const rootDomain = this.domainHandler.getRootDomain(domain);
      return trustedDomains.some(trusted => {
        const trustedRoot = this.domainHandler.getRootDomain(trusted);
        return rootDomain === trustedRoot;
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(`Failed to check domain trust: ${error.message}`);
      }
      throw new ValidationError('Failed to check domain trust: Unknown error');
    }
  }

  /**
   * Check if domain is blacklisted
   */
  public isBlacklisted(domain: string, blacklist: string[]): boolean {
    try {
      const info = this.domainHandler.parse(domain);
      
      // IP addresses are always considered blacklisted
      if (info.isIp) {
        return true;
      }

      // Check if domain or any parent domain is in blacklist
      const rootDomain = this.domainHandler.getRootDomain(domain);
      return blacklist.some(blocked => {
        const blockedRoot = this.domainHandler.getRootDomain(blocked);
        return rootDomain === blockedRoot;
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(`Failed to check domain blacklist: ${error.message}`);
      }
      throw new ValidationError('Failed to check domain blacklist: Unknown error');
    }
  }
}
