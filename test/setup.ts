/**
 * Jest Test Setup
 * Global configuration for all tests
 */

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DEBUG = 'false';

// Increase timeout for integration tests
jest.setTimeout(10000);
