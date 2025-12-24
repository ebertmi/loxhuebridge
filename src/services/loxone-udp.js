/**
 * Loxone UDP Service
 * Sends sensor and status updates to Loxone Miniserver via UDP
 */

const dgram = require('dgram');

class LoxoneUDP {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.client = dgram.createSocket('udp4');

        // Statistics
        this.stats = {
            successCount: 0,
            errorCount: 0,
            lastError: null
        };

        this.client.on('error', (error) => {
            this.logger.error(`UDP client error: ${error.message}`, 'SYSTEM');
        });
    }

    /**
     * Send message to Loxone Miniserver
     * @param {string} baseName - Base device name
     * @param {string} suffix - Value suffix (e.g., 'on', 'bri', 'temp')
     * @param {string|number} value - Value to send
     * @param {string} category - Log category
     * @returns {Promise<void>}
     */
    send(baseName, suffix, value, category = 'SYSTEM') {
        return new Promise((resolve, reject) => {
            const loxoneIp = this.config.get('loxoneIp');

            if (!loxoneIp) {
                this.logger.debug('Loxone IP not configured, skipping UDP send', category);
                resolve();
                return;
            }

            const message = `hue.${baseName}.${suffix} ${value}`;
            const buffer = Buffer.from(message);
            const port = this.config.get('loxonePort');

            this.client.send(buffer, port, loxoneIp, (error) => {
                if (error) {
                    this.stats.errorCount++;
                    this.stats.lastError = error;

                    this.logger.error(`UDP send error: ${error.message}`, category);

                    // Alert if error rate is high
                    const totalRequests = this.stats.successCount + this.stats.errorCount;
                    const errorRate = this.stats.errorCount / totalRequests;

                    if (errorRate > 0.1 && totalRequests > 10) { // >10% errors
                        this.logger.warn(
                            `High UDP error rate: ${(errorRate * 100).toFixed(1)}% ` +
                            `(${this.stats.errorCount}/${totalRequests})`,
                            'SYSTEM'
                        );
                    }

                    reject(error);
                } else {
                    this.stats.successCount++;

                    // Log in debug mode or if recovering from errors
                    if (this.config.get('debug') || this.stats.errorCount > 0) {
                        this.logger.debug(`UDP sent: ${message}`, category);
                    }

                    // Reset error count gradually on successful sends
                    if (this.stats.successCount % 100 === 0) {
                        this.stats.errorCount = Math.max(0, this.stats.errorCount - 10);
                    }

                    resolve();
                }
            });
        });
    }

    /**
     * Get UDP statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            successCount: this.stats.successCount,
            errorCount: this.stats.errorCount,
            lastError: this.stats.lastError ? this.stats.lastError.message : null,
            errorRate: this.stats.successCount + this.stats.errorCount > 0
                ? this.stats.errorCount / (this.stats.successCount + this.stats.errorCount)
                : 0
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats.successCount = 0;
        this.stats.errorCount = 0;
        this.stats.lastError = null;
        this.logger.info('UDP statistics reset', 'SYSTEM');
    }

    /**
     * Close UDP client
     */
    close() {
        this.client.close();
        this.logger.info('UDP client closed', 'SYSTEM');
    }
}

module.exports = LoxoneUDP;
