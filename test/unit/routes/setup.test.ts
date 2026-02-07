/**
 * Unit Tests for Setup Routes
 * Tests POST /api/setup/loxone endpoint in src/routes/setup.ts
 */

import express from 'express';
import request from 'supertest';
import createSetupRoutes from '../../../src/routes/setup';

jest.mock('axios');

function createTestApp() {
  const mockConfig = {
    update: jest.fn(),
    get: jest.fn().mockReturnValue(400),
    isReady: jest.fn().mockReturnValue(true),
    getAll: jest.fn(),
    getMapping: jest.fn().mockReturnValue([]),
  } as any;

  const mockEventStream = {
    start: jest.fn(),
    stop: jest.fn(),
  } as any;

  const app = express();
  app.use(express.json());
  app.use('/api/setup', createSetupRoutes(mockConfig, mockEventStream));

  return { app, mockConfig, mockEventStream };
}

describe('Setup Routes', () => {
  describe('POST /api/setup/loxone', () => {
    it('should save basic loxone config without credentials', async () => {
      const { app, mockConfig } = createTestApp();

      const res = await request(app)
        .post('/api/setup/loxone')
        .send({ loxoneIp: '192.168.1.200', loxonePort: 7000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockConfig.update).toHaveBeenCalledWith(
        expect.objectContaining({
          loxoneIp: '192.168.1.200',
          loxonePort: 7000,
        })
      );
      const updateArg = mockConfig.update.mock.calls[0][0];
      expect(updateArg).not.toHaveProperty('loxoneUser');
      expect(updateArg).not.toHaveProperty('loxonePassword');
    });

    it('should save loxone config with bidirectional credentials', async () => {
      const { app, mockConfig } = createTestApp();

      const res = await request(app)
        .post('/api/setup/loxone')
        .send({
          loxoneIp: '192.168.1.200',
          loxonePort: 7000,
          loxoneUser: 'admin',
          loxonePassword: 'secret',
          loxoneHttpPort: 80,
        });

      expect(res.status).toBe(200);
      expect(mockConfig.update).toHaveBeenCalledWith(
        expect.objectContaining({
          loxoneIp: '192.168.1.200',
          loxonePort: 7000,
          loxoneUser: 'admin',
          loxonePassword: 'secret',
          loxoneHttpPort: 80,
          bidirectionalSync: true,
        })
      );
    });

    it('should default loxoneHttpPort to 80 when not provided with credentials', async () => {
      const { app, mockConfig } = createTestApp();

      const res = await request(app)
        .post('/api/setup/loxone')
        .send({
          loxoneIp: '192.168.1.200',
          loxonePort: 7000,
          loxoneUser: 'admin',
          loxonePassword: 'secret',
        });

      expect(res.status).toBe(200);
      const updateArg = mockConfig.update.mock.calls[0][0];
      expect(updateArg.loxoneHttpPort).toBe(80);
      expect(updateArg.bidirectionalSync).toBe(true);
    });

    it('should start event stream after saving', async () => {
      const { app, mockEventStream } = createTestApp();

      await request(app)
        .post('/api/setup/loxone')
        .send({ loxoneIp: '192.168.1.200', loxonePort: 7000 });

      expect(mockEventStream.start).toHaveBeenCalled();
    });

    it('should not include bidirectionalSync when only user is provided without password', async () => {
      const { app, mockConfig } = createTestApp();

      const res = await request(app)
        .post('/api/setup/loxone')
        .send({
          loxoneIp: '192.168.1.200',
          loxonePort: 7000,
          loxoneUser: 'admin',
        });

      expect(res.status).toBe(200);
      const updateArg = mockConfig.update.mock.calls[0][0];
      expect(updateArg).not.toHaveProperty('loxoneUser');
      expect(updateArg).not.toHaveProperty('loxonePassword');
      expect(updateArg).not.toHaveProperty('bidirectionalSync');
    });

    it('should handle debug and transitionTime fields', async () => {
      const { app, mockConfig } = createTestApp();

      const res = await request(app)
        .post('/api/setup/loxone')
        .send({
          loxoneIp: '192.168.1.200',
          loxonePort: 7000,
          debug: true,
          transitionTime: 500,
        });

      expect(res.status).toBe(200);
      expect(mockConfig.update).toHaveBeenCalledWith(
        expect.objectContaining({
          debug: true,
          transitionTime: 500,
        })
      );
    });
  });
});
