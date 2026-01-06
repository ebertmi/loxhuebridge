/**
 * Unit Tests for Scene Routes
 * Tests HTTP scene control routes in src/routes/scenes.ts
 */

import express, { Express } from 'express';
import request from 'supertest';
import createSceneRoutes from '../../../src/routes/scenes';
import Config from '../../../src/config';
import HueClient from '../../../src/services/hue-client';
import Logger from '../../../src/utils/logger';

// Mock modules
jest.mock('../../../src/config');
jest.mock('../../../src/services/hue-client');
jest.mock('../../../src/utils/logger');

describe('Scene Routes', () => {
  let app: Express;
  let mockConfig: jest.Mocked<Config>;
  let mockHueClient: jest.Mocked<HueClient>;
  let mockLogger: jest.Mocked<Logger>;

  const validSceneId = '12345678-1234-1234-1234-123456789abc';
  const anotherSceneId = 'abcdef01-2345-6789-abcd-ef0123456789';

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock config
    mockConfig = {
      isReady: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Config>;

    // Setup mock logger
    mockLogger = {
      debug: jest.fn(),
      success: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<Logger>;

    // Setup mock hue client
    mockHueClient = {
      activateScene: jest.fn().mockResolvedValue(undefined),
      deactivateScene: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<HueClient>;

    // Create Express app with routes
    app = express();
    app.use(express.json());
    const router = createSceneRoutes({
      config: mockConfig,
      hueClient: mockHueClient,
      logger: mockLogger
    });
    app.use('/', router);
  });

  describe('GET /scene/:id/on - Scene Activation', () => {
    it('should activate a scene with valid UUID', async () => {
      const response = await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(200);

      expect(response.text).toBe(`Scene ${validSceneId} activated`);
      expect(mockHueClient.activateScene).toHaveBeenCalledWith(validSceneId);
      expect(mockHueClient.activateScene).toHaveBeenCalledTimes(1);
    });

    it('should log scene activation', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(200);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Scene command: /scene/${validSceneId}/on`,
        'SCENE'
      );
      expect(mockLogger.success).toHaveBeenCalledWith(
        `Scene ${validSceneId} activated`,
        'SCENE'
      );
    });

    it('should handle uppercase "ON"', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/ON`)
        .expect(200);

      expect(mockHueClient.activateScene).toHaveBeenCalledWith(validSceneId);
    });

    it('should handle mixed case "On"', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/On`)
        .expect(200);

      expect(mockHueClient.activateScene).toHaveBeenCalledWith(validSceneId);
    });

    it('should activate different scenes', async () => {
      await request(app).get(`/scene/${validSceneId}/on`).expect(200);
      await request(app).get(`/scene/${anotherSceneId}/on`).expect(200);

      expect(mockHueClient.activateScene).toHaveBeenCalledWith(validSceneId);
      expect(mockHueClient.activateScene).toHaveBeenCalledWith(anotherSceneId);
      expect(mockHueClient.activateScene).toHaveBeenCalledTimes(2);
    });
  });

  describe('GET /scene/:id/off - Scene Deactivation', () => {
    it('should deactivate a scene with valid UUID', async () => {
      const response = await request(app)
        .get(`/scene/${validSceneId}/off`)
        .expect(200);

      expect(response.text).toBe(`Scene ${validSceneId} deactivated (lights turned off)`);
      expect(mockHueClient.deactivateScene).toHaveBeenCalledWith(validSceneId);
      expect(mockHueClient.deactivateScene).toHaveBeenCalledTimes(1);
    });

    it('should log scene deactivation', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/off`)
        .expect(200);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Scene command: /scene/${validSceneId}/off`,
        'SCENE'
      );
      expect(mockLogger.success).toHaveBeenCalledWith(
        `Scene ${validSceneId} deactivated`,
        'SCENE'
      );
    });

    it('should handle uppercase "OFF"', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/OFF`)
        .expect(200);

      expect(mockHueClient.deactivateScene).toHaveBeenCalledWith(validSceneId);
    });

    it('should handle mixed case "Off"', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/Off`)
        .expect(200);

      expect(mockHueClient.deactivateScene).toHaveBeenCalledWith(validSceneId);
    });
  });

  describe('UUID Validation', () => {
    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .get('/scene/invalid-uuid/on')
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Invalid scene ID',
        details: 'Scene ID must be a valid UUID',
        id: 'invalid-uuid'
      });
      expect(mockHueClient.activateScene).not.toHaveBeenCalled();
    });

    it('should reject UUID with wrong segment lengths', async () => {
      const invalidUuid = '123-45-67-89-abc';

      const response = await request(app)
        .get(`/scene/${invalidUuid}/on`)
        .expect(400);

      expect(response.body.error).toBe('Invalid scene ID');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Invalid scene ID format: ${invalidUuid}`,
        'SCENE'
      );
    });

    it('should reject UUID with invalid characters', async () => {
      const invalidUuid = '12345678-1234-1234-1234-12345678ghij';

      await request(app)
        .get(`/scene/${invalidUuid}/on`)
        .expect(400);

      expect(mockHueClient.activateScene).not.toHaveBeenCalled();
    });

    it('should reject UUID without hyphens', async () => {
      const invalidUuid = '12345678123412341234123456789abc';

      await request(app)
        .get(`/scene/${invalidUuid}/on`)
        .expect(400);
    });

    it('should reject empty scene ID', async () => {
      await request(app)
        .get('/scene//on')
        .expect(404); // Express routing won't match
    });

    it('should accept uppercase UUID', async () => {
      const upperUuid = '12345678-1234-1234-1234-123456789ABC';

      await request(app)
        .get(`/scene/${upperUuid}/on`)
        .expect(200);

      expect(mockHueClient.activateScene).toHaveBeenCalledWith(upperUuid);
    });

    it('should accept mixed case UUID', async () => {
      const mixedUuid = '12345678-abcd-1234-efab-123456789abc';

      await request(app)
        .get(`/scene/${mixedUuid}/on`)
        .expect(200);

      expect(mockHueClient.activateScene).toHaveBeenCalledWith(mixedUuid);
    });
  });

  describe('Value Validation', () => {
    it('should reject invalid value', async () => {
      const response = await request(app)
        .get(`/scene/${validSceneId}/toggle`)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Invalid value',
        details: 'Value must be "on" or "off"',
        value: 'toggle'
      });
      expect(mockHueClient.activateScene).not.toHaveBeenCalled();
      expect(mockHueClient.deactivateScene).not.toHaveBeenCalled();
    });

    it('should reject numeric value', async () => {
      const response = await request(app)
        .get(`/scene/${validSceneId}/1`)
        .expect(400);

      expect(response.body.error).toBe('Invalid value');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid scene command value: 1',
        'SCENE'
      );
    });

    it('should reject empty value', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/`)
        .expect(404); // Express routing won't match
    });

    it('should reject arbitrary strings', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/activate`)
        .expect(400);

      await request(app)
        .get(`/scene/${validSceneId}/true`)
        .expect(400);

      expect(mockHueClient.activateScene).not.toHaveBeenCalled();
    });
  });

  describe('Configuration State', () => {
    it('should return 503 when not configured', async () => {
      mockConfig.isReady.mockReturnValue(false);

      const response = await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(503);

      expect(response.text).toBe('Not configured');
      expect(mockHueClient.activateScene).not.toHaveBeenCalled();
    });

    it('should check configuration before validation', async () => {
      mockConfig.isReady.mockReturnValue(false);

      // Even with invalid UUID, should return 503 first
      await request(app)
        .get('/scene/invalid/on')
        .expect(503);
    });
  });

  describe('Error Handling', () => {
    it('should handle scene activation errors', async () => {
      mockHueClient.activateScene.mockRejectedValueOnce(
        new Error('Connection timeout')
      );

      const response = await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(500);

      expect(response.body).toMatchObject({
        error: 'Scene control failed',
        details: 'Connection timeout',
        id: validSceneId
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Scene control error for ${validSceneId}: Connection timeout`,
        'SCENE'
      );
    });

    it('should handle scene deactivation errors', async () => {
      mockHueClient.deactivateScene.mockRejectedValueOnce(
        new Error('API error')
      );

      const response = await request(app)
        .get(`/scene/${validSceneId}/off`)
        .expect(500);

      expect(response.body).toMatchObject({
        error: 'Scene control failed',
        details: 'API error',
        id: validSceneId
      });
    });

    it('should handle 404 scene not found', async () => {
      const notFoundError: any = new Error('Scene not found');
      notFoundError.response = { status: 404 };

      mockHueClient.activateScene.mockRejectedValueOnce(notFoundError);

      const response = await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Scene not found',
        details: `Scene with ID ${validSceneId} does not exist`,
        id: validSceneId
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockHueClient.activateScene.mockRejectedValueOnce('String error');

      const response = await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(500);

      expect(response.body.error).toBe('Scene control failed');
    });

    it('should log errors appropriately', async () => {
      mockHueClient.activateScene.mockRejectedValueOnce(
        new Error('Test error')
      );

      await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(500);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Scene control error'),
        'SCENE'
      );
    });

    it('should handle errors with response status codes', async () => {
      const errorWithStatus: any = new Error('Rate limited');
      errorWithStatus.response = { status: 429 };

      mockHueClient.activateScene.mockRejectedValueOnce(errorWithStatus);

      await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(500);

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('should complete full scene activation flow', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(200);

      // Verify full flow
      expect(mockLogger.debug).toHaveBeenCalled();
      expect(mockHueClient.activateScene).toHaveBeenCalledWith(validSceneId);
      expect(mockLogger.success).toHaveBeenCalled();
    });

    it('should complete full scene deactivation flow', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/off`)
        .expect(200);

      // Verify full flow
      expect(mockLogger.debug).toHaveBeenCalled();
      expect(mockHueClient.deactivateScene).toHaveBeenCalledWith(validSceneId);
      expect(mockLogger.success).toHaveBeenCalled();
    });

    it('should handle rapid scene switches', async () => {
      const promises = [
        request(app).get(`/scene/${validSceneId}/on`),
        request(app).get(`/scene/${validSceneId}/off`),
        request(app).get(`/scene/${validSceneId}/on`)
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      expect(mockHueClient.activateScene).toHaveBeenCalledTimes(2);
      expect(mockHueClient.deactivateScene).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple scenes simultaneously', async () => {
      const scene1 = '11111111-1111-1111-1111-111111111111';
      const scene2 = '22222222-2222-2222-2222-222222222222';
      const scene3 = '33333333-3333-3333-3333-333333333333';

      const promises = [
        request(app).get(`/scene/${scene1}/on`),
        request(app).get(`/scene/${scene2}/on`),
        request(app).get(`/scene/${scene3}/on`)
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      expect(mockHueClient.activateScene).toHaveBeenCalledTimes(3);
      expect(mockHueClient.activateScene).toHaveBeenCalledWith(scene1);
      expect(mockHueClient.activateScene).toHaveBeenCalledWith(scene2);
      expect(mockHueClient.activateScene).toHaveBeenCalledWith(scene3);
    });

    it('should maintain state across multiple requests', async () => {
      await request(app).get(`/scene/${validSceneId}/on`).expect(200);
      await request(app).get(`/scene/${validSceneId}/off`).expect(200);
      await request(app).get(`/scene/${validSceneId}/on`).expect(200);

      expect(mockHueClient.activateScene).toHaveBeenCalledTimes(2);
      expect(mockHueClient.deactivateScene).toHaveBeenCalledTimes(1);
    });
  });

  describe('Response Formats', () => {
    it('should return text response for successful activation', async () => {
      const response = await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(200);

      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('activated');
    });

    it('should return text response for successful deactivation', async () => {
      const response = await request(app)
        .get(`/scene/${validSceneId}/off`)
        .expect(200);

      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('deactivated');
    });

    it('should return JSON for validation errors', async () => {
      const response = await request(app)
        .get('/scene/invalid/on')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
      expect(response.body).toHaveProperty('id');
    });

    it('should return JSON for not found errors', async () => {
      const notFoundError: any = new Error('Not found');
      notFoundError.response = { status: 404 };
      mockHueClient.activateScene.mockRejectedValueOnce(notFoundError);

      const response = await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
      expect(response.body).toHaveProperty('id');
    });

    it('should return JSON for server errors', async () => {
      mockHueClient.activateScene.mockRejectedValueOnce(new Error('Error'));

      const response = await request(app)
        .get(`/scene/${validSceneId}/on`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Edge Cases', () => {
    it('should handle scene ID with all zeros', async () => {
      const zeroUuid = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .get(`/scene/${zeroUuid}/on`)
        .expect(200);

      expect(mockHueClient.activateScene).toHaveBeenCalledWith(zeroUuid);
    });

    it('should handle scene ID with all fs', async () => {
      const maxUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

      await request(app)
        .get(`/scene/${maxUuid}/on`)
        .expect(200);

      expect(mockHueClient.activateScene).toHaveBeenCalledWith(maxUuid);
    });

    it('should handle very long invalid IDs', async () => {
      const longId = 'a'.repeat(100);

      await request(app)
        .get(`/scene/${longId}/on`)
        .expect(400);
    });

    it('should handle special characters in value', async () => {
      await request(app)
        .get(`/scene/${validSceneId}/@#$%`)
        .expect(400);
    });
  });

  describe('Logging', () => {
    it('should log debug message for all requests', async () => {
      await request(app).get(`/scene/${validSceneId}/on`).expect(200);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Scene command'),
        'SCENE'
      );
    });

    it('should log warnings for validation failures', async () => {
      await request(app).get('/scene/invalid/on').expect(400);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid scene ID format'),
        'SCENE'
      );
    });

    it('should log warnings for invalid values', async () => {
      await request(app).get(`/scene/${validSceneId}/invalid`).expect(400);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid scene command value'),
        'SCENE'
      );
    });

    it('should log success messages', async () => {
      await request(app).get(`/scene/${validSceneId}/on`).expect(200);

      expect(mockLogger.success).toHaveBeenCalledWith(
        expect.stringContaining('activated'),
        'SCENE'
      );
    });

    it('should log errors with scene ID', async () => {
      mockHueClient.activateScene.mockRejectedValueOnce(new Error('Test'));

      await request(app).get(`/scene/${validSceneId}/on`).expect(500);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(validSceneId),
        'SCENE'
      );
    });
  });
});
