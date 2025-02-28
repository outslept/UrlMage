import type { QueryParam, QueryValidationOptions } from './types'
import { ErrorCode, ValidationError } from '../../errors'

export class QueryValidator {
  /**
   * Default validation options
   * @private
   * @readonly
   */
  private readonly defaultOptions: Required<QueryValidationOptions> = {
    maxLength: 2048,
    maxParams: 100,
    maxKeyLength: 100,
    maxValueLength: 1000,
    allowedParams: /^[\w-]+$/,
    forbiddenParams: /^$/,
    requiredParams: [],
    allowedTypes: ['string', 'number', 'boolean', 'null', 'array'],
    customValidator: () => true,
  }

  /**
   * Validates a single query parameter
   * @param {QueryParam} param - The parameter to validate
   * @param {QueryValidationOptions} [options] - Validation options
   * @returns {boolean} True if validation passes
   * @throws {ValidationError} If validation fails
   */
  public validateParam(
    param: QueryParam,
    options?: QueryValidationOptions,
  ): boolean {
    const opts = { ...this.defaultOptions, ...options }

    try {
      // Validate key
      this.validateKey(param.key, opts)

      // Validate value
      this.validateValue(param.value, opts)

      // Run custom validator
      if (!opts.customValidator(param)) {
        throw new ValidationError(
          `Custom validation failed for parameter: ${param.key}`,
          ErrorCode.INVALID_QUERY,
        )
      }

      return true
    }
    catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }

      const errorMessage
        = error instanceof Error
          ? `Query parameter validation failed: ${error.message}`
          : 'Query parameter validation failed: Unknown error'

      throw new ValidationError(errorMessage, ErrorCode.INVALID_QUERY)
    }
  }

  /**
   * Validates a complete query string
   * @param {string} query - The query string to validate
   * @param {QueryValidationOptions} [options] - Validation options
   * @returns {boolean} True if validation passes
   * @throws {ValidationError} If validation fails
   */
  public validateQueryString(
    query: string,
    options?: QueryValidationOptions,
  ): boolean {
    const opts = { ...this.defaultOptions, ...options }

    try {
      // Check total length
      if (query.length > opts.maxLength) {
        throw new ValidationError(
          `Query string length exceeds maximum: ${query.length} > ${opts.maxLength}`,
          ErrorCode.INVALID_QUERY,
        )
      }

      // Parse and validate parameters
      const params = new URLSearchParams(query)
      const paramCount = Array.from(params.keys()).length

      // Check parameter count
      if (paramCount > opts.maxParams) {
        throw new ValidationError(
          `Number of parameters exceeds maximum: ${paramCount} > ${opts.maxParams}`,
          ErrorCode.INVALID_QUERY,
        )
      }

      // Check required parameters
      for (const required of opts.requiredParams) {
        if (!params.has(required)) {
          throw new ValidationError(
            `Missing required parameter: ${required}`,
            ErrorCode.INVALID_QUERY,
          )
        }
      }

      return true
    }
    catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }

      const errorMessage
        = error instanceof Error
          ? `Query string validation failed: ${error.message}`
          : 'Query string validation failed: Unknown error'

      throw new ValidationError(errorMessage, ErrorCode.INVALID_QUERY)
    }
  }

  /**
   * Validates a parameter key
   * @param {string} key - The key to validate
   * @param {Required<QueryValidationOptions>} options - Validation options
   * @throws {ValidationError} If validation fails
   * @private
   */
  private validateKey(
    key: string,
    options: Required<QueryValidationOptions>,
  ): void {
    // Check key length
    if (key.length > options.maxKeyLength) {
      throw new ValidationError(
        `Parameter key length exceeds maximum: ${key.length} > ${options.maxKeyLength} for key "${key}"`,
        ErrorCode.INVALID_QUERY,
      )
    }

    // Check allowed pattern
    if (!options.allowedParams.test(key)) {
      throw new ValidationError(
        `Invalid parameter key format: "${key}" does not match pattern ${options.allowedParams}`,
        ErrorCode.INVALID_QUERY,
      )
    }

    // Check forbidden pattern
    if (options.forbiddenParams.test(key)) {
      throw new ValidationError(
        `Forbidden parameter key: "${key}" matches forbidden pattern ${options.forbiddenParams}`,
        ErrorCode.INVALID_QUERY,
      )
    }
  }

  /**
   * Validates a parameter value
   * @param {any} value - The value to validate
   * @param {Required<QueryValidationOptions>} options - Validation options
   * @throws {ValidationError} If validation fails
   * @private
   */
  private validateValue(
    value: any,
    options: Required<QueryValidationOptions>,
  ): void {
    // Check value type
    // Fixed nested ternary by breaking it down
    let valueType
    if (Array.isArray(value)) {
      valueType = 'array'
    }
    else if (value === null) {
      valueType = 'null'
    }
    else {
      valueType = typeof value
    }

    if (!options.allowedTypes.includes(valueType as any)) {
      throw new ValidationError(
        `Invalid value type: ${valueType}. Allowed types: ${options.allowedTypes.join(', ')}`,
        ErrorCode.INVALID_QUERY,
      )
    }

    // Check value length for strings
    if (typeof value === 'string' && value.length > options.maxValueLength) {
      throw new ValidationError(
        `Parameter value length exceeds maximum: ${value.length} > ${options.maxValueLength}`,
        ErrorCode.INVALID_QUERY,
      )
    }

    // Check array values
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemType = typeof item
        if (!options.allowedTypes.includes(itemType as any)) {
          throw new ValidationError(
            `Invalid array item type at index ${index}: ${itemType}. Allowed types: ${options.allowedTypes.join(', ')}`,
            ErrorCode.INVALID_QUERY,
          )
        }
        if (typeof item === 'string' && item.length > options.maxValueLength) {
          throw new ValidationError(
            `Array item length at index ${index} exceeds maximum: ${item.length} > ${options.maxValueLength}`,
            ErrorCode.INVALID_QUERY,
          )
        }
      })
    }
  }
}
