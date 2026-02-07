/**
 * Unit Tests for API Settings Route
 * Tests GET /api/settings endpoint in src/routes/api.ts
 */

import express, { Express } from 'express';
import request from 'supertest';
import createApiRoutes from '../../../src/routes/api';
import Config from '../../../src/config';
import HueClient from '../../../src/services/hue-client';
import LoxoneClient from '../../../src/services/loxone-client';
import Logger from '../../../src/utils/logger';
import StatusManager from '../../../src/services/status-manager';
import EventStream from '../../../src/services/event-stream';
import RateLimiter from '../../../src/services/rate-limiter';
import { DetectedItemsStore } from '../../../src/types';

// Mock modules
jest.mock('../../../src/config');
jest.mock('../../../src/services/hue-client');
jest.mock('../../../src/services/loxone-client');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/services/status-manager');
jest.mock('../../../src/services/event-stream');
jest.mock('../../../src/services/rate-limiter');

describe('API Settings Route', () => {
  let app: Express;
  let mockConfig: jest.Mocked<Config>;
  let mockHueClient: jest.Mocked<HueClient>;
  let mockLoxoneClient: jest.Mocked<LoxoneClient>;
  let mockLogger: jest.Mocked<Logger>;
  let mockStatusManager: jest.Mocked<StatusManager>;
  let mockEventStream: jest.Mocked<EventStream>;
  let mockRateLimiter: jest.Mocked<RateLimiter>;
  let detectedItems: DetectedItemsStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      isReady: jest.fn().mockReturnValue(true),
      getMapping: jest.fn().mockReturnValue([]),
      get: jest.fn(),
      update: jest.fn(),
      updateMapping: jest.fn()
    } as unknown as jest.Mocked<Config>;

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<Logger>;

    mockHueClient = {} as unknown as jest.Mocked<HueClient>;

    mockLoxoneClient = {} as unknown as jest.Mocked<LoxoneClient>;

    mockStatusManager = {
      getAll: jest.fn().mockReturnValue({})
    } as unknown as jest.Mocked<StatusManager>;

    mockEventStream = {
      getStatus: jest.fn().mockReturnValue({ connected: true, healthy: true })
    } as unknown as jest.Mocked<EventStream>;

    mockRateLimiter = {
      getStats: jest.fn().mockReturnValue({ lights: { pending: 0, processed: 0 }, groupedLights: { pending: 0, processed: 0 } })
    } as unknown as jest.Mocked<RateLimiter>;

    detectedItems = { items: [] };

    // Setup config.get mock to return appropriate values
    mockConfig.get.mockImplementation((key: string) => {
      const values: Record<string, any> = {
        bridgeIp: '192.168.1.100',
        loxoneIp: '192.168.1.200',
        loxonePort: 5555,
        debug: false,
        transitionTime: 400,
        bidirectionalSync: true,
        loxoneUser: 'admin',
        loxonePassword: 'secret123',
        loxoneHttpPort: 8080
      };
      return values[key];
    });

    app = express();
    app.use(express.json());
    const router = createApiRoutes({
      config: mockConfig,
      hueClient: mockHueClient,
      loxoneClient: mockLoxoneClient,
      logger: mockLogger,
      statusManager: mockStatusManager,
      eventStream: mockEventStream,
      rateLimiter: mockRateLimiter,
      detectedItems,
      httpPort: 3000,
      version: '2.0.0'
    });
    app.use('/api', router);
  });

  describe('GET /api/settings', () => {
    it('should return basic settings fields', async () => {
      const response = await request(app)
        .get('/api/settings')
        .expect(200);

      expect(response.body.bridge_ip).toBe('192.168.1.100');
      expect(response.body.loxone_ip).toBe('192.168.1.200');
      expect(response.body.loxone_port).toBe(5555);
      expect(response.body.http_port).toBe(3000);
      expect(response.body.debug).toBe(false);
      expect(response.body.key_configured).toBe(true);
      expect(response.body.transitionTime).toBe(400);
      expect(response.body.version).toBe('2.0.0');
    });

    it('should include bidirectional_sync field', async () => {
      const response = await request(app)
        .get('/api/settings')
        .expect(200);

      expect(response.body.bidirectional_sync).toBe(true);
    });

    it('should include loxone_user field', async () => {
      const response = await request(app)
        .get('/api/settings')
        .expect(200);

      expect(response.body.loxone_user).toBe('admin');
    });

    it('should include loxone_http_port field', async () => {
      const response = await request(app)
        .get('/api/settings')
        .expect(200);

      expect(response.body.loxone_http_port).toBe(8080);
    });

    it('should include loxone_connection_configured as true when all credentials present', async () => {
      const response = await request(app)
        .get('/api/settings')
        .expect(200);

      expect(response.body.loxone_connection_configured).toBe(true);
    });

    it('should NEVER return password in the response', async () => {
      const response = await request(app)
        .get('/api/settings')
        .expect(200);

      const body = response.body;
      // Check that no field contains the password
      expect(body.loxone_password).toBeUndefined();
      expect(body.loxonePassword).toBeUndefined();
      expect(body.password).toBeUndefined();

      // Also verify the password value doesn't appear anywhere in the serialized response
      const bodyString = JSON.stringify(body);
      expect(bodyString).not.toContain('secret123');
    });

    it('should set loxone_connection_configured to false when loxone_user is missing', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        const values: Record<string, any> = {
          bridgeIp: '192.168.1.100',
          loxoneIp: '192.168.1.200',
          loxonePort: 5555,
          debug: false,
          transitionTime: 400,
          bidirectionalSync: false,
          loxoneUser: null,
          loxonePassword: 'secret123',
          loxoneHttpPort: 8080
        };
        return values[key];
      });

      const response = await request(app)
        .get('/api/settings')
        .expect(200);

      expect(response.body.loxone_connection_configured).toBe(false);
    });

    it('should set loxone_connection_configured to false when loxone_password is missing', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        const values: Record<string, any> = {
          bridgeIp: '192.168.1.100',
          loxoneIp: '192.168.1.200',
          loxonePort: 5555,
          debug: false,
          transitionTime: 400,
          bidirectionalSync: false,
          loxoneUser: 'admin',
          loxonePassword: null,
          loxoneHttpPort: 8080
        };
        return values[key];
      });

      const response = await request(app)
        .get('/api/settings')
        .expect(200);

      expect(response.body.loxone_connection_configured).toBe(false);
    });

    it('should set loxone_connection_configured to false when loxone_http_port is missing', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        const values: Record<string, any> = {
          bridgeIp: '192.168.1.100',
          loxoneIp: '192.168.1.200',
          loxonePort: 5555,
          debug: false,
          transitionTime: 400,
          bidirectionalSync: false,
          loxoneUser: 'admin',
          loxonePassword: 'secret123',
          loxoneHttpPort: 0
        };
        return values[key];
      });

      const response = await request(app)
        .get('/api/settings')
        .expect(200);

      expect(response.body.loxone_connection_configured).toBe(false);
    });

    it('should set loxone_connection_configured to false when all credentials are missing', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        const values: Record<string, any> = {
          bridgeIp: '192.168.1.100',
          loxoneIp: '192.168.1.200',
          loxonePort: 5555,
          debug: false,
          transitionTime: 400,
          bidirectionalSync: false,
          loxoneUser: null,
          loxonePassword: null,
          loxoneHttpPort: 0
        };
        return values[key];
      });

      const response = await request(app)
        .get('/api/settings')
        .expect(200);

      expect(response.body.loxone_connection_configured).toBe(false);
    });
  });
});
