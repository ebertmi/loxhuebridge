/**
 * Unit Tests for Lights Routes
 * Tests HTTP light control routes in src/routes/lights.ts
 */

import express, { Express } from 'express';
import request from 'supertest';
import createLightsRoutes from '../../../src/routes/lights';
import Config from '../../../src/config';
import HueClient from '../../../src/services/hue-client';
import Logger from '../../../src/utils/logger';
import StatusManager from '../../../src/services/status-manager';
import BidirectionalSyncManager from '../../../src/services/bidirectional-sync';
import { DetectedItemsStore, DeviceMapping } from '../../../src/types';

// Mock modules
jest.mock('../../../src/config');
jest.mock('../../../src/services/hue-client');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/services/status-manager');
jest.mock('../../../src/services/bidirectional-sync');

describe('Lights Routes', () => {
  let app: Express;
  let mockConfig: jest.Mocked<Config>;
  let mockHueClient: jest.Mocked<HueClient>;
  let mockLogger: jest.Mocked<Logger>;
  let mockStatusManager: jest.Mocked<StatusManager>;
  let mockBidirectionalSync: jest.Mocked<BidirectionalSyncManager>;
  let detectedItems: DetectedItemsStore;

  const testMapping: DeviceMapping[] = [
    {
      loxone_name: 'livingroom',
      hue_uuid: 'light-123',
      hue_name: 'Living Room Light',
      hue_type: 'light',
      bidirectional: false
    },
    {
      loxone_name: 'kitchen',
      hue_uuid: 'light-456',
      hue_name: 'Kitchen Light',
      hue_type: 'light',
      bidirectional: true
    },
    {
      loxone_name: 'bedroom_group',
      hue_uuid: 'group-789',
      hue_name: 'Bedroom Group',
      hue_type: 'group',
      bidirectional: false
    },
    {
      loxone_name: 'sensor1',
      hue_uuid: 'sensor-001',
      hue_name: 'Motion Sensor',
      hue_type: 'sensor',
      bidirectional: false
    },
    {
      loxone_name: 'button1',
      hue_uuid: 'button-001',
      hue_name: 'Dimmer Switch',
      hue_type: 'button',
      bidirectional: false
    }
  ];

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock config
    mockConfig = {
      isReady: jest.fn().mockReturnValue(true),
      getMapping: jest.fn().mockReturnValue([...testMapping]),
      get: jest.fn(),
      update: jest.fn(),
      updateMapping: jest.fn()
    } as unknown as jest.Mocked<Config>;

    // Setup mock logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<Logger>;

    // Setup mock hue client
    mockHueClient = {
      buildLightPayload: jest.fn().mockReturnValue({
        on: { on: true },
        dimming: { brightness: 50 }
      }),
      updateLight: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<HueClient>;

    // Setup mock status manager
    mockStatusManager = {
      update: jest.fn()
    } as unknown as jest.Mocked<StatusManager>;

    // Setup mock bidirectional sync
    mockBidirectionalSync = {
      markChangeSource: jest.fn()
    } as unknown as jest.Mocked<BidirectionalSyncManager>;

    // Setup detected items store
    detectedItems = { items: [] };

    // Create Express app with routes
    app = express();
    app.use(express.json());
    const router = createLightsRoutes({
      config: mockConfig,
      hueClient: mockHueClient,
      logger: mockLogger,
      statusManager: mockStatusManager,
      detectedItems,
      bidirectionalSync: mockBidirectionalSync
    });
    app.use('/', router);
  });

  describe('GET /:name/:value - Individual Light Control', () => {
    it('should control a mapped light', async () => {
      const response = await request(app)
        .get('/livingroom/50')
        .expect(200);

      expect(response.text).toBe('OK');
      expect(mockHueClient.buildLightPayload).toHaveBeenCalledWith('50', 'light-123', null);
      expect(mockHueClient.updateLight).toHaveBeenCalledWith(
        'light-123',
        'light',
        expect.any(Object),
        'livingroom'
      );
      expect(mockStatusManager.update).toHaveBeenCalled();
    });

    it('should control a mapped group as grouped_light', async () => {
      await request(app)
        .get('/bedroom_group/75')
        .expect(200);

      expect(mockHueClient.updateLight).toHaveBeenCalledWith(
        'group-789',
        'grouped_light',
        expect.any(Object),
        'bedroom_group'
      );
    });

    it('should handle case-insensitive light names', async () => {
      await request(app)
        .get('/LivingRoom/50')
        .expect(200);

      expect(mockHueClient.updateLight).toHaveBeenCalledWith(
        'light-123',
        'light',
        expect.any(Object),
        'livingroom'
      );
    });

    it('should mark change source for bidirectional sync', async () => {
      await request(app)
        .get('/kitchen/60')
        .expect(200);

      expect(mockBidirectionalSync.markChangeSource).toHaveBeenCalledWith('light-456', 'loxone');
    });

    it('should not mark change source for non-bidirectional lights', async () => {
      await request(app)
        .get('/livingroom/50')
        .expect(200);

      expect(mockBidirectionalSync.markChangeSource).not.toHaveBeenCalled();
    });

    it('should update status manager with on state', async () => {
      mockHueClient.buildLightPayload.mockReturnValue({
        on: { on: true },
        dimming: { brightness: 50 }
      });

      await request(app)
        .get('/livingroom/50')
        .expect(200);

      expect(mockStatusManager.update).toHaveBeenCalledWith(
        'livingroom',
        'on',
        1,
        expect.any(Object)
      );
    });

    it('should update status manager with brightness', async () => {
      mockHueClient.buildLightPayload.mockReturnValue({
        on: { on: true },
        dimming: { brightness: 75 }
      });

      await request(app)
        .get('/livingroom/75')
        .expect(200);

      expect(mockStatusManager.update).toHaveBeenCalledWith(
        'livingroom',
        'bri',
        75,
        expect.any(Object)
      );
    });

    it('should return 503 when not configured', async () => {
      mockConfig.isReady.mockReturnValue(false);

      const response = await request(app)
        .get('/livingroom/50')
        .expect(503);

      expect(response.text).toBe('Not configured');
      expect(mockHueClient.updateLight).not.toHaveBeenCalled();
    });

    it('should reject control of sensors', async () => {
      const response = await request(app)
        .get('/sensor1/100')
        .expect(400);

      expect(response.text).toBe('Read-only device');
      expect(mockHueClient.updateLight).not.toHaveBeenCalled();
    });

    it('should reject control of buttons', async () => {
      const response = await request(app)
        .get('/button1/1')
        .expect(400);

      expect(response.text).toBe('Read-only device');
      expect(mockHueClient.updateLight).not.toHaveBeenCalled();
    });

    it('should record unmapped device', async () => {
      const response = await request(app)
        .get('/unmapped_light/50')
        .expect(200);

      expect(response.text).toBe('Recorded');
      expect(detectedItems.items).toHaveLength(1);
      expect(detectedItems.items[0]).toMatchObject({
        type: 'command',
        name: 'unmapped_light',
        id: 'cmd_unmapped_light'
      });
      expect(mockHueClient.updateLight).not.toHaveBeenCalled();
    });

    it('should not duplicate detected items', async () => {
      await request(app).get('/unmapped/50').expect(200);
      await request(app).get('/unmapped/75').expect(200);

      expect(detectedItems.items).toHaveLength(1);
    });

    it('should limit detected items to max', async () => {
      // Add items up to max
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(request(app).get(`/unmapped${i}/50`));
      }
      await Promise.all(promises);

      expect(detectedItems.items.length).toBeLessThanOrEqual(100);
      expect(detectedItems.items.length).toBeGreaterThan(0);
    });
  });

  describe('GET /all/:value - Global Control', () => {
    it('should control all lights with "all" command', async () => {
      const response = await request(app)
        .get('/all/100')
        .expect(200);

      expect(response.text).toContain('Starting sequence for');
      expect(response.text).toContain('3 devices'); // 2 lights + 1 group

      // Wait for async execution
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(mockHueClient.updateLight).toHaveBeenCalledTimes(3);
    });

    it('should control all lights with "alles" command (German)', async () => {
      const response = await request(app)
        .get('/alles/0')
        .expect(200);

      expect(response.text).toContain('Starting sequence for');
      expect(response.text).toContain('3 devices');
    });

    it('should handle "all" command case-insensitively', async () => {
      await request(app)
        .get('/ALL/50')
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockHueClient.updateLight).toHaveBeenCalled();
    });

    it('should use forced transition time of 0 for all command', async () => {
      await request(app)
        .get('/all/100')
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockHueClient.buildLightPayload).toHaveBeenCalledWith(
        '100',
        expect.any(String),
        0
      );
    });

    it('should log sequence start and completion', async () => {
      await request(app)
        .get('/all/50')
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 500));

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Starting sequence'),
        'LIGHT'
      );
      expect(mockLogger.success).toHaveBeenCalledWith('Sequence completed', 'LIGHT');
    });

    it('should handle errors during sequence gracefully', async () => {
      mockHueClient.updateLight.mockRejectedValueOnce(new Error('Connection failed'));

      await request(app)
        .get('/all/100')
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 500));

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Sequence error'),
        'LIGHT'
      );
      expect(mockLogger.success).toHaveBeenCalledWith('Sequence completed', 'LIGHT');
    });

    it('should process lights sequentially with delays', async () => {
      const callTimes: number[] = [];
      mockHueClient.updateLight.mockImplementation(async () => {
        callTimes.push(Date.now());
      });

      await request(app)
        .get('/all/100')
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 500));

      expect(callTimes.length).toBe(3);
      // Check that there's a delay between calls
      if (callTimes.length >= 2) {
        const delay1 = callTimes[1] - callTimes[0];
        expect(delay1).toBeGreaterThan(10);
      }
    });

    it('should respond immediately without waiting for sequence', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/all/100')
        .expect(200);

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(100); // Should respond quickly
    });
  });

  describe('Pseudo-all Mapping', () => {
    it('should handle mapped "all" device', async () => {
      mockConfig.getMapping.mockReturnValue([
        ...testMapping,
        {
          loxone_name: 'myall',
          hue_uuid: 'pseudo-all',
          hue_name: 'All Lights',
          hue_type: 'light',
          bidirectional: false
        }
      ]);

      const response = await request(app)
        .get('/myall/100')
        .expect(200);

      expect(response.text).toContain('Starting sequence');

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockHueClient.updateLight).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle hue client errors', async () => {
      mockHueClient.updateLight.mockRejectedValueOnce(new Error('Hue API error'));

      await request(app)
        .get('/livingroom/50')
        .expect(500);
    });

    it('should handle payload building errors', async () => {
      mockHueClient.buildLightPayload.mockImplementation(() => {
        throw new Error('Invalid payload');
      });

      await request(app)
        .get('/livingroom/50')
        .expect(500);
    });

    it('should log debug messages', async () => {
      await request(app)
        .get('/livingroom/50')
        .expect(200);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Command: /livingroom/50',
        'LIGHT'
      );
    });
  });

  describe('Status Manager Updates', () => {
    it('should update status when on state is present', async () => {
      mockHueClient.buildLightPayload.mockReturnValue({
        on: { on: true }
      });

      await request(app)
        .get('/livingroom/100')
        .expect(200);

      expect(mockStatusManager.update).toHaveBeenCalledWith(
        'livingroom',
        'on',
        1,
        expect.any(Object)
      );
    });

    it('should update status when off', async () => {
      mockHueClient.buildLightPayload.mockReturnValue({
        on: { on: false }
      });

      await request(app)
        .get('/livingroom/0')
        .expect(200);

      expect(mockStatusManager.update).toHaveBeenCalledWith(
        'livingroom',
        'on',
        0,
        expect.any(Object)
      );
    });

    it('should not update status when on state is undefined', async () => {
      mockHueClient.buildLightPayload.mockReturnValue({
        dimming: { brightness: 50 }
      });

      await request(app)
        .get('/livingroom/50')
        .expect(200);

      expect(mockStatusManager.update).toHaveBeenCalledTimes(1); // Only brightness
      expect(mockStatusManager.update).not.toHaveBeenCalledWith(
        expect.anything(),
        'on',
        expect.anything(),
        expect.anything()
      );
    });

    it('should update both on and brightness states', async () => {
      mockHueClient.buildLightPayload.mockReturnValue({
        on: { on: true },
        dimming: { brightness: 80 }
      });

      await request(app)
        .get('/livingroom/80')
        .expect(200);

      expect(mockStatusManager.update).toHaveBeenCalledTimes(2);
      expect(mockStatusManager.update).toHaveBeenCalledWith(
        'livingroom',
        'on',
        1,
        expect.any(Object)
      );
      expect(mockStatusManager.update).toHaveBeenCalledWith(
        'livingroom',
        'bri',
        80,
        expect.any(Object)
      );
    });
  });

  describe('Value Parsing', () => {
    it('should handle numeric values', async () => {
      await request(app).get('/livingroom/0').expect(200);
      await request(app).get('/livingroom/50').expect(200);
      await request(app).get('/livingroom/100').expect(200);

      expect(mockHueClient.buildLightPayload).toHaveBeenCalledTimes(3);
    });

    it('should handle special Loxone values', async () => {
      await request(app).get('/livingroom/201002700').expect(200);

      expect(mockHueClient.buildLightPayload).toHaveBeenCalledWith(
        '201002700',
        'light-123',
        null
      );
    });

    it('should pass value as string to buildLightPayload', async () => {
      await request(app).get('/livingroom/75').expect(200);

      expect(mockHueClient.buildLightPayload).toHaveBeenCalledWith(
        '75',
        'light-123',
        null
      );
    });
  });

  describe('Route Dependencies', () => {
    it('should work without bidirectional sync', async () => {
      const appNoBidir = express();
      const routerNoBidir = createLightsRoutes({
        config: mockConfig,
        hueClient: mockHueClient,
        logger: mockLogger,
        statusManager: mockStatusManager,
        detectedItems
        // No bidirectional sync
      });
      appNoBidir.use('/', routerNoBidir);

      await request(appNoBidir)
        .get('/livingroom/50')
        .expect(200);

      expect(mockHueClient.updateLight).toHaveBeenCalled();
    });

    it('should handle empty mapping', async () => {
      mockConfig.getMapping.mockReturnValue([]);

      await request(app)
        .get('/anylight/50')
        .expect(200);

      expect(detectedItems.items).toHaveLength(1);
    });
  });

  describe('Integration Scenarios', () => {
    it('should complete full light control flow', async () => {
      mockHueClient.buildLightPayload.mockReturnValue({
        on: { on: true },
        dimming: { brightness: 75 },
        color: { xy: { x: 0.3, y: 0.4 } }
      });

      await request(app)
        .get('/kitchen/75')
        .expect(200);

      // Verify full flow
      expect(mockBidirectionalSync.markChangeSource).toHaveBeenCalled();
      expect(mockHueClient.buildLightPayload).toHaveBeenCalled();
      expect(mockHueClient.updateLight).toHaveBeenCalled();
      expect(mockStatusManager.update).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid sequential requests', async () => {
      const promises = [
        request(app).get('/livingroom/25'),
        request(app).get('/livingroom/50'),
        request(app).get('/livingroom/75')
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      expect(mockHueClient.updateLight).toHaveBeenCalledTimes(3);
    });
  });
});
