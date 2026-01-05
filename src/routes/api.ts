/**
 * API Routes
 * Handles main API endpoints for configuration, mapping, and diagnostics
 */

import express, { Router, Request, Response } from 'express';
import os from 'os';
import { asyncHandler } from '../middleware/error-handler';
import { validateMapping } from '../middleware/validation';
import { generateOutputsXML, generateInputsXML, generateScenesXML } from '../utils/xml-generator';
import Config from '../config';
import HueClient from '../services/hue-client';
import LoxoneClient from '../services/loxone-client';
import Logger from '../utils/logger';
import StatusManager from '../services/status-manager';
import EventStream from '../services/event-stream';
import RateLimiter from '../services/rate-limiter';
import { DetectedItemsStore, DeviceMapping, LoxoneControlRaw, LoxoneSubControlRaw } from '../types';

/**
 * Dependencies for API routes
 */
interface ApiRouteDependencies {
  config: Config;
  hueClient: HueClient;
  loxoneClient: LoxoneClient;
  logger: Logger;
  statusManager: StatusManager;
  eventStream: EventStream;
  rateLimiter: RateLimiter;
  detectedItems: DetectedItemsStore;
  httpPort: number;
  version: string;
}

/**
 * Get server IP address for XML generation
 * @returns Server IP address
 */
