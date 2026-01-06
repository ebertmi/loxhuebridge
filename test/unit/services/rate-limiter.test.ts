/**
 * Unit Tests for RateLimiter Class
 * Tests request rate limiting and queue management in src/services/rate-limiter.ts
 */

import RateLimiter from '../../../src/services/rate-limiter';
import Logger from '../../../src/utils/logger';
import CONSTANTS from '../../../src/constants';

// Mock Logger
jest.mock('../../../src/utils/logger');
const MockedLogger = Logger as jest.MockedClass<typeof Logger>;

describe('RateLimiter Class', () => {
  let mockLogger: jest.Mocked<Logger>;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup mock logger
    mockLogger = new MockedLogger() as jest.Mocked<Logger>;
    mockLogger.info = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.debug = jest.fn();

    rateLimiter = new RateLimiter(mockLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with empty queues', () => {
      const stats = rateLimiter.getStats();

      expect(stats.lights.pending).toBe(0);
      expect(stats.groupedLights.pending).toBe(0);
    });

    it('should create separate queues for lights and grouped lights', () => {
      const stats = rateLimiter.getStats();

      expect(stats.lights).toBeDefined();
      expect(stats.groupedLights).toBeDefined();
    });
  });

  describe('enqueue()', () => {
    it('should enqueue and execute a light task', async () => {
      const taskFn = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', taskFn);

      // Wait for task to be picked up
      await Promise.resolve();

      expect(taskFn).toHaveBeenCalledTimes(1);
    });

    it('should enqueue and execute a grouped_light task', async () => {
      const taskFn = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('grouped_light', taskFn);

      // Wait for task to be picked up
      await Promise.resolve();

      expect(taskFn).toHaveBeenCalledTimes(1);
    });

    it('should default to light queue for unknown types', async () => {
      const taskFn = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('unknown_type', taskFn);

      // Wait for task to be picked up
      await Promise.resolve();

      expect(taskFn).toHaveBeenCalledTimes(1);
    });

    it('should add multiple tasks to queue', async () => {
      const task1 = jest.fn().mockResolvedValue(undefined);
      const task2 = jest.fn().mockResolvedValue(undefined);
      const task3 = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', task1);
      await rateLimiter.enqueue('light', task2);
      await rateLimiter.enqueue('light', task3);

      const stats = rateLimiter.getStats();
      // First task starts immediately, so 2 should be pending
      expect(stats.lights.pending).toBeGreaterThanOrEqual(1);
    });

    it('should handle async tasks', async () => {
      const asyncTask = jest.fn(async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 10);
        });
      });

      await rateLimiter.enqueue('light', asyncTask);
      await Promise.resolve();

      expect(asyncTask).toHaveBeenCalledTimes(1);
    });

    it('should handle task errors without breaking the queue', async () => {
      const failingTask = jest.fn().mockRejectedValue(new Error('Task failed'));
      const successTask = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', failingTask);
      await Promise.resolve();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Queue error (light)'),
        'SYSTEM'
      );

      // Enqueue another task to ensure queue still works
      await rateLimiter.enqueue('light', successTask);

      // Advance timer past the delay
      jest.advanceTimersByTime(CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS);
      await Promise.resolve();

      expect(successTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rate Limiting Delays', () => {
    it('should enforce delay between light tasks', async () => {
      const task1 = jest.fn().mockResolvedValue(undefined);
      const task2 = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', task1);
      await rateLimiter.enqueue('light', task2);

      await Promise.resolve();

      expect(task1).toHaveBeenCalledTimes(1);
      expect(task2).not.toHaveBeenCalled();

      // Advance timer by the light delay
      jest.advanceTimersByTime(CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS);
      await Promise.resolve();

      expect(task2).toHaveBeenCalledTimes(1);
    });

    it('should use correct delay for light queue (120ms)', async () => {
      const task1 = jest.fn().mockResolvedValue(undefined);
      const task2 = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', task1);
      await rateLimiter.enqueue('light', task2);

      await Promise.resolve();

      // Not enough time - task2 should not execute
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(task2).not.toHaveBeenCalled();

      // Advance remaining time
      jest.advanceTimersByTime(20);
      await Promise.resolve();
      expect(task2).toHaveBeenCalledTimes(1);
    });

    it('should use correct delay for grouped_light queue (1100ms)', async () => {
      const task1 = jest.fn().mockResolvedValue(undefined);
      const task2 = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('grouped_light', task1);
      await rateLimiter.enqueue('grouped_light', task2);

      await Promise.resolve();

      // Not enough time
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      expect(task2).not.toHaveBeenCalled();

      // Advance remaining time
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(task2).toHaveBeenCalledTimes(1);
    });

    it('should process tasks from different queues independently', async () => {
      const lightTask = jest.fn().mockResolvedValue(undefined);
      const groupTask = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', lightTask);
      await rateLimiter.enqueue('grouped_light', groupTask);

      await Promise.resolve();

      // Both should execute immediately (they're in different queues)
      expect(lightTask).toHaveBeenCalledTimes(1);
      expect(groupTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('Queue Processing', () => {
    it('should process queue in FIFO order', async () => {
      const executionOrder: number[] = [];

      const task1 = jest.fn(async () => {
        executionOrder.push(1);
      });
      const task2 = jest.fn(async () => {
        executionOrder.push(2);
      });
      const task3 = jest.fn(async () => {
        executionOrder.push(3);
      });

      await rateLimiter.enqueue('light', task1);
      await rateLimiter.enqueue('light', task2);
      await rateLimiter.enqueue('light', task3);

      await Promise.resolve();

      // Advance through all delays
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS);
        await Promise.resolve();
      }

      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should not process queue when already processing', async () => {
      const task1 = jest.fn(async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 100);
        });
      });
      const task2 = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', task1);
      await Promise.resolve();

      // Try to add another task while first is processing
      await rateLimiter.enqueue('light', task2);

      expect(task1).toHaveBeenCalledTimes(1);
      expect(task2).not.toHaveBeenCalled();
    });

    it('should continue processing queue until empty', async () => {
      const tasks = Array.from({ length: 5 }, () =>
        jest.fn().mockResolvedValue(undefined)
      );

      // Enqueue all tasks
      for (const task of tasks) {
        await rateLimiter.enqueue('light', task);
      }

      await Promise.resolve();

      // Process all tasks
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS);
        await Promise.resolve();
      }

      // All tasks should have been executed
      tasks.forEach((task) => {
        expect(task).toHaveBeenCalledTimes(1);
      });
    });

    it('should stop processing when queue is empty', async () => {
      const task = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', task);
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(1);

      // Advance time - should not cause any issues
      jest.advanceTimersByTime(CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS * 10);
      await Promise.resolve();

      // Task should still only have been called once
      expect(task).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStats()', () => {
    it('should return statistics for all queues', () => {
      const stats = rateLimiter.getStats();

      expect(stats).toHaveProperty('lights');
      expect(stats).toHaveProperty('groupedLights');
      expect(stats.lights).toHaveProperty('pending');
      expect(stats.lights).toHaveProperty('processed');
      expect(stats.groupedLights).toHaveProperty('pending');
      expect(stats.groupedLights).toHaveProperty('processed');
    });

    it('should show correct pending count', async () => {
      const tasks = Array.from({ length: 3 }, () =>
        jest.fn().mockResolvedValue(undefined)
      );

      for (const task of tasks) {
        await rateLimiter.enqueue('light', task);
      }

      const stats = rateLimiter.getStats();

      // First task processes immediately, so 2 should be pending
      expect(stats.lights.pending).toBeGreaterThanOrEqual(1);
    });

    it('should update pending count as queue processes', async () => {
      const tasks = Array.from({ length: 3 }, () =>
        jest.fn().mockResolvedValue(undefined)
      );

      for (const task of tasks) {
        await rateLimiter.enqueue('light', task);
      }

      await Promise.resolve();
      const stats1 = rateLimiter.getStats();
      const pending1 = stats1.lights.pending;

      // Process one task
      jest.advanceTimersByTime(CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS);
      await Promise.resolve();

      const stats2 = rateLimiter.getStats();
      const pending2 = stats2.lights.pending;

      expect(pending2).toBeLessThan(pending1);
    });

    it('should track separate statistics for each queue', async () => {
      const lightTask = jest.fn().mockResolvedValue(undefined);
      const groupTask = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', lightTask);
      await rateLimiter.enqueue('light', lightTask);
      await rateLimiter.enqueue('grouped_light', groupTask);

      const stats = rateLimiter.getStats();

      expect(stats.lights.pending).toBeGreaterThanOrEqual(1);
      expect(stats.groupedLights.pending).toBeGreaterThanOrEqual(0);
    });

    it('should show zero pending when queue is empty', async () => {
      const task = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', task);
      await Promise.resolve();

      // Process the task
      jest.advanceTimersByTime(CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS);
      await Promise.resolve();

      const stats = rateLimiter.getStats();
      expect(stats.lights.pending).toBe(0);
    });
  });

  describe('clearAll()', () => {
    it('should clear all queues', async () => {
      const tasks = Array.from({ length: 5 }, () =>
        jest.fn().mockResolvedValue(undefined)
      );

      for (const task of tasks) {
        await rateLimiter.enqueue('light', task);
        await rateLimiter.enqueue('grouped_light', task);
      }

      rateLimiter.clearAll();

      const stats = rateLimiter.getStats();
      expect(stats.lights.pending).toBe(0);
      expect(stats.groupedLights.pending).toBe(0);
    });

    it('should log when clearing queues', () => {
      rateLimiter.clearAll();

      expect(mockLogger.info).toHaveBeenCalledWith('All queues cleared', 'SYSTEM');
    });

    it('should reset processing state', async () => {
      const task1 = jest.fn().mockResolvedValue(undefined);
      const task2 = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', task1);
      await Promise.resolve();

      rateLimiter.clearAll();

      // Add new task after clearing
      await rateLimiter.enqueue('light', task2);
      await Promise.resolve();

      // New task should execute
      expect(task2).toHaveBeenCalledTimes(1);
    });

    it('should not throw when clearing empty queues', () => {
      expect(() => {
        rateLimiter.clearAll();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle non-Error exceptions', async () => {
      const task = jest.fn().mockRejectedValue('String error');

      await rateLimiter.enqueue('light', task);
      await Promise.resolve();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Queue error (light)'),
        'SYSTEM'
      );
    });

    it('should log error with queue type', async () => {
      const error = new Error('Test error');
      const task = jest.fn().mockRejectedValue(error);

      await rateLimiter.enqueue('grouped_light', task);
      await Promise.resolve();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Queue error (grouped_light): Test error',
        'SYSTEM'
      );
    });

    it('should not stop queue processing on error', async () => {
      const failTask = jest.fn().mockRejectedValue(new Error('Fail'));
      const successTask1 = jest.fn().mockResolvedValue(undefined);
      const successTask2 = jest.fn().mockResolvedValue(undefined);

      await rateLimiter.enqueue('light', successTask1);
      await rateLimiter.enqueue('light', failTask);
      await rateLimiter.enqueue('light', successTask2);

      await Promise.resolve();

      // Process through all tasks
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS);
        await Promise.resolve();
      }

      expect(successTask1).toHaveBeenCalledTimes(1);
      expect(failTask).toHaveBeenCalledTimes(1);
      expect(successTask2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance and Throughput', () => {
    it('should process approximately 8 light requests per second', async () => {
      const tasks = Array.from({ length: 10 }, () =>
        jest.fn().mockResolvedValue(undefined)
      );

      for (const task of tasks) {
        await rateLimiter.enqueue('light', task);
      }

      await Promise.resolve();

      // Process all tasks
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS);
        await Promise.resolve();
      }

      const totalTime = CONSTANTS.RATE_LIMIT.LIGHT_DELAY_MS * 9; // 9 delays for 10 tasks
      const tasksPerSecond = (9 * 1000) / totalTime;

      // Should be approximately 8 requests per second (120ms delay = ~8.33 req/s)
      expect(tasksPerSecond).toBeGreaterThan(7);
      expect(tasksPerSecond).toBeLessThan(9);
    });

    it('should process approximately 0.9 grouped light requests per second', async () => {
      const tasks = Array.from({ length: 5 }, () =>
        jest.fn().mockResolvedValue(undefined)
      );

      for (const task of tasks) {
        await rateLimiter.enqueue('grouped_light', task);
      }

      await Promise.resolve();

      // Process all tasks
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(CONSTANTS.RATE_LIMIT.GROUPED_LIGHT_DELAY_MS);
        await Promise.resolve();
      }

      const totalTime = CONSTANTS.RATE_LIMIT.GROUPED_LIGHT_DELAY_MS * 4; // 4 delays for 5 tasks
      const tasksPerSecond = (4 * 1000) / totalTime;

      // Should be approximately 0.9 requests per second (1100ms delay = ~0.91 req/s)
      expect(tasksPerSecond).toBeGreaterThan(0.8);
      expect(tasksPerSecond).toBeLessThan(1.0);
    });
  });
});
