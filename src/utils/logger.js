/**
 * Logger Utility
 * Provides structured logging with level support and buffer management
 */

const CONSTANTS = require('../constants');

/**
 * Circular buffer implementation for efficient log storage
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
 * Logger class with buffer management and console output
 */
class Logger {
    constructor(options = {}) {
        this.debugEnabled = options.debug || false;
        this.logBuffer = new CircularBuffer(options.maxLogs || CONSTANTS.LOG.MAX_BUFFER_SIZE);
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
     */
    info(msg, category = 'SYSTEM') {
        console.log(`ℹ️  [${this.getTime()}] [${category}] ${msg}`);
        this.addToLogBuffer('INFO', msg, category);
    }

    /**
     * Success level logging
     * @param {string} msg - Message
     * @param {string} category - Category
     */
    success(msg, category = 'SYSTEM') {
        console.log(`✅  [${this.getTime()}] [${category}] ${msg}`);
        this.addToLogBuffer('SUCCESS', msg, category);
    }

    /**
     * Warning level logging
     * @param {string} msg - Message
     * @param {string} category - Category
     */
    warn(msg, category = 'SYSTEM') {
        console.log(`⚠️  [${this.getTime()}] [${category}] ${msg}`);
        this.addToLogBuffer('WARN', msg, category);
    }

    /**
     * Error level logging
     * @param {string} msg - Message
     * @param {string} category - Category
     */
    error(msg, category = 'SYSTEM') {
        console.error(`❌ [${this.getTime()}] [${category}] ${msg}`);
        this.addToLogBuffer('ERROR', msg, category);
    }

    /**
     * Debug level logging (only when debug mode is enabled)
     * @param {string} msg - Message
     * @param {string} category - Category
     */
    debug(msg, category = 'SYSTEM') {
        if (this.debugEnabled) {
            console.log(`🐛 [${this.getTime()}] [${category}] ${msg}`);
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
            console.warn(`⚠️ [${this.getTime()}] RATE LIMIT (429) - Slowing down...`);
            this.addToLogBuffer('WARN', 'HUE RATE LIMIT (429)', category);
            return;
        }

        const details = error.response
            ? JSON.stringify(error.response.data)
            : error.message;

        console.error(`❌ [${this.getTime()}] HUE ERR ${status}: ${details}`);
        this.addToLogBuffer('ERROR', `HUE ERR ${status}: ${details}`, category);
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
        this.info(`Debug mode ${enabled ? 'enabled' : 'disabled'}`, 'SYSTEM');
    }
}

module.exports = Logger;
