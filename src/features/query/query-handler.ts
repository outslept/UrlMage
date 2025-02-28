import type {
  QueryInfo,
  QueryOptions,
  QueryParam,
  QueryValidationOptions,
} from './types'
import { ErrorCode, ValidationError } from '../../errors'
import { EncodingUtils } from '../../utils/encoding'
import { QueryValidator } from './query-validator'

export class QueryHandler {
  /** Validator for query parameters */
  private readonly validator: QueryValidator

  /** Default options for query handling */
  private readonly defaultOptions: Required<QueryOptions> = {
    arrayFormat: 'bracket',
    encode: true,
    decode: true,
    sort: false,
    allowDuplicates: false,
    removeEmpty: false,
    encoder: (value: string) => EncodingUtils.encodeQueryParam(value),
    decoder: (value: string) => decodeURIComponent(value),
  }

  /**
   * Creates an instance of QueryHandler
   */
  constructor() {
    this.validator = new QueryValidator()
  }

  /**
   * Parses a query string into structured information
   * @param {string} query - The query string to parse
   * @param {QueryOptions} [options] - Parsing options
   * @returns {QueryInfo} Structured query information
   * @throws {ValidationError} If parsing fails
   */
  public parse(query: string, options?: QueryOptions): QueryInfo {
    const opts = { ...this.defaultOptions, ...options }

    // Remove leading ? if present
    query = query.replace(/^\?/, '')

    try {
      const params = new URLSearchParams(query)
      const result: QueryParam[] = []
      const seen = new Set<string>()

      // Process parameters
      for (const [key, value] of params.entries()) {
        // Handle duplicates
        if (!opts.allowDuplicates && seen.has(key)) {
          continue
        }
        seen.add(key)

        // Skip empty values if configured
        if (opts.removeEmpty && !value) {
          continue
        }

        // Parse and process value
        const processed = this.processValue(value, opts)

        result.push({
          key,
          value: processed.value,
          isArray: Array.isArray(processed.value),
          hasMultipleValues: processed.hasMultiple,
          rawValue: value,
        })
      }

      // Sort if needed
      if (opts.sort) {
        result.sort((a, b) => a.key.localeCompare(b.key))
      }

      return {
        original: query,
        normalized: this.stringify(result, opts),
        params: result,
        paramCount: result.length,
        isEmpty: result.length === 0,
        length: query.length,
      }
    }
    catch (error) {
      const errorMessage
        = error instanceof Error
          ? `Failed to parse query string: ${error.message}`
          : 'Failed to parse query string: Unknown error'

      throw new ValidationError(errorMessage, ErrorCode.INVALID_QUERY)
    }
  }

  /**
   * Converts query parameters to a query string
   * @param {QueryParam[]} params - The parameters to stringify
   * @param {QueryOptions} [options] - Stringification options
   * @returns {string} The query string
   */
  public stringify(params: QueryParam[], options?: QueryOptions): string {
    const opts = { ...this.defaultOptions, ...options }
    const result = new URLSearchParams()

    for (const param of params) {
      const value = this.stringifyValue(param.value, opts)

      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (!opts.removeEmpty || v) {
            result.append(param.key, v)
          }
        })
      }
      else if (!opts.removeEmpty || value) {
        result.append(param.key, value)
      }
    }

    return result.toString()
  }

  /**
   * Adds a parameter to the query
   * @param {QueryParam[]} params - Existing parameters
   * @param {string} key - Parameter key to add
   * @param {any} value - Parameter value to add
   * @param {QueryOptions} [options] - Options for parameter handling
   * @returns {QueryParam[]} Updated parameters array
   */
  public addParam(
    params: QueryParam[],
    key: string,
    value: any,
    options?: QueryOptions,
  ): QueryParam[] {
    const opts = { ...this.defaultOptions, ...options }

    // Process value
    const processed = this.processValue(value, opts)

    const newParam: QueryParam = {
      key,
      value: processed.value,
      isArray: Array.isArray(processed.value),
      hasMultipleValues: processed.hasMultiple,
      rawValue: String(value),
    }

    // Handle duplicates
    const result = opts.allowDuplicates
      ? [...params]
      : params.filter(p => p.key !== key)

    result.push(newParam)

    // Sort if needed
    if (opts.sort) {
      result.sort((a, b) => a.key.localeCompare(b.key))
    }

    return result
  }

  /**
   * Removes a parameter from the query
   * @param {QueryParam[]} params - Existing parameters
   * @param {string} key - Parameter key to remove
   * @returns {QueryParam[]} Updated parameters array
   */
  public removeParam(params: QueryParam[], key: string): QueryParam[] {
    return params.filter(p => p.key !== key)
  }

  /**
   * Processes a query value according to options
   * @param {any} value - The value to process
   * @param {Required<QueryOptions>} options - Processing options
   * @returns {{ value: any; hasMultiple: boolean }} Processed value and metadata
   * @private
   */
  private processValue(
    value: any,
    options: Required<QueryOptions>,
  ): {
      value: any
      hasMultiple: boolean
    } {
    let processed = value
    let hasMultiple = false

    // Decode if needed
    if (options.decode && typeof processed === 'string') {
      processed = options.decoder(processed)
    }

    // Handle arrays based on format
    if (options.arrayFormat === 'comma' && typeof processed === 'string') {
      const parts = processed.split(',').filter(Boolean)
      if (parts.length > 1) {
        processed = parts
        hasMultiple = true
      }
    }

    // Convert types
    if (typeof processed === 'string') {
      if (processed.toLowerCase() === 'true')
        processed = true
      else if (processed.toLowerCase() === 'false')
        processed = false
      else if (processed === 'null')
        processed = null
      else if (/^\d+$/.test(processed))
        processed = Number.parseInt(processed, 10)
      else if (/^\d*\.\d+$/.test(processed))
        processed = Number.parseFloat(processed)
    }

    return { value: processed, hasMultiple }
  }

  /**
   * Converts a value to string representation for query parameters
   * @param {any} value - The value to stringify
   * @param {Required<QueryOptions>} options - Stringification options
   * @returns {string | string[]} String representation of the value
   * @private
   */
  private stringifyValue(
    value: any,
    options: Required<QueryOptions>,
  ): string | string[] {
    if (value === null || value === undefined) {
      return ''
    }

    if (Array.isArray(value)) {
      if (options.arrayFormat === 'comma') {
        return [value.join(',')]
      }
      return value.map(String)
    }

    const stringValue = String(value)
    return options.encode ? options.encoder(stringValue) : stringValue
  }

  /**
   * Validate query parameters
   * @param {QueryParam[]} params - The parameters to validate
   * @param {QueryValidationOptions} [options] - Validation options
   * @returns {boolean} True if all parameters pass validation
   */
  public validate(
    params: QueryParam[],
    options?: QueryValidationOptions,
  ): boolean {
    for (const param of params) {
      this.validator.validateParam(param, options)
    }
    return true
  }
}
