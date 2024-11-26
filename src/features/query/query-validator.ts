import { ValidationError } from '../../errors';
import { QueryParam, QueryValidationOptions } from './types';

/**
 * Query parameter validator
 */
export class QueryValidator {
  private readonly defaultOptions: Required<QueryValidationOptions> = {
    maxLength: 2048,
    maxParams: 100,
    maxKeyLength: 100,
    maxValueLength: 1000,
    allowedParams: /^[a-zA-Z0-9_\-]+$/,
    forbiddenParams: /^$/,
    requiredParams: [],
    allowedTypes: ['string', 'number', 'boolean', 'null', 'array'],
    customValidator: () => true
  };

  /**
   * Validate query parameter
   */
  public validateParam(param: QueryParam, options?: QueryValidationOptions): boolean {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Validate key
      this.validateKey(param.key, opts);

      // Validate value
      this.validateValue(param.value, opts);

      // Run custom validator
      if (!opts.customValidator(param)) {
        throw new ValidationError('Custom validation failed', {
          context: { parameter: param.key }
        });
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Query parameter validation failed', { cause: error });
      }
      throw error;
    }
  }

  /**
   * Validate query string
   */
  public validateQueryString(query: string, options?: QueryValidationOptions): boolean {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Check total length
      if (query.length > opts.maxLength) {
        throw new ValidationError('Query string length exceeds maximum', {
          context: { maxLength: opts.maxLength, actualLength: query.length }
        });
      }

      // Parse and validate parameters
      const params = new URLSearchParams(query);
      const paramCount = Array.from(params.keys()).length;

      // Check parameter count
      if (paramCount > opts.maxParams) {
        throw new ValidationError('Number of parameters exceeds maximum', {
          context: { maxParams: opts.maxParams, actualCount: paramCount }
        });
      }

      // Check required parameters
      for (const required of opts.requiredParams) {
        if (!params.has(required)) {
          throw new ValidationError('Missing required parameter', {
            context: { parameter: required }
          });
        }
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Query string validation failed', { cause: error });
      }
      throw error;
    }
  }

  /**
   * Validate parameter key
   */
  private validateKey(key: string, options: Required<QueryValidationOptions>): void {
    // Check key length
    if (key.length > options.maxKeyLength) {
      throw new ValidationError('Parameter key length exceeds maximum', {
        context: { key, maxLength: options.maxKeyLength, actualLength: key.length }
      });
    }

    // Check allowed pattern
    if (!options.allowedParams.test(key)) {
      throw new ValidationError('Invalid parameter key format', {
        context: { key, pattern: options.allowedParams.toString() }
      });
    }

    // Check forbidden pattern
    if (options.forbiddenParams.test(key)) {
      throw new ValidationError('Forbidden parameter key', {
        context: { key, pattern: options.forbiddenParams.toString() }
      });
    }
  }

  /**
   * Validate parameter value
   */
  private validateValue(value: any, options: Required<QueryValidationOptions>): void {
    // Check value type
    const valueType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    if (!options.allowedTypes.includes(valueType as any)) {
      throw new ValidationError('Invalid value type', {
        context: { type: valueType, allowedTypes: options.allowedTypes }
      });
    }

    // Check value length for strings
    if (typeof value === 'string' && value.length > options.maxValueLength) {
      throw new ValidationError('Parameter value length exceeds maximum', {
        context: { maxLength: options.maxValueLength, actualLength: value.length }
      });
    }

    // Check array values
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemType = typeof item;
        if (!options.allowedTypes.includes(itemType as any)) {
          throw new ValidationError('Invalid array item type', {
            context: { index, type: itemType, allowedTypes: options.allowedTypes }
          });
        }
        if (typeof item === 'string' && item.length > options.maxValueLength) {
          throw new ValidationError('Array item length exceeds maximum', {
            context: { index, maxLength: options.maxValueLength, actualLength: item.length }
          });
        }
      });
    }
  }
}
