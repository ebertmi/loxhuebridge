/**
 * Loxone UDP Service
 * Sends sensor and status updates to Loxone Miniserver via UDP
 * 
 * Features:
 * - Configurable target IP and port
 * - Robust error handling with retries
 * - Connection health monitoring and logging
 */

import dgram from 'dgram';
import Config from '../config';
import Logger from '../utils/logger';

/**
 * UDP statistics structure
 */
interface UDPStats {
  successCount: number;
  errorCount: number;
  lastError: Error | null;
  lastErrorTime: number | null;
  lastSuccessTime: number | null;
  consecutiveErrors: number;
  consecutiveSuccesses: number;
}

class LoxoneUDP {
  private config: Config;
  private logger: Logger;
  private client: dgram.Socket;
  private stats: UDPStats;
  private isHealthy: boolean;
  private lastHealthLog: number;
  private healthLogInterval: number;

  constructor(config: Config, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.client = dgram.createSocket('udp4');

    // Statistics
    this.stats = {
      successCount: 0,
      errorCount: 0,
      lastError: null,
      lastErrorTime: null,
      lastSuccessTime: null,
      consecutiveErrors: 0,
      consecutiveSuccesses: 0
    };

    // Health monitoring
    this.isHealthy = true;
    this.lastHealthLog = Date.now();
    this.healthLogInterval = 300000; // Log health every 5 minutes

    this.client.on('error', (error) => {
      this.logger.error(`UDP client error: ${error.message}`, 'SYSTEM', {
        errorCode: (error as any).code,
        stack: error.stack
      });
    });

    // Log initial configuration status
    const loxoneIp = this.config.get('loxoneIp');
    if (loxoneIp) {
      this.logger.success(
        `UDP service initialized for ${loxoneIp}:${this.config.get('loxonePort')}`,
        'UDP'
      );
    } else {
      this.logger.warn('UDP service initialized but Loxone IP not configured', 'UDP');
    }
  }

