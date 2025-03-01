import { ErrorCode, ValidationError } from '../../../errors'
import { ProtocolRegistry } from '../core/protocol-registry'

export class PortValidator {
  public validate(protocol: string, port: number): void {
    if (port === undefined || port === null) {
      throw new ValidationError('Port is required', ErrorCode.INVALID_PORT)
    }

    if (!Number.isInteger(port)) {
      throw new ValidationError(
        'Port must be an integer',
        ErrorCode.INVALID_PORT,
      )
    }

    if (port < 1 || port > 65535) {
      throw new ValidationError(
        'Port must be between 1 and 65535',
        ErrorCode.INVALID_PORT,
      )
    }

    const normalizedProtocol = ProtocolRegistry.normalizeProtocol(protocol)

    if (!ProtocolRegistry.isPortAllowed(normalizedProtocol, port)) {
      const allowedPorts = this.getAllowedPorts(normalizedProtocol)

      if (allowedPorts.length > 0) {
        throw new ValidationError(
          `Invalid port ${port} for protocol ${protocol}. Allowed ports are: ${allowedPorts.join(', ')}`,
          ErrorCode.INVALID_PORT,
        )
      }
    }
  }

  public getAllowedPorts(protocol: string): number[] {
    try {
      const protocolInfo = ProtocolRegistry.getProtocol(protocol)
      return protocolInfo.allowedPorts || []
    }
    catch (error) {
      return []
    }
  }

  public isValidPortRange(port: number): boolean {
    return Number.isInteger(port) && port >= 1 && port <= 65535
  }

  public isWellKnownPort(port: number): boolean {
    return this.isValidPortRange(port) && port >= 0 && port <= 1023
  }

  public isRegisteredPort(port: number): boolean {
    return this.isValidPortRange(port) && port >= 1024 && port <= 49151
  }

  public isDynamicPort(port: number): boolean {
    return this.isValidPortRange(port) && port >= 49152 && port <= 65535
  }
}
