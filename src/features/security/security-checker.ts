import { SecurityError } from '../../errors';
import {
  SecurityCheckResult,
  SecurityRiskLevel,
  SecurityScanOptions,
  SecurityScanResult
} from './types';

/**
 * Security checker for URLs
 */
export class SecurityChecker {
  private readonly defaultOptions: Required<SecurityScanOptions> = {
    maxRedirects: 5,
    timeoutMs: 5000,
    userAgent: 'UrlMage/1.0',
    followRedirects: true,
    checkSsl: true,
    checkDns: true,
    checkBlacklist: true
  };

  /**
   * Check URL security
   */
  public async checkUrl(url: string, options?: SecurityScanOptions): Promise<SecurityScanResult> {
    const opts = { ...this.defaultOptions, ...options };
    const checks: Record<string, SecurityCheckResult> = {};

    try {
      // Parse URL
      const parsed = new URL(url);

      // Basic URL checks
      checks.protocol = this.checkProtocol(parsed);
      checks.domain = await this.checkDomain(parsed, opts);
      checks.port = this.checkPort(parsed);
      checks.path = this.checkPath(parsed);
      checks.query = this.checkQuery(parsed);

      // Additional security checks
      if (opts.checkSsl) {
        checks.ssl = await this.checkSsl(parsed);
      }
      if (opts.checkDns) {
        checks.dns = await this.checkDns(parsed);
      }
      if (opts.checkBlacklist) {
        checks.blacklist = await this.checkBlacklist(parsed);
      }

      // Calculate overall risk level
      const riskLevel = this.calculateRiskLevel(checks);

      return {
        url: url,
        riskLevel,
        checks,
        timestamp: Date.now()
      };

    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new SecurityError('Security check failed', { cause: error });
      }
      throw error;
    }
  }

  /**
   * Check protocol security
   */
  private checkProtocol(parsed: URL): SecurityCheckResult {
    const secureProtocols = ['https:', 'sftp:', 'ftps:'];
    const insecureProtocols = ['http:', 'ftp:'];

    if (secureProtocols.includes(parsed.protocol)) {
      return {
        passed: true,
        riskLevel: SecurityRiskLevel.NONE,
        details: 'Secure protocol in use'
      };
    }

    if (insecureProtocols.includes(parsed.protocol)) {
      return {
        passed: false,
        riskLevel: SecurityRiskLevel.MEDIUM,
        details: 'Insecure protocol in use'
      };
    }

    return {
      passed: false,
      riskLevel: SecurityRiskLevel.HIGH,
      details: `Unknown protocol: ${parsed.protocol}`
    };
  }

  /**
   * Check domain security
   */
  private async checkDomain(parsed: URL, options: Required<SecurityScanOptions>): Promise<SecurityCheckResult> {
    try {
      // Basic domain checks
      if (parsed.hostname === 'localhost' || /^127\./.test(parsed.hostname)) {
        return {
          passed: false,
          riskLevel: SecurityRiskLevel.HIGH,
          details: 'Local hostname detected'
        };
      }

      if (/^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname)) {
        return {
          passed: false,
          riskLevel: SecurityRiskLevel.MEDIUM,
          details: 'IP address used as hostname'
        };
      }

      // DNS check if enabled
      if (options.checkDns) {
        try {
          await this.resolveDns(parsed.hostname);
        } catch (error) {
          if (error instanceof Error) {
            return {
              passed: false,
              riskLevel: SecurityRiskLevel.HIGH,
              details: `DNS resolution failed: ${error.message}`
            };
          }
          throw error;
        }
      }

      return {
        passed: true,
        riskLevel: SecurityRiskLevel.NONE,
        details: 'Domain checks passed'
      };

    } catch (error) {
      if (error instanceof Error) {
        throw new SecurityError('Domain check failed', { cause: error });
      }
      throw error;
    }
  }

  /**
   * Check port security
   */
  private checkPort(parsed: URL): SecurityCheckResult {
    const commonPorts = ['', '80', '443', '8080', '8443'];
    
    if (!parsed.port || commonPorts.includes(parsed.port)) {
      return {
        passed: true,
        riskLevel: SecurityRiskLevel.NONE,
        details: 'Common port in use'
      };
    }

    const portNum = parseInt(parsed.port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return {
        passed: false,
        riskLevel: SecurityRiskLevel.HIGH,
        details: 'Invalid port number'
      };
    }

    return {
      passed: true,
      riskLevel: SecurityRiskLevel.LOW,
      details: 'Uncommon port in use'
    };
  }

  /**
   * Check path security
   */
  private checkPath(parsed: URL): SecurityCheckResult {
    // Check for directory traversal attempts
    if (parsed.pathname.includes('..')) {
      return {
        passed: false,
        riskLevel: SecurityRiskLevel.HIGH,
        details: 'Directory traversal detected'
      };
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = ['.php', '.asp', '.aspx', '.exe', '.sh', '.bash'];
    if (suspiciousExtensions.some(ext => parsed.pathname.toLowerCase().endsWith(ext))) {
      return {
        passed: false,
        riskLevel: SecurityRiskLevel.MEDIUM,
        details: 'Suspicious file extension detected'
      };
    }

    return {
      passed: true,
      riskLevel: SecurityRiskLevel.NONE,
      details: 'Path checks passed'
    };
  }

  /**
   * Check query parameters security
   */
  private checkQuery(parsed: URL): SecurityCheckResult {
    const params = new URLSearchParams(parsed.search);
    const suspiciousParams = ['debug', 'test', 'admin', 'password', 'token'];

    for (const [key] of params) {
      if (suspiciousParams.includes(key.toLowerCase())) {
        return {
          passed: false,
          riskLevel: SecurityRiskLevel.MEDIUM,
          details: 'Suspicious query parameter detected'
        };
      }
    }

    return {
      passed: true,
      riskLevel: SecurityRiskLevel.NONE,
      details: 'Query checks passed'
    };
  }

  /**
   * Check SSL security
   */
  private async checkSsl(parsed: URL): Promise<SecurityCheckResult> {
    if (parsed.protocol !== 'https:') {
      return {
        passed: false,
        riskLevel: SecurityRiskLevel.MEDIUM,
        details: 'SSL not in use'
      };
    }

    try {
      // Here you would implement actual SSL certificate validation
      // For now, we just check if HTTPS is used
      return {
        passed: true,
        riskLevel: SecurityRiskLevel.NONE,
        details: 'SSL checks passed'
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          passed: false,
          riskLevel: SecurityRiskLevel.HIGH,
          details: `SSL check failed: ${error.message}`
        };
      }
      throw error;
    }
  }

  /**
   * Check DNS security
   */
  private async checkDns(parsed: URL): Promise<SecurityCheckResult> {
    try {
      await this.resolveDns(parsed.hostname);
      return {
        passed: true,
        riskLevel: SecurityRiskLevel.NONE,
        details: 'DNS checks passed'
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          passed: false,
          riskLevel: SecurityRiskLevel.HIGH,
          details: `DNS check failed: ${error.message}`
        };
      }
      throw error;
    }
  }

  /**
   * Check domain blacklist
   */
  private async checkBlacklist(parsed: URL): Promise<SecurityCheckResult> {
    try {
      // Here you would implement actual blacklist checking
      // For now, we just return a pass
      return {
        passed: true,
        riskLevel: SecurityRiskLevel.NONE,
        details: 'Blacklist checks passed'
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          passed: false,
          riskLevel: SecurityRiskLevel.HIGH,
          details: `Blacklist check failed: ${error.message}`
        };
      }
      throw error;
    }
  }

  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(checks: Record<string, SecurityCheckResult>): SecurityRiskLevel {
    let maxRisk = SecurityRiskLevel.NONE;

    for (const check of Object.values(checks)) {
      if (!check.passed && check.riskLevel > maxRisk) {
        maxRisk = check.riskLevel;
      }
    }

    return maxRisk;
  }

  /**
   * Resolve DNS
   */
  private async resolveDns(hostname: string): Promise<void> {
    try {
      // Here you would implement actual DNS resolution
      // For now, we just check if it's not an IP address
      if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        throw new Error('IP address used as hostname');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new SecurityError('DNS resolution failed', { cause: error });
      }
      throw error;
    }
  }
}
