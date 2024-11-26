import { z } from 'zod';
import { ValidationError } from '../../errors';
import { ProtocolInfo } from './types';
import { ProtocolHandler } from './protocol-handler';

/**
 * Protocol validation rules
 */
export class ProtocolValidator {
  private handler: ProtocolHandler;

  constructor() {
    this.handler = new ProtocolHandler();
  }

  /**
   * Validate protocol string
   */
  public validate(protocol: string): void {
    // Basic protocol format validation
    if (!protocol) {
      throw new ValidationError('Protocol is required');
    }

    if (!this.handler.isValid(protocol)) {
      throw new ValidationError(`Invalid protocol format: ${protocol}`);
    }

    // Get protocol info
    const info = this.handler.parse(protocol);

    // Validate using schema
    this.validateSchema(info);
  }

  /**
   * Validate protocol info against schema
   */
  private validateSchema(info: ProtocolInfo): void {
    const schema = z.object({
      name: z.string()
        .min(1, 'Protocol name is required')
        .max(20, 'Protocol name is too long')
        .regex(/^[a-z][a-z0-9+.-]*$/, 'Invalid protocol name format'),
      
      secure: z.boolean(),
      
      defaultPort: z.number()
        .int('Port must be an integer')
        .min(1, 'Port must be positive')
        .max(65535, 'Port must be less than 65536')
        .optional(),
      
      allowedPorts: z.array(z.number()
        .int('Port must be an integer')
        .min(1, 'Port must be positive')
        .max(65535, 'Port must be less than 65536'))
        .optional()
        .default([]),
      
      requiresHost: z.boolean(),
      
      supportsAuth: z.boolean(),
      
      category: z.enum(['web', 'mail', 'file', 'media', 'messaging', 'other'])
    });

    try {
      schema.parse(info);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => issue.message).join(', ');
        throw new ValidationError(`Protocol validation failed: ${issues}`);
      }
      throw error;
    }
  }

  /**
   * Validate port number for protocol
   */
  public validatePort(protocol: string, port: number): void {
    const info = this.handler.parse(protocol);

    if (!port) {
      throw new ValidationError('Port is required');
    }

    if (!Number.isInteger(port)) {
      throw new ValidationError('Port must be an integer');
    }

    if (port < 1 || port > 65535) {
      throw new ValidationError('Port must be between 1 and 65535');
    }

    // Check against allowed ports if they are specified
    const allowedPorts = info.allowedPorts || [];
    if (allowedPorts.length > 0 && !allowedPorts.includes(port)) {
      throw new ValidationError(
        `Invalid port ${port} for protocol ${protocol}. ` +
        `Allowed ports are: ${allowedPorts.join(', ')}`
      );
    }
  }

  /**
   * Check if protocol requires secure connection
   */
  public requiresSecure(protocol: string): boolean {
    const info = this.handler.parse(protocol);
    return info.secure;
  }

  /**
   * Check if protocol supports authentication
   */
  public supportsAuth(protocol: string): boolean {
    const info = this.handler.parse(protocol);
    return info.supportsAuth;
  }

  /**
   * Check if protocol requires host
   */
  public requiresHost(protocol: string): boolean {
    const info = this.handler.parse(protocol);
    return info.requiresHost;
  }

  /**
   * Get default port for protocol
   */
  public getDefaultPort(protocol: string): number | undefined {
    const info = this.handler.parse(protocol);
    return info.defaultPort;
  }

  /**
   * Get allowed ports for protocol
   */
  public getAllowedPorts(protocol: string): number[] {
    const info = this.handler.parse(protocol);
    return info.allowedPorts || [];
  }

  /**
   * Get protocol category
   */
  public getCategory(protocol: string): string {
    const info = this.handler.parse(protocol);
    return info.category;
  }
}
