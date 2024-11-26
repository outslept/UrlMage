import { z } from 'zod';

/**
 * Query parameter value type
 */
export type QueryValue = string | number | boolean | null | Array<string | number | boolean>;

/**
 * Query parameter information
 */
export interface QueryParam {
  key: string;
  value: QueryValue;
  isArray: boolean;
  hasMultipleValues: boolean;
  rawValue: string;
}

/**
 * Query string information
 */
export interface QueryInfo {
  /** Original query string */
  original: string;
  /** Normalized query string */
  normalized: string;
  /** Query parameters */
  params: QueryParam[];
  /** Total number of parameters */
  paramCount: number;
  /** Whether query string is empty */
  isEmpty: boolean;
  /** Total length of query string */
  length: number;
}

/**
 * Query parameter options
 */
export interface QueryOptions {
  /** Array format: bracket, index, comma, or none */
  arrayFormat?: 'bracket' | 'index' | 'comma' | 'none';
  /** Whether to encode values */
  encode?: boolean;
  /** Whether to decode values */
  decode?: boolean;
  /** Whether to sort parameters */
  sort?: boolean;
  /** Whether to allow duplicates */
  allowDuplicates?: boolean;
  /** Whether to remove empty values */
  removeEmpty?: boolean;
  /** Custom encoder function */
  encoder?: (value: string) => string;
  /** Custom decoder function */
  decoder?: (value: string) => string;
}

/**
 * Query validation options
 */
export interface QueryValidationOptions {
  /** Maximum total length */
  maxLength?: number;
  /** Maximum number of parameters */
  maxParams?: number;
  /** Maximum key length */
  maxKeyLength?: number;
  /** Maximum value length */
  maxValueLength?: number;
  /** Allowed parameter names pattern */
  allowedParams?: RegExp;
  /** Forbidden parameter names pattern */
  forbiddenParams?: RegExp;
  /** Required parameters */
  requiredParams?: string[];
  /** Allowed value types */
  allowedTypes?: ('string' | 'number' | 'boolean' | 'null' | 'array')[];
  /** Custom validation function */
  customValidator?: (param: QueryParam) => boolean;
}

// Zod schemas for validation
export const QueryValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number(), z.boolean()]))
]);

export const QueryParamSchema = z.object({
  key: z.string(),
  value: QueryValueSchema,
  isArray: z.boolean(),
  hasMultipleValues: z.boolean(),
  rawValue: z.string()
});

export const QueryInfoSchema = z.object({
  original: z.string(),
  normalized: z.string(),
  params: z.array(QueryParamSchema),
  paramCount: z.number(),
  isEmpty: z.boolean(),
  length: z.number()
});
