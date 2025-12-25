/**
 * loxHueBridge Server
 * Bidirectional integration between Philips Hue V2 and Loxone Miniserver
 *
 * Refactored modular architecture
 */

const express = require('express');
const path = require('path');
const CONSTANTS = require('./constants');

// Utilities
const Logger = require('./utils/logger');

// Configuration
const Config = require('./config');

// Services
const RateLimiter = require('./services/rate-limiter');
const LoxoneUDP = require('./services/loxone-udp');
const HueClient = require('./services/hue-client');
const EventStream = require('./services/event-stream');
const StatusManager = require('./services/status-manager');

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const { redirectIfNotConfigured } = require('./middleware/redirect');
const { setLogger } = require('./middleware/validation');

// Routes
const createSetupRoutes = require('./routes/setup');
const createApiRoutes = require('./routes/api');
const createLightsRoutes = require('./routes/lights');

// --- VERSION INFO ---
let version = 'unknown';
try {
    const packageJson = require('../package.json');
    version = packageJson.version;
} catch (error) {
    console.warn('Could not load package.json:', error.message);
}

// --- HTTP PORT ---
const HTTP_PORT = parseInt(process.env.HTTP_PORT || CONSTANTS.HTTP.DEFAULT_PORT);

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

// Event Stream
const eventStream = new EventStream(config, logger, hueClient, loxoneUdp, statusManager);

// Detected items storage
const detectedItems = {
    items: []
};

// --- EXPRESS APP ---
const app = express();

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
    logger,
    statusManager,
    eventStream,
    rateLimiter,
    detectedItems,
    httpPort: HTTP_PORT,
    version
}));

// Light control routes
app.use('/', createLightsRoutes({
    config,
    hueClient,
    logger,
    statusManager,
    detectedItems
}));

// --- ERROR HANDLERS ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- START SERVER ---
app.listen(HTTP_PORT, () => {
    console.log(`🚀 loxHueBridge v${version} running on port ${HTTP_PORT}`);

    // Start event stream if already configured
    if (config.isReady()) {
        logger.info('Bridge configured, starting event stream...', 'SYSTEM');
        eventStream.start();
    } else {
        logger.warn('Bridge not configured - visit http://localhost:' + HTTP_PORT + ' to setup', 'SYSTEM');
    }
});

// --- GRACEFUL SHUTDOWN ---
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...', 'SYSTEM');

    eventStream.stop();
    loxoneUdp.close();

    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...', 'SYSTEM');

    eventStream.stop();
    loxoneUdp.close();

    process.exit(0);
});

// --- UNCAUGHT ERRORS ---
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught exception: ${error.message}`, 'SYSTEM');
    logger.error(error.stack, 'SYSTEM');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled rejection at ${promise}: ${reason}`, 'SYSTEM');
});

module.exports = app;
