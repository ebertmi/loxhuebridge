/**
 * Logger Utility
 * Provides structured logging with Winston backend and buffer management
 */

const winston = require('winston');
const path = require('path');
const CONSTANTS = require('../constants');

/**
 * Circular buffer implementation for efficient log storage
 * Used for the /api/logs endpoint
 */
class CircularBuffer {
    constructor(size) {
        this.buffer = new Array(size);
        this.size = size;
        this.head = 0;
        this.count = 0;
    }

    push(item) {
        this.buffer[this.head] = item;
        this.head = (this.head + 1) % this.size;
        if (this.count < this.size) this.count++;
    }

    toArray() {
        const result = [];
        const start = this.count < this.size ? 0 : this.head;

        for (let i = 0; i < this.count; i++) {
            result.push(this.buffer[(start + i) % this.size]);
        }

        return result.reverse();
    }

    get length() {
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
    const now = new Date(timestamp);
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
    constructor(options = {}) {
        this.debugEnabled = options.debug || false;
        this.logBuffer = new CircularBuffer(options.maxLogs || CONSTANTS.LOG.MAX_BUFFER_SIZE);

        // Determine log level
        const level = this.debugEnabled ? 'debug' : 'info';

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
                // Console output with standard colors
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.colorize(),
                        consoleFormat
                    )
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
     * @returns {string} Formatted timestamp
     */
    getTime() {
        const now = new Date();
        return now.toLocaleTimeString('de-DE', { hour12: false }) +
               '.' + String(now.getMilliseconds()).padStart(3, '0');
    }

    /**
     * Add log entry to buffer
     * @param {string} level - Log level
     * @param {string} msg - Log message
     * @param {string} category - Log category
     */
    addToLogBuffer(level, msg, category = 'SYSTEM') {
        this.logBuffer.push({
            time: this.getTime(),
            level: level,
            msg: msg,
            cat: category
        });
    }

    /**
     * Info level logging
     * @param {string} msg - Message
     * @param {string} category - Category
     * @param {Object} meta - Additional metadata
     */
    info(msg, category = 'SYSTEM', meta = {}) {
        this.winston.info(msg, { category, ...meta });
        this.addToLogBuffer('INFO', msg, category);
    }

    /**
     * Success level logging (maps to info with custom level)
     * @param {string} msg - Message
     * @param {string} category - Category
     * @param {Object} meta - Additional metadata
     */
    success(msg, category = 'SYSTEM', meta = {}) {
        // Winston doesn't have 'success', so we use info with a custom level indicator
        this.winston.log('success', msg, { category, ...meta });
        this.addToLogBuffer('SUCCESS', msg, category);
    }

    /**
     * Warning level logging
     * @param {string} msg - Message
     * @param {string} category - Category
     * @param {Object} meta - Additional metadata
     */
    warn(msg, category = 'SYSTEM', meta = {}) {
        this.winston.warn(msg, { category, ...meta });
        this.addToLogBuffer('WARN', msg, category);
    }

    /**
     * Error level logging
     * @param {string} msg - Message
     * @param {string} category - Category
     * @param {Object} meta - Additional metadata
     */
    error(msg, category = 'SYSTEM', meta = {}) {
        this.winston.error(msg, { category, ...meta });
        this.addToLogBuffer('ERROR', msg, category);
    }

    /**
     * Debug level logging (only when debug mode is enabled)
     * @param {string} msg - Message
     * @param {string} category - Category
     * @param {Object} meta - Additional metadata
     */
    debug(msg, category = 'SYSTEM', meta = {}) {
        if (this.debugEnabled) {
            this.winston.debug(msg, { category, ...meta });
            this.addToLogBuffer('DEBUG', msg, category);
        }
    }

    /**
     * Special handler for Hue API errors
     * @param {Error} error - Error object
     * @param {string} category - Category
     */
    hueError(error, category = 'SYSTEM') {
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
     * @returns {Array} Array of log entries
     */
    getLogs() {
        return this.logBuffer.toArray();
    }

    /**
     * Set debug mode
     * @param {boolean} enabled - Enable debug mode
     */
    setDebugMode(enabled) {
        this.debugEnabled = enabled;
        this.winston.level = enabled ? 'debug' : 'info';
        this.info(`Debug mode ${enabled ? 'enabled' : 'disabled'}`, 'SYSTEM');
    }
}

module.exports = Logger;
