/**
 * Rate Limiter Service
 * Prevents Hue Bridge API rate limit errors (HTTP 429)
 * by queueing requests with appropriate delays
 */

const CONSTANTS = require('../constants');

class RateLimiter {
    constructor(logger) {
        this.logger = logger;

        // Separate queues for different resource types
        this.queues = {
            light: {
                items: [],
                isProcessing: false,
                delayMs: CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS
            },
            grouped_light: {
                items: [],
                isProcessing: false,
                delayMs: CONSTANTS.RATE_LIMIT.GROUPED_LIGHT_DELAY_MS
            }
        };
    }

    /**
     * Process queue for a specific type
     * @param {string} type - Queue type ('light' or 'grouped_light')
     */
    async processQueue(type) {
        const queue = this.queues[type];

        if (queue.isProcessing || queue.items.length === 0) {
            return;
        }

        queue.isProcessing = true;
        const task = queue.items.shift();

        try {
            await task();
        } catch (error) {
            this.logger.error(`Queue error (${type}): ${error.message}`, 'SYSTEM');
        }

        setTimeout(() => {
            queue.isProcessing = false;
            if (queue.items.length > 0) {
                this.processQueue(type);
            }
        }, queue.delayMs);
    }

    /**
     * Enqueue a request with rate limiting
     * @param {string} type - Request type ('light' or 'grouped_light')
     * @param {Function} taskFn - Async function to execute
     * @returns {Promise} Promise that resolves when task is queued
     */
    enqueue(type, taskFn) {
        // Default to 'light' queue if type is unknown
        const queueType = this.queues[type] ? type : 'light';

        this.queues[queueType].items.push(taskFn);
        this.processQueue(queueType);

        return Promise.resolve();
    }

    /**
     * Get queue statistics
     * @returns {Object} Queue statistics
     */
    getStats() {
        return {
            light: {
                pending: this.queues.light.items.length,
                processing: this.queues.light.isProcessing,
                delayMs: this.queues.light.delayMs
            },
            grouped_light: {
                pending: this.queues.grouped_light.items.length,
                processing: this.queues.grouped_light.isProcessing,
                delayMs: this.queues.grouped_light.delayMs
            }
        };
    }

    /**
     * Clear all queues (for testing or reset)
     */
    clearAll() {
        Object.keys(this.queues).forEach(type => {
            this.queues[type].items = [];
            this.queues[type].isProcessing = false;
        });
        this.logger.info('All queues cleared', 'SYSTEM');
    }
}

module.exports = RateLimiter;
