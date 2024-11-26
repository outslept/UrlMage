import { BaseError } from '../base-error';
import { ErrorFactory } from './error-factory';
import { ErrorFormatter } from './error-formatter';

type ErrorHandler = (error: unknown) => void;
type ErrorFilter = (error: BaseError) => boolean;

/**
 * Global error handler configuration and management
 */
export class ErrorHandlerManager {
  private static handlers: ErrorHandler[] = [];
  private static filters: ErrorFilter[] = [];
  private static formatter: ErrorFormatter = new ErrorFormatter();

  /**
   * Add a new error handler
   */
  public static addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Add a new error filter
   */
  public static addFilter(filter: ErrorFilter): void {
    this.filters.push(filter);
  }

  /**
   * Set custom error formatter
   */
  public static setFormatter(formatter: ErrorFormatter): void {
    this.formatter = formatter;
  }

  /**
   * Handle an error through the error handling chain
   */
  public static handle(error: unknown): void {
    const baseError = ErrorFactory.fromError(error);

    // Apply filters
    if (this.filters.some(filter => !filter(baseError))) {
      return;
    }

    // Format error
    const formattedError = this.formatter.format(baseError);

    // Pass to handlers
    this.handlers.forEach(handler => {
      try {
        handler(formattedError);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  /**
   * Create an async error boundary
   */
  public static async boundary<T>(
    fn: () => Promise<T>,
    customHandler?: ErrorHandler
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const baseError = ErrorFactory.fromError(error);
      
      if (customHandler) {
        customHandler(baseError);
      } else {
        this.handle(baseError);
      }

      throw baseError;
    }
  }

  /**
   * Create a sync error boundary
   */
  public static guard<T>(
    fn: () => T,
    customHandler?: ErrorHandler
  ): T {
    try {
      return fn();
    } catch (error) {
      const baseError = ErrorFactory.fromError(error);
      
      if (customHandler) {
        customHandler(baseError);
      } else {
        this.handle(baseError);
      }

      throw baseError;
    }
  }

  /**
   * Clear all handlers and filters
   */
  public static clear(): void {
    this.handlers = [];
    this.filters = [];
    this.formatter = new ErrorFormatter();
  }
}
