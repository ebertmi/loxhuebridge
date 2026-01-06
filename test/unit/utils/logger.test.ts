/**
 * Unit Tests for Logger Class
 * Tests logging functionality and buffer management in src/utils/logger.ts
 */

import Logger from '../../../src/utils/logger';
import winston from 'winston';

// Mock winston
jest.mock('winston', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    level: 'info'
  };

  return {
    createLogger: jest.fn(() => mockLogger),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      colorize: jest.fn(),
      printf: jest.fn(),
      errors: jest.fn(),
      json: jest.fn()
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    },
    addColors: jest.fn()
  };
});

// Mock fs
jest.mock('fs');

describe('Logger Class', () => {
  let logger: Logger;
  let mockWinstonLogger: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get mock winston logger instance
    mockWinstonLogger = (winston.createLogger as jest.Mock)();

    logger = new Logger({ debug: false });
  });

  describe('Constructor and Initialization', () => {
    it('should create logger with default options', () => {
      const defaultLogger = new Logger();
      expect(defaultLogger).toBeDefined();
      expect(winston.createLogger).toHaveBeenCalled();
    });

    it('should create logger with debug enabled', () => {
      const debugLogger = new Logger({ debug: true });
      expect(debugLogger).toBeDefined();
    });

    it('should create logger with custom maxLogs', () => {
      const customLogger = new Logger({ maxLogs: 50 });
      expect(customLogger).toBeDefined();
    });

    it('should initialize Winston with correct transports', () => {
      expect(winston.transports.Console).toHaveBeenCalled();
      expect(winston.transports.File).toHaveBeenCalledTimes(2); // error.log and combined.log
    });
  });

  describe('info()', () => {
    it('should log info messages', () => {
      logger.info('Test info message');

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Test info message',
        expect.objectContaining({ category: 'SYSTEM' })
      );
    });

    it('should log info with custom category', () => {
      logger.info('Test message', 'CUSTOM');

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({ category: 'CUSTOM' })
      );
    });

    it('should log info with metadata', () => {
      logger.info('Test message', 'SYSTEM', { key: 'value' });

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          category: 'SYSTEM',
          key: 'value'
        })
      );
    });

    it('should add info message to buffer', () => {
      logger.info('Buffered message');

      const logs = logger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].level).toBe('INFO');
      expect(logs[0].msg).toBe('Buffered message');
    });
  });

  describe('success()', () => {
    it('should log success messages', () => {
      logger.success('Operation successful');

      expect(mockWinstonLogger.log).toHaveBeenCalledWith(
        'success',
        'Operation successful',
        expect.objectContaining({ category: 'SYSTEM' })
      );
    });

    it('should add success message to buffer', () => {
      logger.success('Success message');

      const logs = logger.getLogs();
      expect(logs[0].level).toBe('SUCCESS');
      expect(logs[0].msg).toBe('Success message');
    });
  });

  describe('warn()', () => {
    it('should log warning messages', () => {
      logger.warn('Warning message');

      expect(mockWinstonLogger.warn).toHaveBeenCalledWith(
        'Warning message',
        expect.objectContaining({ category: 'SYSTEM' })
      );
    });

    it('should add warning message to buffer', () => {
      logger.warn('Warning');

      const logs = logger.getLogs();
      expect(logs[0].level).toBe('WARN');
      expect(logs[0].msg).toBe('Warning');
    });
  });

  describe('error()', () => {
    it('should log error messages', () => {
      logger.error('Error occurred');

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        'Error occurred',
        expect.objectContaining({ category: 'SYSTEM' })
      );
    });

    it('should add error message to buffer', () => {
      logger.error('Error message');

      const logs = logger.getLogs();
      expect(logs[0].level).toBe('ERROR');
      expect(logs[0].msg).toBe('Error message');
    });
  });

  describe('debug()', () => {
    it('should not log debug messages when debug is disabled', () => {
      logger.debug('Debug message');

      expect(mockWinstonLogger.debug).not.toHaveBeenCalled();
    });

    it('should log debug messages when debug is enabled', () => {
      const debugLogger = new Logger({ debug: true });
      const mockLogger = (winston.createLogger as jest.Mock)();

      debugLogger.debug('Debug message');

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Debug message',
        expect.objectContaining({ category: 'SYSTEM' })
      );
    });

    it('should add debug message to buffer when debug is enabled', () => {
      const debugLogger = new Logger({ debug: true });
      debugLogger.debug('Debug info');

      const logs = debugLogger.getLogs();
      expect(logs[0].level).toBe('DEBUG');
      expect(logs[0].msg).toBe('Debug info');
    });

    it('should not add debug message to buffer when debug is disabled', () => {
      logger.debug('Should not appear');

      const logs = logger.getLogs();
      expect(logs.length).toBe(0);
    });
  });

  describe('hueError()', () => {
    it('should handle 429 rate limit errors specially', () => {
      const error = {
        response: {
          status: 429,
          data: { error: 'Too many requests' }
        }
      };

      logger.hueError(error, 'HUE');

      expect(mockWinstonLogger.warn).toHaveBeenCalled();
      expect(mockWinstonLogger.error).not.toHaveBeenCalled();
    });

    it('should handle HTTP errors with status codes', () => {
      const error = {
        response: {
          status: 404,
          data: { error: 'Not found' }
        },
        message: 'Request failed'
      };

      logger.hueError(error, 'HUE');

      expect(mockWinstonLogger.error).toHaveBeenCalled();
      const errorCall = mockWinstonLogger.error.mock.calls[0];
      expect(errorCall[0]).toContain('HUE ERR 404');
    });

    it('should handle network errors without response', () => {
      const error = {
        message: 'Network error',
        stack: 'Error stack trace'
      };

      logger.hueError(error, 'HUE');

      expect(mockWinstonLogger.error).toHaveBeenCalled();
      const errorCall = mockWinstonLogger.error.mock.calls[0];
      expect(errorCall[0]).toContain('HUE ERR Net');
    });

    it('should use default category if not provided', () => {
      const error = {
        message: 'Test error'
      };

      logger.hueError(error);

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ category: 'SYSTEM' })
      );
    });
  });

  describe('setDebugMode()', () => {
    it('should enable debug mode', () => {
      logger.setDebugMode(true);

      expect(mockWinstonLogger.level).toBe('debug');
    });

    it('should disable debug mode', () => {
      logger.setDebugMode(false);

      expect(mockWinstonLogger.level).toBe('info');
    });

    it('should log when debug mode is changed', () => {
      mockWinstonLogger.info.mockClear();

      logger.setDebugMode(true);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Debug mode enabled',
        expect.objectContaining({ category: 'SYSTEM' })
      );
    });
  });

  describe('getLogs()', () => {
    it('should return all logs from buffer', () => {
      logger.info('Message 1');
      logger.warn('Message 2');
      logger.error('Message 3');

      const logs = logger.getLogs();

      expect(logs.length).toBe(3);
    });

    it('should return logs in reverse chronological order', () => {
      logger.info('First');
      logger.info('Second');
      logger.info('Third');

      const logs = logger.getLogs();

      expect(logs[0].msg).toBe('Third');
      expect(logs[1].msg).toBe('Second');
      expect(logs[2].msg).toBe('First');
    });

    it('should include timestamp for each log entry', () => {
      logger.info('Timestamped message');

      const logs = logger.getLogs();

      expect(logs[0].time).toBeDefined();
      expect(logs[0].time).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
    });

    it('should include category for each log entry', () => {
      logger.info('Message', 'CUSTOM');

      const logs = logger.getLogs();

      expect(logs[0].cat).toBe('CUSTOM');
    });
  });

  describe('Log Buffer Management', () => {
    it('should respect maxLogs buffer size', () => {
      const smallLogger = new Logger({ maxLogs: 3 });

      smallLogger.info('Message 1');
      smallLogger.info('Message 2');
      smallLogger.info('Message 3');
      smallLogger.info('Message 4');

      const logs = smallLogger.getLogs();

      expect(logs.length).toBe(3);
      expect(logs[0].msg).toBe('Message 4');
      expect(logs[2].msg).toBe('Message 2');
    });

    it('should handle circular buffer overflow correctly', () => {
      const tinyLogger = new Logger({ maxLogs: 2 });

      for (let i = 1; i <= 5; i++) {
        tinyLogger.info(`Message ${i}`);
      }

      const logs = tinyLogger.getLogs();

      expect(logs.length).toBe(2);
      expect(logs[0].msg).toBe('Message 5');
      expect(logs[1].msg).toBe('Message 4');
    });

    it('should handle mixed log levels in buffer', () => {
      logger.info('Info');
      logger.success('Success');
      logger.warn('Warning');
      logger.error('Error');

      const logs = logger.getLogs();

      expect(logs.length).toBe(4);
      expect(logs.some(l => l.level === 'INFO')).toBe(true);
      expect(logs.some(l => l.level === 'SUCCESS')).toBe(true);
      expect(logs.some(l => l.level === 'WARN')).toBe(true);
      expect(logs.some(l => l.level === 'ERROR')).toBe(true);
    });
  });

  describe('Log Entry Structure', () => {
    it('should create valid log entry structure', () => {
      logger.info('Test message', 'TEST_CAT');

      const logs = logger.getLogs();
      const entry = logs[0];

      expect(entry).toHaveProperty('time');
      expect(entry).toHaveProperty('level');
      expect(entry).toHaveProperty('msg');
      expect(entry).toHaveProperty('cat');
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Message with "quotes" and \n newlines';
      logger.info(specialMessage);

      const logs = logger.getLogs();
      expect(logs[0].msg).toBe(specialMessage);
    });

    it('should handle empty messages', () => {
      logger.info('');

      const logs = logger.getLogs();
      expect(logs[0].msg).toBe('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      logger.info(longMessage);

      const logs = logger.getLogs();
      expect(logs[0].msg).toBe(longMessage);
    });
  });

  describe('Category Handling', () => {
    it('should default to SYSTEM category', () => {
      logger.info('No category specified');

      const logs = logger.getLogs();
      expect(logs[0].cat).toBe('SYSTEM');
    });

    it('should accept custom categories', () => {
      const categories = ['HUE', 'LOXONE', 'API', 'SETUP'];

      categories.forEach(cat => {
        logger.info('Test', cat);
      });

      const logs = logger.getLogs();
      expect(logs.map(l => l.cat)).toEqual(categories.reverse());
    });
  });
});
