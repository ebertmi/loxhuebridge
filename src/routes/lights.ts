/**
 * Lights Routes
 * Handles light control commands from Loxone via HTTP requests.
 * 
 * Currently supports:
 * - Individual light control
 * - Global "all" command to control all lights
 * 
 * Integrates with HueClient to send commands to Philips Hue lights.
 * Utilizes StatusManager to update local status cache. The local status cache
 * helps in reducing redundant API calls to Hue by keeping track of the last known
 * state of each light.
 * Supports bidirectional synchronization with Loxone if enabled. Bidirectional sync is using the Loxone websocket connection to listen for state changes
 * originating from Loxone and reflect them in Hue, while preventing loops.
 */

import express, { Router, Request, Response } from 'express';
import CONSTANTS from '../constants';
import { asyncHandler } from '../middleware/error-handler';
import { validateLightCommand } from '../middleware/validation';
import Config from '../config';
import Logger from '../utils/logger';
import StatusManager from '../services/status-manager';
import BidirectionalSyncManager from '../services/bidirectional-sync';
import { DetectedItemsStore, DeviceMapping } from '../types';
import { IHueClient } from '../types/services';

/**
 * Dependencies for lights routes
 */
interface LightsRouteDependencies {
  config: Config;
  hueClient: IHueClient;
  logger: Logger;
  statusManager: StatusManager;
  detectedItems: DetectedItemsStore;
  bidirectionalSync?: BidirectionalSyncManager;
}

/**
 * Initialize light control routes
 * @param dependencies - Service dependencies
 * @returns Express router
 */
function createLightsRoutes(dependencies: LightsRouteDependencies): Router {
  const { config, hueClient, logger, statusManager, detectedItems, bidirectionalSync } = dependencies;

  const router = express.Router();

  /**
   * Execute light control command
   * @param entry - Mapping entry
   * @param value - Control value
   * @param forcedTransition - Forced transition time
   */
  async function executeCommand(entry: DeviceMapping, value: string, forcedTransition: number | null = null): Promise<void> {
    const uuid = entry.hue_uuid;
    const resourceType = entry.hue_type === 'group' ? 'grouped_light' : 'light';

    // Mark change source as Loxone (for bidirectional sync loop prevention)
    if (bidirectionalSync && entry.bidirectional) {
      bidirectionalSync.markChangeSource(uuid, 'loxone');
    }

    // Build payload
    const payload = hueClient.buildLightPayload(value, uuid, forcedTransition);

    // Send to Hue
    await hueClient.updateLight(uuid, resourceType, payload, entry.loxone_name);

    // Update local status
    if (payload.on !== undefined) {
      statusManager.update(entry.loxone_name, 'on', payload.on.on ? 1 : 0, entry);
    }

    if (payload.dimming) {
      statusManager.update(entry.loxone_name, 'bri', payload.dimming.brightness, entry);
    }
  }

  /**
   * Control light
   * GET /:name/:value
   */
  router.get('/:name/:value', validateLightCommand, asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const name = req.params.name as string;
    const value = req.params.value as string;
    const search = name.toLowerCase();

    logger.debug(`Command: /${name}/${value}`, 'LIGHT');

    if (!config.isReady()) {
      res.status(503).send('Not configured');
      return;
    }

    const mapping = config.getMapping();
    const entry = mapping.find(m => m.loxone_name === search);

    // Check for global "all" command
    const isGlobalAll = (search === 'all' || search === 'alles');
    const isMappedAll = (entry && entry.hue_uuid === 'pseudo-all');

    if (isGlobalAll || isMappedAll) {
      // Execute command for all lights in sequence
      const targets = mapping.filter(e => e.hue_type === 'light' || e.hue_type === 'group');

      res.status(200).send(`Starting sequence for ${targets.length} devices`);

      // Execute asynchronously in background
      (async () => {
        logger.info(`Starting sequence for ${targets.length} devices...`, 'LIGHT');

        for (const target of targets) {
          try {
            // Forced transition 0 for instant response
            await executeCommand(target, value, 0);

            // Small delay between commands
            await new Promise(resolve =>
              setTimeout(resolve, CONSTANTS.RATE_LIMIT.SEQUENCE_DELAY_MS)
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Sequence error for ${target.loxone_name}: ${message}`, 'LIGHT');
          }
        }

        logger.success('Sequence completed', 'LIGHT');
      })();

      return;
    }

    // Check if device is mapped
    if (!entry) {
      // Add to detected items for mapping
      if (!detectedItems.items.find(d => d.name === search)) {
        detectedItems.items.push({
          type: 'command',
          name: name,
          id: 'cmd_' + name,
          timestamp: Date.now()
        });

        if (detectedItems.items.length > CONSTANTS.DETECTION.MAX_ITEMS) {
          detectedItems.items.shift();
        }
      }

      res.status(200).send('Recorded');
      return;
    }

    // Reject control of sensors and buttons
    if (entry.hue_type === 'sensor' || entry.hue_type === 'button') {
      res.status(400).send('Read-only device');
      return;
    }

    // Execute command
    await executeCommand(entry, value);
    res.status(200).send('OK');
  }));

  return router;
}

export default createLightsRoutes;
