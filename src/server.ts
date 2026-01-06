/**
 * loxHueBridge Server
 * Bidirectional integration between Philips Hue V2 and Loxone Miniserver
 *
 * Refactored modular architecture
 */

import express, { Express } from 'express';
import path from 'path';
import CONSTANTS from './constants';
import { DetectedItemsStore } from './types';

// Utilities
import Logger from './utils/logger';

// Configuration
import Config from './config';

// Services
import RateLimiter from './services/rate-limiter';
import LoxoneUDP from './services/loxone-udp';
import HueClient from './services/hue-client';
import EventStream from './services/event-stream';
import StatusManager from './services/status-manager';
import LoxoneClient from './services/loxone-client';
import BidirectionalSyncManager from './services/bidirectional-sync';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { redirectIfNotConfigured } from './middleware/redirect';
import { setLogger } from './middleware/validation';

// Routes
import createSetupRoutes from './routes/setup';
import createApiRoutes from './routes/api';
import createLightsRoutes from './routes/lights';
import createSceneRoutes from './routes/scenes';

// --- VERSION INFO ---
let version = 'unknown';
try {
  const packageJson = require('../package.json');
  version = packageJson.version;
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.warn('Could not load package.json:', message);
}

// --- HTTP PORT ---
const HTTP_PORT = parseInt(process.env.HTTP_PORT || CONSTANTS.HTTP.DEFAULT_PORT.toString());

// --- INITIALIZE SERVICES ---

// Logger
const logger = new Logger({
  debug: process.env.DEBUG === 'true',
  maxLogs: CONSTANTS.LOG.MAX_BUFFER_SIZE
});

// Set logger for validation middleware
setLogger(logger);

logger.info(`loxHueBridge v${version} starting...`, 'SYSTEM');

// Configuration
const config = new Config(logger);

// Update logger debug mode from config
logger.setDebugMode(config.get('debug'));

// Rate Limiter
const rateLimiter = new RateLimiter(logger);

// Loxone UDP
const loxoneUdp = new LoxoneUDP(config, logger);

// Status Manager
const statusManager = new StatusManager(loxoneUdp, logger);

// Hue Client
const hueClient = new HueClient(config, logger, rateLimiter);

// Loxone Client (for bidirectional sync)
const loxoneClient = new LoxoneClient(config, logger);

// Bidirectional Sync Manager
const bidirectionalSync = new BidirectionalSyncManager(
  config,
  logger,
  hueClient,
  loxoneClient,
  loxoneUdp
);

// Event Stream (with bidirectional sync support)
const eventStream = new EventStream(
  config,
  logger,
  hueClient,
  loxoneUdp,
  statusManager,
  bidirectionalSync
);

// Detected items storage
const detectedItems: DetectedItemsStore = {
  items: []
};

// --- EXPRESS APP ---
const app: Express = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirect middleware
app.use(redirectIfNotConfigured(config));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// --- ROUTES ---

// Setup routes
app.use('/api/setup', createSetupRoutes(config, eventStream));

// API routes
app.use('/api', createApiRoutes({
  config,
  hueClient,
  loxoneClient,
  logger,
  statusManager,
  eventStream,
  rateLimiter,
  detectedItems,
  httpPort: HTTP_PORT,
  version
}));

// Scene control routes (must be before light routes to avoid pattern collision)
app.use('/', createSceneRoutes({
  config,
  hueClient,
  logger
}));

// Light control routes
app.use('/', createLightsRoutes({
  config,
  hueClient,
  logger,
  statusManager,
  detectedItems,
  bidirectionalSync
}));

// --- ERROR HANDLERS ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- START SERVER ---
app.listen(HTTP_PORT, async () => {
  console.log(`🚀 loxHueBridge v${version} running on port ${HTTP_PORT}`);

  // Start event stream if already configured
  if (config.isReady()) {
    logger.info('Bridge configured, starting event stream...', 'SYSTEM');

    // Start bidirectional sync if enabled
    if (config.get('bidirectionalSync')) {
      const loxoneUser = config.get('loxoneUser');
      const loxonePassword = config.get('loxonePassword');

      if (loxoneUser && loxonePassword) {
        try {
          logger.info('Starting Loxone bidirectional sync...', 'SYNC');
          await loxoneClient.connect();
          await bidirectionalSync.start();
          logger.success('Bidirectional sync enabled', 'SYNC');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          logger.error(`Failed to start bidirectional sync: ${message}`, 'SYNC');
          logger.warn('Continuing in one-way mode', 'SYNC');
        }
      } else {
        logger.warn('Bidirectional sync enabled but Loxone credentials missing', 'SYNC');
      }
    }

    eventStream.start();
  } else {
    logger.warn('Bridge not configured - visit http://localhost:' + HTTP_PORT + ' to setup', 'SYSTEM');
  }
});

// --- GRACEFUL SHUTDOWN ---
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...', 'SYSTEM');

  eventStream.stop();
  bidirectionalSync.stop();
  loxoneClient.disconnect();
  loxoneUdp.close();

  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...', 'SYSTEM');

  eventStream.stop();
  bidirectionalSync.stop();
  loxoneClient.disconnect();
  loxoneUdp.close();

  process.exit(0);
});

// --- UNCAUGHT ERRORS ---
process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught exception: ${error.message}`, 'SYSTEM');
  logger.error(error.stack || 'No stack trace', 'SYSTEM');
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error(`Unhandled rejection at ${promise}: ${reason}`, 'SYSTEM');
});

export default app;
