import type { BaseError } from '../base-error'
import { ErrorFactory } from './error-factory'
import { ErrorFormatter } from './error-formatter'

type ErrorHandler = (error: unknown) => void
type ErrorFilter = (error: BaseError) => boolean

export class ErrorHandlerManager {
  /** Collection of registered error handlers */
  private static handlers: ErrorHandler[] = []

  /** Collection of registered error filters */
  private static filters: ErrorFilter[] = []

  /** The formatter used to structure errors */
  private static formatter: ErrorFormatter = new ErrorFormatter()

  /**
   * Registers a new error handler function
   * @param {ErrorHandler} handler - Function to handle errors
   */
  public static addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler)
  }

  /**
   * Registers a new error filter function
   * @param {ErrorFilter} filter - Function to filter errors
   */
  public static addFilter(filter: ErrorFilter): void {
    this.filters.push(filter)
  }

  /**
   * Sets a custom error formatter
   * @param {ErrorFormatter} formatter - The formatter to use
   */
  public static setFormatter(formatter: ErrorFormatter): void {
    this.formatter = formatter
  }

  /**
   * Processes an error through the error handling chain
   * @param {unknown} error - The error to handle
   */
  public static handle(error: unknown): void {
    const baseError = ErrorFactory.fromError(error)

    // Apply filters
    if (this.filters.some(filter => !filter(baseError))) {
      return
    }

    // Format error
    const formattedError = this.formatter.format(baseError)

    // Pass to handlers
    this.handlers.forEach((handler) => {
      try {
        handler(formattedError)
      }
      catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    })
  }

  /**
   * Creates an asynchronous error boundary that handles errors
   * @param {() => Promise<T>} fn - The async function to execute
   * @param {ErrorHandler} [customHandler] - Optional custom handler for this specific boundary
   * @returns {Promise<T>} The result of the function execution
   * @template T
   */
  public static async boundary<T>(
    fn: () => Promise<T>,
    customHandler?: ErrorHandler,
  ): Promise<T> {
    try {
      return await fn()
    }
    catch (error) {
      const baseError = ErrorFactory.fromError(error)

      if (customHandler) {
        customHandler(baseError)
      }
      else {
        this.handle(baseError)
      }

      throw baseError
    }
  }

  /**
   * Creates a synchronous error boundary that handles errors
   * @param {() => T} fn - The function to execute
   * @param {ErrorHandler} [customHandler] - Optional custom handler for this specific boundary
   * @returns {T} The result of the function execution
   * @template T
   */
  public static guard<T>(fn: () => T, customHandler?: ErrorHandler): T {
    try {
      return fn()
    }
    catch (error) {
      const baseError = ErrorFactory.fromError(error)

      if (customHandler) {
        customHandler(baseError)
      }
      else {
        this.handle(baseError)
      }

      throw baseError
    }
  }

  /**
   * Resets all handlers, filters, and formatter to default state
   */
  public static clear(): void {
    this.handlers = []
    this.filters = []
    this.formatter = new ErrorFormatter()
  }
}
