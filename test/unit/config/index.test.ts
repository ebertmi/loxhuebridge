/**
 * Unit Tests for Config Class
 * Tests configuration management in src/config/index.ts
 */

import fs from 'fs';
import Config from '../../../src/config';
import Logger from '../../../src/utils/logger';
import { BridgeConfig, DeviceMapping } from '../../../src/types';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock Logger
jest.mock('../../../src/utils/logger');
const MockedLogger = Logger as jest.MockedClass<typeof Logger>;

describe('Config Class', () => {
  let mockLogger: jest.Mocked<Logger>;
  const testDataDir = '/test/data';

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock logger
    mockLogger = new MockedLogger() as jest.Mocked<Logger>;
    mockLogger.info = jest.fn();
    mockLogger.success = jest.fn();
    mockLogger.warn = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.debug = jest.fn();
    mockLogger.setDebugMode = jest.fn();

    // Setup fs mocks with default behavior
    mockedFs.existsSync = jest.fn().mockReturnValue(false);
    mockedFs.mkdirSync = jest.fn();
    mockedFs.readFileSync = jest.fn();
    mockedFs.writeFileSync = jest.fn();
    mockedFs.copyFileSync = jest.fn();
  });

  describe('Constructor and Initialization', () => {
    it('should create data directory if it does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);

      new Config(mockLogger, testDataDir);

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith(testDataDir, { recursive: true });
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Created data directory'),
        'SYSTEM'
      );
    });

    it('should not create data directory if it exists', () => {
      mockedFs.existsSync.mockReturnValue(true);

      new Config(mockLogger, testDataDir);

      expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should throw error if directory creation fails', () => {
      mockedFs.existsSync.mockReturnValue(false);
      const error = new Error('Permission denied');
      mockedFs.mkdirSync.mockImplementation(() => {
        throw error;
      });

      expect(() => {
        new Config(mockLogger, testDataDir);
      }).toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create data directory'),
        'SYSTEM'
      );
    });

    it('should use default data directory if none provided', () => {
      mockedFs.existsSync.mockReturnValue(true);
      const config = new Config(mockLogger);
      expect(config).toBeDefined();
    });

    it('should initialize with default configuration', () => {
      mockedFs.existsSync.mockReturnValue(true);
      const config = new Config(mockLogger, testDataDir);

      expect(config.get('bridgeIp')).toBeNull();
      expect(config.get('appKey')).toBeNull();
      expect(config.get('loxoneIp')).toBeNull();
      expect(config.get('debug')).toBe(false);
      expect(config.get('bidirectionalSync')).toBe(false);
    });
  });

  describe('Loading Configuration', () => {
    it('should load existing config from file', () => {
      const validConfig: BridgeConfig = {
        bridgeIp: '192.168.1.100',
        appKey: 'test-app-key',
        loxoneIp: '192.168.1.200',
        loxonePort: 7000,
        loxoneHttpPort: 80,
        loxoneUser: null,
        loxonePassword: null,
        loxoneToken: null,
        loxoneTokenExpiry: null,
        bidirectionalSync: false,
        bidirectionalDebounceMs: 2000,
        syncEnabled: true,
        debug: true,
        transitionTime: 400,
        certPinningEnabled: false,
        certFingerprint: null
      };

      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('config.json');
      });

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(validConfig));

      const config = new Config(mockLogger, testDataDir);

      expect(config.get('bridgeIp')).toBe('192.168.1.100');
      expect(config.get('appKey')).toBe('test-app-key');
      expect(config.get('loxoneIp')).toBe('192.168.1.200');
      expect(config.get('debug')).toBe(true);
      expect(mockLogger.success).toHaveBeenCalledWith('Configuration loaded', 'SYSTEM');
    });

    it('should handle missing config file gracefully', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);

      expect(config.get('bridgeIp')).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Setup required - Bridge not configured',
        'SYSTEM'
      );
    });

    it('should handle corrupt config file', () => {
      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('config.json');
      });

      mockedFs.readFileSync.mockReturnValue('{ invalid json }');

      new Config(mockLogger, testDataDir);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load config'),
        'SYSTEM'
      );
      expect(mockedFs.copyFileSync).toHaveBeenCalled();
      expect(mockedFs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle invalid config structure', () => {
      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('config.json');
      });

      const invalidConfig = {
        bridgeIp: 123, // Should be string
        appKey: null,
        loxonePort: 'invalid' // Should be number
      };

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      new Config(mockLogger, testDataDir);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load config'),
        'SYSTEM'
      );
    });

    it('should set default values for missing fields', () => {
      const minimalConfig = {
        bridgeIp: '192.168.1.100',
        appKey: 'key',
        loxoneIp: null,
        loxonePort: 7000,
        debug: false
      };

      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('config.json');
      });

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(minimalConfig));

      const config = new Config(mockLogger, testDataDir);

      expect(config.get('transitionTime')).toBe(400);
      expect(config.get('certPinningEnabled')).toBe(false);
      expect(config.get('bidirectionalSync')).toBe(false);
      expect(config.get('loxoneHttpPort')).toBe(80);
    });
  });

  describe('Loading Mapping', () => {
    it('should load existing mapping from file', () => {
      const validMapping: DeviceMapping[] = [
        {
          loxone_name: 'TestLight',
          hue_uuid: 'hue-123',
          hue_name: 'Hue Light',
          hue_type: 'light',
          bidirectional: true
        }
      ];

      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('mapping.json');
      });

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(validMapping));

      const config = new Config(mockLogger, testDataDir);
      const mapping = config.getMapping();

      expect(mapping).toHaveLength(1);
      expect(mapping[0].loxone_name).toBe('TestLight');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Loaded 1 device mappings',
        'SYSTEM'
      );
    });

    it('should handle missing mapping file', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);
      const mapping = config.getMapping();

      expect(mapping).toEqual([]);
    });

    it('should filter out invalid mapping entries', () => {
      const mixedMapping = [
        {
          loxone_name: 'ValidLight',
          hue_uuid: 'hue-123',
          hue_name: 'Valid',
          hue_type: 'light'
        },
        {
          loxone_name: '', // Invalid: empty name
          hue_uuid: 'hue-456',
          hue_name: 'Invalid',
          hue_type: 'light'
        },
        {
          // Missing required fields
          loxone_name: 'MissingFields'
        },
        {
          loxone_name: 'InvalidType',
          hue_uuid: 'hue-789',
          hue_name: 'Invalid Type',
          hue_type: 'invalid_type' // Invalid type
        }
      ];

      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('mapping.json');
      });

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mixedMapping));

      const config = new Config(mockLogger, testDataDir);
      const mapping = config.getMapping();

      expect(mapping).toHaveLength(1);
      expect(mapping[0].loxone_name).toBe('ValidLight');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle non-array mapping data', () => {
      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('mapping.json');
      });

      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ not: 'array' }));

      const config = new Config(mockLogger, testDataDir);
      const mapping = config.getMapping();

      expect(mapping).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Mapping is not an array, resetting',
        'SYSTEM'
      );
    });
  });

  describe('isReady()', () => {
    it('should return false when bridge is not configured', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);

      expect(config.isReady()).toBe(false);
    });

    it('should return true when bridge is configured', () => {
      const validConfig: BridgeConfig = {
        bridgeIp: '192.168.1.100',
        appKey: 'test-key',
        loxoneIp: null,
        loxonePort: 7000,
        loxoneHttpPort: 80,
        loxoneUser: null,
        loxonePassword: null,
        loxoneToken: null,
        loxoneTokenExpiry: null,
        bidirectionalSync: false,
        bidirectionalDebounceMs: 2000,
        syncEnabled: true,
        debug: false,
        transitionTime: 400,
        certPinningEnabled: false,
        certFingerprint: null
      };

      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('config.json');
      });

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(validConfig));

      const config = new Config(mockLogger, testDataDir);

      expect(config.isReady()).toBe(true);
    });

    it('should return false when only bridgeIp is set', () => {
      const partialConfig: Partial<BridgeConfig> = {
        bridgeIp: '192.168.1.100',
        appKey: null
      };

      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('config.json');
      });

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(partialConfig));

      const config = new Config(mockLogger, testDataDir);

      expect(config.isReady()).toBe(false);
    });
  });

  describe('get()', () => {
    it('should return configuration value', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);

      expect(config.get('debug')).toBe(false);
      expect(config.get('loxonePort')).toBe(7000);
      expect(config.get('bridgeIp')).toBeNull();
    });

    it('should return correct types', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);

      expect(typeof config.get('debug')).toBe('boolean');
      expect(typeof config.get('loxonePort')).toBe('number');
      expect(typeof config.get('transitionTime')).toBe('number');
    });
  });

  describe('update()', () => {
    it('should update configuration and save to file', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);

      config.update({
        bridgeIp: '192.168.1.100',
        appKey: 'new-key',
        debug: true
      });

      expect(config.get('bridgeIp')).toBe('192.168.1.100');
      expect(config.get('appKey')).toBe('new-key');
      expect(config.get('debug')).toBe(true);
      expect(mockedFs.writeFileSync).toHaveBeenCalled();
    });

    it('should update isReady status when bridge is configured', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);

      expect(config.isReady()).toBe(false);

      config.update({
        bridgeIp: '192.168.1.100',
        appKey: 'test-key'
      });

      expect(config.isReady()).toBe(true);
    });

    it('should merge partial updates with existing config', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);

      config.update({ debug: true });
      expect(config.get('debug')).toBe(true);
      expect(config.get('loxonePort')).toBe(7000); // Should remain unchanged
    });

    it('should throw error if save fails', () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      const config = new Config(mockLogger, testDataDir);

      expect(() => {
        config.update({ debug: true });
      }).toThrow('Write failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save config'),
        'SYSTEM'
      );
    });
  });

  describe('getMapping()', () => {
    it('should return copy of mapping array', () => {
      const validMapping: DeviceMapping[] = [
        {
          loxone_name: 'Light1',
          hue_uuid: 'uuid1',
          hue_name: 'Hue Light 1',
          hue_type: 'light'
        }
      ];

      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('mapping.json');
      });

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(validMapping));

      const config = new Config(mockLogger, testDataDir);
      const mapping1 = config.getMapping();
      const mapping2 = config.getMapping();

      expect(mapping1).toEqual(mapping2);
      expect(mapping1).not.toBe(mapping2); // Should be a copy
    });
  });

  describe('updateMapping()', () => {
    it('should update and save mapping', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);

      const newMapping: DeviceMapping[] = [
        {
          loxone_name: 'NewLight',
          hue_uuid: 'uuid-new',
          hue_name: 'New Light',
          hue_type: 'light'
        }
      ];

      config.updateMapping(newMapping);

      const mapping = config.getMapping();
      expect(mapping).toHaveLength(1);
      expect(mapping[0].loxone_name).toBe('NewLight');
      expect(mockedFs.writeFileSync).toHaveBeenCalled();
    });

    it('should validate mapping before saving', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);

      const invalidMapping = [
        {
          loxone_name: '',
          hue_uuid: 'uuid',
          hue_name: 'Invalid',
          hue_type: 'light'
        }
      ] as DeviceMapping[];

      config.updateMapping(invalidMapping);

      const mapping = config.getMapping();
      expect(mapping).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should throw error if save fails', () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      const config = new Config(mockLogger, testDataDir);

      const newMapping: DeviceMapping[] = [
        {
          loxone_name: 'Light',
          hue_uuid: 'uuid',
          hue_name: 'Light',
          hue_type: 'light'
        }
      ];

      expect(() => {
        config.updateMapping(newMapping);
      }).toThrow('Write failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save mapping'),
        'SYSTEM'
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle environment variables in config', () => {
      process.env.HUE_BRIDGE_IP = '192.168.1.50';
      process.env.HUE_APP_KEY = 'env-key';
      process.env.DEBUG = 'true';

      mockedFs.existsSync.mockReturnValue(false);

      const config = new Config(mockLogger, testDataDir);

      expect(config.get('bridgeIp')).toBe('192.168.1.50');
      expect(config.get('appKey')).toBe('env-key');
      expect(config.get('debug')).toBe(true);

      // Cleanup
      delete process.env.HUE_BRIDGE_IP;
      delete process.env.HUE_APP_KEY;
      delete process.env.DEBUG;
    });

    it('should validate port numbers are within valid range', () => {
      const invalidConfig = {
        bridgeIp: '192.168.1.100',
        appKey: 'key',
        loxoneIp: null,
        loxonePort: 70000, // Invalid: > 65535
        debug: false
      };

      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('config.json');
      });

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      const config = new Config(mockLogger, testDataDir);

      // Should fall back to defaults due to invalid config
      expect(config.get('loxonePort')).toBe(7000);
    });

    it('should handle all supported device types in mapping', () => {
      const allTypesMapping: DeviceMapping[] = [
        {
          loxone_name: 'Light1',
          hue_uuid: 'uuid1',
          hue_name: 'Light',
          hue_type: 'light'
        },
        {
          loxone_name: 'Group1',
          hue_uuid: 'uuid2',
          hue_name: 'Group',
          hue_type: 'group'
        },
        {
          loxone_name: 'Sensor1',
          hue_uuid: 'uuid3',
          hue_name: 'Sensor',
          hue_type: 'sensor'
        },
        {
          loxone_name: 'Button1',
          hue_uuid: 'uuid4',
          hue_name: 'Button',
          hue_type: 'button'
        }
      ];

      mockedFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('mapping.json');
      });

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(allTypesMapping));

      const config = new Config(mockLogger, testDataDir);
      const mapping = config.getMapping();

      expect(mapping).toHaveLength(4);
    });
  });
});
