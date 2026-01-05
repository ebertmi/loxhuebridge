/**
 * Rate Limiter Service
 * Prevents Hue Bridge API rate limit errors (HTTP 429)
 * by queueing requests with appropriate delays
 */

import CONSTANTS from '../constants';
import Logger from '../utils/logger';
import { QueueTask, QueueStats } from '../types';

/**
 * Queue information structure
 */
interface QueueInfo {
  items: QueueTask[];
  isProcessing: boolean;
  delayMs: number;
}

/**
 * Queue types
 */
type QueueType = 'light' | 'grouped_light';

class RateLimiter {
  private logger: Logger;
  private queues: Record<QueueType, QueueInfo>;

  constructor(logger: Logger) {
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
   */
  private async processQueue(type: QueueType): Promise<void> {
    const queue = this.queues[type];

    if (queue.isProcessing || queue.items.length === 0) {
      return;
    }

    queue.isProcessing = true;
    const task = queue.items.shift();

    if (task) {
      try {
        await task();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Queue error (${type}): ${message}`, 'SYSTEM');
      }
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
   */
  enqueue(type: string, taskFn: QueueTask): Promise<void> {
    // Default to 'light' queue if type is unknown
    const queueType = (this.queues[type as QueueType] ? type : 'light') as QueueType;

    this.queues[queueType].items.push(taskFn);
    this.processQueue(queueType);

    return Promise.resolve();
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      lights: {
        pending: this.queues.light.items.length,
        processed: 0 // Not tracked in this implementation
      },
      groupedLights: {
        pending: this.queues.grouped_light.items.length,
        processed: 0 // Not tracked in this implementation
      }
    };
  }

  /**
   * Clear all queues (for testing or reset)
   */
  clearAll(): void {
    (Object.keys(this.queues) as QueueType[]).forEach(type => {
      this.queues[type].items = [];
      this.queues[type].isProcessing = false;
    });
    this.logger.info('All queues cleared', 'SYSTEM');
  }
}

export default RateLimiter;
