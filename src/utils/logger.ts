/**
 * Logger Utility
 * Provides structured logging with Winston backend and buffer management
 */

import winston from 'winston';
import path from 'path';
import CONSTANTS from '../constants';

/**
 * Log buffer entry structure
 */
interface LogBufferEntry {
  time: string;
  level: string;
  msg: string;
  cat: string;
}

/**
 * Logger constructor options
 */
interface LoggerOptions {
  debug?: boolean;
  maxLogs?: number;
}

/**
 * Circular buffer implementation for efficient log storage
 * Used for the /api/logs endpoint
 */
class CircularBuffer {
  private buffer: (LogBufferEntry | undefined)[];
  private size: number;
  private head: number;
  private count: number;

  constructor(size: number) {
    this.buffer = new Array(size);
    this.size = size;
    this.head = 0;
    this.count = 0;
  }

  push(item: LogBufferEntry): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.size;
    if (this.count < this.size) this.count++;
  }

  toArray(): LogBufferEntry[] {
    const result: LogBufferEntry[] = [];
    const start = this.count < this.size ? 0 : this.head;

    for (let i = 0; i < this.count; i++) {
      const entry = this.buffer[(start + i) % this.size];
      if (entry) {
        result.push(entry);
      }
    }

    return result.reverse();
  }

  get length(): number {
    return this.count;
  }
}

/**
 * Define custom log levels including 'success'
 */
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    success: 2,
    info: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    success: 'green',
    info: 'cyan',
    debug: 'gray'
  }
};

// Add custom colors to Winston
winston.addColors(customLevels.colors);

/**
 * Custom console format with standard colors
 */
const consoleFormat = winston.format.printf(({ timestamp, level, message, category, ...meta }) => {
  const now = new Date(timestamp as string);
  const time = now.toLocaleTimeString('de-DE', { hour12: false }) +
               '.' + String(now.getMilliseconds()).padStart(3, '0');

  const cat = category || 'SYSTEM';
  const levelUpper = level.toUpperCase().padEnd(7);

  // Build message with metadata if present
  let fullMessage = message;
  const metaKeys = Object.keys(meta).filter(k => k !== 'level' && k !== 'timestamp');
  if (metaKeys.length > 0) {
    const metaStr = JSON.stringify(meta);
    if (metaStr !== '{}') {
      fullMessage += ` ${metaStr}`;
    }
  }

  return `[${time}] ${levelUpper} [${cat}] ${fullMessage}`;
});

/**
 * Logger class with Winston backend and buffer management
 */
class Logger {
  private winston: winston.Logger;
  private logBuffer: CircularBuffer;
  private debugEnabled: boolean;

  constructor(options: LoggerOptions = {}) {
    this.debugEnabled = options.debug || false;
    this.logBuffer = new CircularBuffer(options.maxLogs || CONSTANTS.LOG.MAX_BUFFER_SIZE);

    // Determine log level
    const level = this.debugEnabled ? 'debug' : 'info';

    // Detect if colors should be enabled
    // Only enable colors if explicitly requested via FORCE_COLOR
    // This prevents ANSI codes from appearing as whitespace in terminals that don't render them
    const shouldUseColors = process.env.FORCE_COLOR === '1' || process.env.FORCE_COLOR === 'true';

    // Build console format with optional colorization
    const consoleFormatChain = shouldUseColors
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          consoleFormat
        )
      : winston.format.combine(
          winston.format.timestamp(),
          consoleFormat
        );

    // Create Winston logger with custom levels
    this.winston = winston.createLogger({
      levels: customLevels.levels,
      level: level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // Console output with conditional colors
        new winston.transports.Console({
          format: consoleFormatChain
        }),
        // Error log file (JSON format)
        new winston.transports.File({
          filename: path.join('logs', 'error.log'),
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        // Combined log file (JSON format)
        new winston.transports.File({
          filename: path.join('logs', 'combined.log'),
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });
  }

  /**
   * Get current timestamp with milliseconds
   */
  private getTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('de-DE', { hour12: false }) +
           '.' + String(now.getMilliseconds()).padStart(3, '0');
  }

  /**
   * Add log entry to buffer
   */
  private addToLogBuffer(level: string, msg: string, category: string = 'SYSTEM'): void {
    this.logBuffer.push({
      time: this.getTime(),
      level: level,
      msg: msg,
      cat: category
    });
  }

  /**
   * Info level logging
   */
  info(msg: string, category: string = 'SYSTEM', meta: Record<string, unknown> = {}): void {
    this.winston.info(msg, { category, ...meta });
    this.addToLogBuffer('INFO', msg, category);
  }

  /**
   * Success level logging (maps to info with custom level)
   */
  success(msg: string, category: string = 'SYSTEM', meta: Record<string, unknown> = {}): void {
    this.winston.log('success', msg, { category, ...meta });
    this.addToLogBuffer('SUCCESS', msg, category);
  }

  /**
   * Warning level logging
   */
  warn(msg: string, category: string = 'SYSTEM', meta: Record<string, unknown> = {}): void {
    this.winston.warn(msg, { category, ...meta });
    this.addToLogBuffer('WARN', msg, category);
  }

  /**
   * Error level logging
   */
  error(msg: string, category: string = 'SYSTEM', meta: Record<string, unknown> = {}): void {
    this.winston.error(msg, { category, ...meta });
    this.addToLogBuffer('ERROR', msg, category);
  }

  /**
   * Debug level logging (only when debug mode is enabled)
   */
  debug(msg: string, category: string = 'SYSTEM', meta: Record<string, unknown> = {}): void {
    if (this.debugEnabled) {
      this.winston.debug(msg, { category, ...meta });
      this.addToLogBuffer('DEBUG', msg, category);
    }
  }

  /**
   * Special handler for Hue API errors
   */
  hueError(error: any, category: string = 'SYSTEM'): void {
    const status = error.response ? error.response.status : 'Net';

    if (status === 429) {
      this.warn('HUE RATE LIMIT (429) - Slowing down...', category, {
        statusCode: 429,
        error: 'Rate Limited'
      });
      return;
    }

    const details = error.response
      ? JSON.stringify(error.response.data)
      : error.message;

    this.error(`HUE ERR ${status}: ${details}`, category, {
      statusCode: status,
      errorDetails: error.response?.data,
      stack: error.stack
    });
  }

  /**
   * Get all logs from buffer
   */
  getLogs(): LogBufferEntry[] {
    return this.logBuffer.toArray();
  }

  /**
   * Set debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugEnabled = enabled;
    this.winston.level = enabled ? 'debug' : 'info';
    this.info(`Debug mode ${enabled ? 'enabled' : 'disabled'}`, 'SYSTEM');
  }
}

export default Logger;
