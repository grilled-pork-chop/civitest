/**
 * Centralized logging service
 * Console-based structured logging with severity levels.
 * The app is fully offline — no logs are sent to any external service.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    // __DEV__ is injected by the React Native/Expo runtime.
    this.isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message } = entry;
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

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
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();
