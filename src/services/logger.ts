/**
 * Centralized logging service
 * Provides structured logging with different severity levels
 * Can be integrated with error tracking services (Sentry, LogRocket, etc.)
 */

import { config } from '@/config/env';

/**
 * Log severity levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log entry structure
 */
interface LogEntry {
  /** Timestamp of the log entry */
  timestamp: string;
  /** Severity level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Additional context data */
  context?: Record<string, unknown>;
  /** Error object if applicable */
  error?: Error;
}

/**
 * Logger class for centralized logging
 */
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = config.isDevelopment;
  }

  /**
   * Format log entry for console output
   */
  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  /**
   * Send log to external service (placeholder for Sentry, LogRocket, etc.)
   */
  private sendToExternalService(entry: LogEntry): void {
    // In production, send to error tracking service
    // Example: Sentry.captureException(entry.error, { extra: entry.context });

    // For now, only log errors to external services in production
    if (!this.isDevelopment && entry.level === LogLevel.ERROR) {
      // TODO: Implement Sentry or LogRocket integration
      // Sentry.captureException(entry.error || new Error(entry.message), {
      //   level: entry.level,
      //   extra: entry.context,
      // });
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    // Console output
    const formattedMessage = this.formatLogEntry(entry);

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage, context || '');
        }
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, context || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, context || '', error || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, context || '', error || '');
        break;
    }

    // Send to external service
    this.sendToExternalService(entry);
  }

  /**
   * Log debug message (development only)
   *
   * @param message - Debug message
   * @param context - Additional context data
   *
   * @example
   * ```typescript
   * logger.debug('Quiz started', { quizId: '123', questionCount: 40 });
   * ```
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log informational message
   *
   * @param message - Info message
   * @param context - Additional context data
   *
   * @example
   * ```typescript
   * logger.info('Questions loaded successfully', { count: 120 });
   * ```
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   *
   * @param message - Warning message
   * @param context - Additional context data
   * @param error - Optional error object
   *
   * @example
   * ```typescript
   * logger.warn('Storage quota exceeded', { remainingSpace: '10MB' });
   * ```
   */
  warn(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Log error message
   *
   * @param message - Error message
   * @param context - Additional context data
   * @param error - Error object
   *
   * @example
   * ```typescript
   * logger.error('Failed to load questions', { file: 'questions.json' }, error);
   * ```
   */
  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();
