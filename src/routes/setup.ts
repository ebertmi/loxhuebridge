/**
 * Setup Routes
 * Handles initial bridge setup and configuration
 */

import express, { Router, Request, Response } from 'express';
import axios from 'axios';
import https from 'https';
import { asyncHandler } from '../middleware/error-handler';
import { validateBridgeRegistration, validateLoxoneConfig } from '../middleware/validation';
import Config from '../config';
import EventStream from '../services/event-stream';

// HTTPS agent for Hue Bridge discovery and registration
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Bridge discovery response
 */
interface BridgeDiscoveryItem {
  id: string;
  internalipaddress: string;
}

/**
 * Hue Bridge registration response
 */
interface HueRegistrationResponse {
  success?: {
    username: string;
  };
  error?: {
    type: number;
    address: string;
    description: string;
  };
}

/**
 * Initialize setup routes
 */
function createSetupRoutes(config: Config, eventStream: EventStream): Router {
  const router = express.Router();

  /**
   * Discover Hue Bridge on local network
   * GET /api/setup/discover
   */
  router.get('/discover', asyncHandler(async (_req: Request, res: Response) => {
    try {
      const response = await axios.get<BridgeDiscoveryItem[]>('https://discovery.meethue.com/');
      res.json(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        error: 'Failed to discover Hue Bridge',
        details: message
      });
    }
  }));

  /**
   * Register with Hue Bridge
   * POST /api/setup/register
   * Body: { ip: "192.168.x.x" }
   */
  router.post('/register', validateBridgeRegistration, asyncHandler(async (req: Request, res: Response) => {
    const { ip } = req.body;

    try {
      const response = await axios.post<HueRegistrationResponse[]>(
        `https://${ip}/api`,
        { devicetype: 'loxHueBridge' },
        { httpsAgent }
      );

      // Check if registration was successful
      if (response.data[0].success) {
        config.update({
          bridgeIp: ip,
          appKey: response.data[0].success.username
        });

        res.json({ success: true });
      } else {
        // Return error from bridge
        const error = response.data[0].error;
        res.json({
          success: false,
          error: error?.description || 'Registration failed'
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: message
      });
    }
  }));

  /**
   * Configure Loxone settings
   * POST /api/setup/loxone
   * Body: { loxoneIp, loxonePort, debug, transitionTime }
   */
  router.post('/loxone', validateLoxoneConfig, asyncHandler(async (req: Request, res: Response) => {
    const { loxoneIp, loxonePort, debug, transitionTime } = req.body;

    config.update({
      loxoneIp,
      loxonePort: parseInt(loxonePort),
      debug: !!debug,
      transitionTime: transitionTime !== undefined ? parseInt(transitionTime) : config.get('transitionTime')
    });

    // Start event stream now that configuration is complete
    eventStream.start();

    res.json({ success: true });
  }));

  return router;
}

export default createSetupRoutes;
