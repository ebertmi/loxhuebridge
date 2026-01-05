/**
 * Scene Routes
 * Handles scene control commands from Loxone
 */

import express, { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import Config from '../config';
import HueClient from '../services/hue-client';
import Logger from '../utils/logger';

/**
 * Dependencies for scene routes
 */
interface SceneRouteDependencies {
  config: Config;
  hueClient: HueClient;
  logger: Logger;
}

/**
 * Initialize scene control routes
 * @param dependencies - Service dependencies
 * @returns Express router
 */
function createSceneRoutes(dependencies: SceneRouteDependencies): Router {
  const { config, hueClient, logger } = dependencies;

  const router = express.Router();

  /**
   * Control scene
   * GET /scene/:id/:value
   *
   * @param id - Scene UUID
   * @param value - 'on' to activate, 'off' to deactivate (turn off lights)
   */
  router.get('/scene/:id/:value', asyncHandler(async (req: Request, res: Response) => {
    const { id, value } = req.params;
    const normalizedValue = value.toLowerCase();

    logger.debug(`Scene command: /scene/${id}/${value}`, 'SCENE');

    if (!config.isReady()) {
      return res.status(503).send('Not configured');
    }

    // Validate value parameter
    if (normalizedValue !== 'on' && normalizedValue !== 'off') {
      logger.warn(`Invalid scene command value: ${value}`, 'SCENE');
      return res.status(400).json({
        error: 'Invalid value',
        details: 'Value must be "on" or "off"',
        value: value
      });
    }

    // Validate scene ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      logger.warn(`Invalid scene ID format: ${id}`, 'SCENE');
      return res.status(400).json({
        error: 'Invalid scene ID',
        details: 'Scene ID must be a valid UUID',
        id: id
      });
    }

    try {
      if (normalizedValue === 'on') {
        // Activate the scene
        await hueClient.activateScene(id);
        logger.success(`Scene ${id} activated`, 'SCENE');
        return res.status(200).send(`Scene ${id} activated`);
      } else {
        // Deactivate the scene (turn off all lights)
        await hueClient.deactivateScene(id);
        logger.success(`Scene ${id} deactivated`, 'SCENE');
        return res.status(200).send(`Scene ${id} deactivated (lights turned off)`);
      }

    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Scene control error for ${id}: ${message}`, 'SCENE');

      // Check if scene doesn't exist
      if (error.response && error.response.status === 404) {
        return res.status(404).json({
          error: 'Scene not found',
          details: `Scene with ID ${id} does not exist`,
          id: id
        });
      }

      return res.status(500).json({
        error: 'Scene control failed',
        details: message,
        id: id
      });
    }
  }));

  return router;
}

export default createSceneRoutes;