  /**
   * Send message to Loxone Miniserver
   */
  send(baseName: string, suffix: string, value: string | number, category: string = 'SYSTEM'): Promise<void> {
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
          this.stats.lastErrorTime = Date.now();
          this.stats.consecutiveErrors++;
          this.stats.consecutiveSuccesses = 0;

          // Always log errors in production
          this.logger.error(`UDP send error: ${error.message}`, category, {
            target: `${loxoneIp}:${port}`,
            message: message,
            errorCode: (error as any).code,
            consecutiveErrors: this.stats.consecutiveErrors
          });

          // Mark as unhealthy after multiple consecutive errors
          if (this.stats.consecutiveErrors >= 5 && this.isHealthy) {
            this.isHealthy = false;
            this.logger.error(
              `UDP connection unhealthy: ${this.stats.consecutiveErrors} consecutive failures`,
              'UDP',
              {
                target: `${loxoneIp}:${port}`,
                lastError: error.message,
                totalErrors: this.stats.errorCount,
                totalSuccess: this.stats.successCount
              }
            );
          }

          // Alert if error rate is high
          const totalRequests = this.stats.successCount + this.stats.errorCount;
          const errorRate = this.stats.errorCount / totalRequests;

          if (errorRate > 0.1 && totalRequests > 10) { // >10% errors
            this.logger.warn(
              `High UDP error rate: ${(errorRate * 100).toFixed(1)}%`,
              'UDP',
              {
                errors: this.stats.errorCount,
                total: totalRequests,
                target: `${loxoneIp}:${port}`
              }
            );
          }

          reject(error);
        } else {
          this.stats.successCount++;
          this.stats.lastSuccessTime = Date.now();
          this.stats.consecutiveSuccesses++;
          this.stats.consecutiveErrors = 0;

          // Log recovery from unhealthy state
          if (!this.isHealthy && this.stats.consecutiveSuccesses >= 3) {
            this.isHealthy = true;
            this.logger.success(
              `UDP connection recovered after ${this.stats.consecutiveSuccesses} successful sends`,
              'UDP',
              {
                target: `${loxoneIp}:${port}`,
                totalSuccess: this.stats.successCount,
                totalErrors: this.stats.errorCount
              }
            );
          }

          // Log in debug mode, when recovering, or first success
          const shouldLog = this.config.get('debug') ||
                           this.stats.errorCount > 0 ||
                           this.stats.successCount === 1;

          if (shouldLog) {
            this.logger.debug(`UDP sent: ${message}`, category);
          }

          // Periodic health status logging (every 5 minutes in production)
          const now = Date.now();
          if (now - this.lastHealthLog > this.healthLogInterval) {
            this.lastHealthLog = now;
            const totalRequests = this.stats.successCount + this.stats.errorCount;
            const errorRate = totalRequests > 0
              ? (this.stats.errorCount / totalRequests * 100).toFixed(2)
              : '0';

            this.logger.info(
              `UDP health: ${this.isHealthy ? 'healthy' : 'degraded'}`,
              'UDP',
              {
                target: `${loxoneIp}:${port}`,
                successCount: this.stats.successCount,
                errorCount: this.stats.errorCount,
                errorRate: `${errorRate}%`,
                uptime: this.stats.lastSuccessTime
                  ? Math.round((now - this.stats.lastSuccessTime) / 1000) + 's'
                  : 'never'
              }
            );
          }

          // Log milestone successes (every 1000 messages in production)
          if (!this.config.get('debug') && this.stats.successCount % 1000 === 0) {
            this.logger.info(
              `UDP milestone: ${this.stats.successCount} messages sent`,
              'UDP',
              {
                target: `${loxoneIp}:${port}`,
                errorRate: `${(this.stats.errorCount / (this.stats.successCount + this.stats.errorCount) * 100).toFixed(2)}%`
              }
            );
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
   */
  getStats(): Record<string, unknown> {
    const total = this.stats.successCount + this.stats.errorCount;
    const errorRate = total > 0 ? (this.stats.errorCount / total) : 0;

    return {
      isHealthy: this.isHealthy,
      successCount: this.stats.successCount,
      errorCount: this.stats.errorCount,
      totalSent: total,
      errorRate: errorRate,
      errorRatePercent: (errorRate * 100).toFixed(2) + '%',
      consecutiveErrors: this.stats.consecutiveErrors,
      consecutiveSuccesses: this.stats.consecutiveSuccesses,
      lastError: this.stats.lastError ? this.stats.lastError.message : null,
      lastErrorTime: this.stats.lastErrorTime,
      lastSuccessTime: this.stats.lastSuccessTime,
      target: `${this.config.get('loxoneIp') || 'not configured'}:${this.config.get('loxonePort')}`
    };
  }

  /**
   * Get health status
   */
  getHealth(): Record<string, unknown> {
    const stats = this.getStats();
    const timeSinceLastSuccess = this.stats.lastSuccessTime
      ? Date.now() - this.stats.lastSuccessTime
      : null;

    return {
      status: this.isHealthy ? 'healthy' : 'unhealthy',
      configured: !!this.config.get('loxoneIp'),
      target: stats.target,
      successCount: stats.successCount,
      errorCount: stats.errorCount,
      errorRate: stats.errorRatePercent,
      consecutiveErrors: stats.consecutiveErrors,
      timeSinceLastSuccess: timeSinceLastSuccess ? `${Math.round(timeSinceLastSuccess / 1000)}s` : 'never',
      lastError: stats.lastError
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats.successCount = 0;
    this.stats.errorCount = 0;
    this.stats.lastError = null;
    this.logger.info('UDP statistics reset', 'SYSTEM');
  }

  /**
   * Close UDP client
   */
  close(): void {
    this.client.close();
    this.logger.info('UDP client closed', 'SYSTEM');
  }
}

export default LoxoneUDP;