function getServerIp(): string {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const networkInterface = interfaces[devName];
    if (networkInterface) {
      for (const alias of networkInterface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return '127.0.0.1';
}

/**
 * Initialize API routes
 * @param dependencies - Service dependencies
 * @returns Express router
 */
function createApiRoutes(dependencies: ApiRouteDependencies): Router {
  const {
    config,
    hueClient,
    loxoneClient,
    logger,
    statusManager,
    eventStream,
    rateLimiter,
    detectedItems,
    httpPort,
    version
  } = dependencies;

  const router = express.Router();

  /**
   * Get all available Hue targets
   * GET /api/targets
   */
  router.get('/targets', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    if (!config.isReady()) {
      res.status(503).json([]);
      return;
    }

    const targets = await hueClient.getTargets();
    res.json(targets);
  }));

  /**
   * Get all available scenes
   * GET /api/scenes
   */
  router.get('/scenes', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    if (!config.isReady()) {
      res.status(503).json([]);
      return;
    }

    const scenes = await hueClient.getScenes();
    res.json(scenes);
  }));

  /**
   * Get current mapping
   * GET /api/mapping
   */
  router.get('/mapping', (_req: Request, res: Response) => {
    res.json(config.getMapping());
  });

  /**
   * Update mapping
   * POST /api/mapping
   * Body: Array of mapping entries
   */
  router.post('/mapping', validateMapping, asyncHandler(async (req: Request, res: Response) => {
    const mapping: DeviceMapping[] = req.body;
    config.updateMapping(mapping);

    // Cleanup detected items
    const serviceToDeviceMap = hueClient.getServiceToDeviceMap();

    mapping.forEach(m => {
      const mapMeta = serviceToDeviceMap[m.hue_uuid];

      detectedItems.items = detectedItems.items.filter(d => {
        // Remove command if name matches
        if (d.type === 'command') {
          return d.name !== m.loxone_name;
        }

        // Remove device if UUID matches or device ID matches
        const detMeta = d.id ? serviceToDeviceMap[d.id] : null;
        if (mapMeta && detMeta && mapMeta.deviceId === detMeta.deviceId) {
          return false;
        }

        return d.id !== m.hue_uuid;
      });
    });

    // Cleanup stale status entries
    const validNames = mapping.map(m => m.loxone_name);
    statusManager.cleanup(validNames);

    res.json({ success: true });
  }));

  /**
   * Get detected unmapped items
   * GET /api/detected
   */
  router.get('/detected', (_req: Request, res: Response) => {
    res.json([...detectedItems.items].reverse());
  });

  /**
   * Get current status cache
   * GET /api/status
   */
  router.get('/status', (_req: Request, res: Response) => {
    res.json(statusManager.getAll());
  });

  /**
   * Get server logs
   * GET /api/logs
   */
  router.get('/logs', (_req: Request, res: Response) => {
    res.json(logger.getLogs());
  });

  /**
   * Get application settings
   * GET /api/settings
   */
  router.get('/settings', (_req: Request, res: Response) => {
    res.json({
      bridge_ip: config.get('bridgeIp'),
      loxone_ip: config.get('loxoneIp'),
      loxone_port: config.get('loxonePort'),
      http_port: httpPort,
      debug: config.get('debug'),
      key_configured: config.isReady(),
      transitionTime: config.get('transitionTime'),
      version: version
    });
  });

  /**
   * Update debug mode
   * POST /api/settings/debug
   * Body: { active: boolean }
   */
  router.post('/settings/debug', (req: Request, res: Response) => {
    const active = !!req.body.active;
    config.setDebugMode(active);
    res.json({ success: true });
  });

  /**
   * Get diagnostics information
   * GET /api/diagnostics
   */
  router.get('/diagnostics', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    if (!config.isReady()) {
      res.status(503).json({ error: 'Not configured' });
      return;
    }

    const diagnostics = await hueClient.getDiagnostics();
    res.json(diagnostics);
  }));

  /**
   * Get health status
   * GET /api/health
   */
  router.get('/health', (_req: Request, res: Response) => {
    const eventStreamStatus = eventStream.getStatus();
    const queueStats = rateLimiter.getStats();

    const health = {
      status: config.isReady() && eventStreamStatus.healthy ? 'healthy' : 'degraded',
      configured: config.isReady(),
      eventStream: eventStreamStatus,
      queues: queueStats,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  });

  /**
   * Download Loxone outputs XML (lights)
   * GET /api/download/outputs?names=light1,light2
   */
  router.get('/download/outputs', (req: Request, res: Response) => {
    const filterNames = req.query.names ? (req.query.names as string).split(',') : null;

    let lights = config.getMapping().filter(m =>
      m.hue_type === 'light' || m.hue_type === 'group'
    );

    if (filterNames) {
      lights = lights.filter(m => filterNames.includes(m.loxone_name));
    }

    const xml = generateOutputsXML(lights, getServerIp(), httpPort);

    res.set('Content-Type', 'text/xml');
    res.set('Content-Disposition', 'attachment; filename="lox_outputs.xml"');
    res.send(xml);
  });

  /**
   * Download Loxone inputs XML (sensors/buttons)
   * GET /api/download/inputs?names=sensor1,button1
   */
  router.get('/download/inputs', (req: Request, res: Response) => {
    const filterNames = req.query.names ? (req.query.names as string).split(',') : null;

    let sensors = config.getMapping().filter(m =>
      m.hue_type === 'sensor' || m.hue_type === 'button'
    );

    if (filterNames) {
      sensors = sensors.filter(m => filterNames.includes(m.loxone_name));
    }

    const xml = generateInputsXML(sensors, config.get('loxonePort'));

    res.set('Content-Type', 'text/xml');
    res.set('Content-Disposition', 'attachment; filename="lox_inputs.xml"');
    res.send(xml);
  });

  /**
   * Download scenes as Loxone VirtualOut XML
   * GET /api/download/scenes?uuids=uuid1,uuid2
   */
  router.get('/download/scenes', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!config.isReady()) {
      res.status(503).send('Not configured');
      return;
    }

    // Check if uuids parameter exists (even if empty)
    const filterUuids = 'uuids' in req.query ? (req.query.uuids as string).split(',').filter(u => u) : null;

    // Get all scenes from Hue Bridge
    let scenes = await hueClient.getScenes();

    // Filter by selected UUIDs if provided
    if (filterUuids) {
      scenes = scenes.filter(s => filterUuids.includes(s.uuid));
    }

    // Generate XML (SceneInfo is compatible with SceneForXML)
    const xml = generateScenesXML(scenes as any, getServerIp(), httpPort);

    // Send as downloadable file
    res.set('Content-Type', 'text/xml');
    res.set('Content-Disposition', 'attachment; filename="lox_scenes.xml"');
    res.send(xml);
  }));

  /**
   * Get Loxone light controls from structure file
   * GET /api/loxone/controls
   */
  router.get('/loxone/controls', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    // Access private property (TODO: add public getter to LoxoneClient)
    const structure = (loxoneClient as any).structure;

    if (!structure) {
      res.status(503).json({
        error: 'Loxone structure file not loaded',
        controls: []
      });
      return;
    }

    const controls: any[] = [];

    // Filter light-related controls
    const lightTypes = [
      'LightControllerV2',
      'Dimmer',
      'ColorPickerV2',
      'Switch',
      'IRoomControllerV2'
    ];

    for (const [uuid, controlRaw] of Object.entries(structure.controls || {})) {
      const control = controlRaw as LoxoneControlRaw;
      if (lightTypes.includes(control.type)) {
        // Get current state values
        const stateValues: Record<string, number | string> = {};
        if (control.states) {
          for (const [stateName, stateUuid] of Object.entries(control.states)) {
            const value = loxoneClient.getStateValue(stateUuid);
            if (value !== null) {
              stateValues[stateName] = value;
            }
          }
        }

        // Get room name from room UUID
        let roomName: string | null = null;
        if (control.room && structure.rooms && structure.rooms[control.room]) {
          roomName = structure.rooms[control.room].name;
        }

        // Get mood information for LightControllerV2
        let moodInfo: any = null;
        if (control.type === 'LightControllerV2' && control.states) {
          const activeMoodsState = control.states.activeMoods;
          const moodListState = control.states.moodList;
          const activeMoodsNumState = control.states.activeMoodsNum;

          const activeMoodsRaw = activeMoodsState ? loxoneClient.getStateValue(activeMoodsState) : null;
          const moodListRaw = moodListState ? loxoneClient.getStateValue(moodListState) : null;
          const activeMoodsNum = activeMoodsNumState ? loxoneClient.getStateValue(activeMoodsNumState) : 0;

          // Parse mood information
          let activeMoodNames: string[] = [];
          let moodList: any[] = [];
          let activeMoodIds: number[] = [];

          try {
            moodList = moodListRaw ? JSON.parse(String(moodListRaw)) : [];

            if (activeMoodsRaw && Number(activeMoodsNum) > 0) {
              activeMoodIds = JSON.parse(String(activeMoodsRaw)); // e.g., [778]

              activeMoodNames = activeMoodIds.map(id => {
                const mood = moodList.find(m => m.id === id);
                return mood ? mood.name : `ID ${id}`;
              });
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.warn(`Failed to parse mood info for ${control.name}: ${message}`, 'API');
          }

          moodInfo = {
            activeMoodNames: activeMoodNames,
            activeMoodsNum: activeMoodsNum,
            activeMoodIds: activeMoodIds,
            moodList: moodList
          };
        }

        const controlData: any = {
          uuid,
          name: control.name,
          type: control.type,
          room: roomName,
          states: control.states || {},
          stateValues: stateValues,
          details: control.details || {},
          moodInfo: moodInfo,
          subControls: []
        };

        // Process subControls if they exist
        if (control.subControls) {
          for (const [subUuid, subControlRaw] of Object.entries(control.subControls)) {
            const subControl = subControlRaw as LoxoneSubControlRaw;
            // Only include light-related subcontrols
            if (lightTypes.includes(subControl.type)) {
              // Get current state values for subcontrol
              const subStateValues: Record<string, number | string> = {};
              if (subControl.states) {
                for (const [stateName, stateUuid] of Object.entries(subControl.states)) {
                  const value = loxoneClient.getStateValue(stateUuid);
                  if (value !== null) {
                    subStateValues[stateName] = value;
                  }
                }
              }

              controlData.subControls.push({
                uuid: subUuid,
                name: subControl.name,
                type: subControl.type,
                states: subControl.states || {},
                stateValues: subStateValues,
                details: subControl.details || {}
              });
            }
          }
        }

        controls.push(controlData);
      }
    }

    res.json({
      projectName: structure.msInfo?.projectName || 'Unknown',
      controls
    });
  }));

  /**
   * Send command to Loxone control
   * POST /api/loxone/command
   * Body: { uuid, command }
   */
  router.post('/loxone/command', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { uuid, command } = req.body;

    if (!uuid || command === undefined) {
      res.status(400).json({
        error: 'Missing uuid or command'
      });
      return;
    }

    // Access private property (TODO: add public getter to LoxoneClient)
    if (!(loxoneClient as any).isConnected) {
      res.status(503).json({
        error: 'Loxone client not connected'
      });
      return;
    }

    try {
      await loxoneClient.sendCommand(uuid, command);
      logger.info(`Sent command to ${uuid}: ${command}`, 'LOXONE');

      res.json({
        success: true,
        uuid,
        command
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to send command to ${uuid}: ${message}`, 'LOXONE');
      res.status(500).json({
        error: message
      });
    }
  }));

  return router;
}

export default createApiRoutes;
