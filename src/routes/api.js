/**
 * API Routes
 * Handles main API endpoints for configuration, mapping, and diagnostics
 */

const express = require('express');
const os = require('os');
const { asyncHandler } = require('../middleware/error-handler');
const { validateMapping } = require('../middleware/validation');
const { generateOutputsXML, generateInputsXML, generateScenesXML } = require('../utils/xml-generator');

const router = express.Router();

/**
 * Get server IP address for XML generation
 * @returns {string} Server IP address
 */
function getServerIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        for (const alias of interfaces[devName]) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

/**
 * Initialize API routes
 * @param {Object} dependencies - Service dependencies
 * @returns {Router} Express router
 */
function createApiRoutes(dependencies) {
    const {
        config,
        hueClient,
        logger,
        statusManager,
        eventStream,
        rateLimiter,
        detectedItems,
        httpPort,
        version
    } = dependencies;

    /**
     * Get all available Hue targets
     * GET /api/targets
     */
    router.get('/targets', asyncHandler(async (req, res) => {
        if (!config.isReady()) {
            return res.status(503).json([]);
        }

        const targets = await hueClient.getTargets();
        res.json(targets);
    }));

    /**
     * Get all available scenes
     * GET /api/scenes
     */
    router.get('/scenes', asyncHandler(async (req, res) => {
        if (!config.isReady()) {
            return res.status(503).json([]);
        }

        const scenes = await hueClient.getScenes();
        res.json(scenes);
    }));

    /**
     * Get current mapping
     * GET /api/mapping
     */
    router.get('/mapping', (req, res) => {
        res.json(config.getMapping());
    });

    /**
     * Update mapping
     * POST /api/mapping
     * Body: Array of mapping entries
     */
    router.post('/mapping', validateMapping, asyncHandler(async (req, res) => {
        const mapping = req.body;
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
                const detMeta = serviceToDeviceMap[d.id];
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
    router.get('/detected', (req, res) => {
        res.json([...detectedItems.items].reverse());
    });

    /**
     * Get current status cache
     * GET /api/status
     */
    router.get('/status', (req, res) => {
        res.json(statusManager.getAll());
    });

    /**
     * Get server logs
     * GET /api/logs
     */
    router.get('/logs', (req, res) => {
        res.json(logger.getLogs());
    });

    /**
     * Get application settings
     * GET /api/settings
     */
    router.get('/settings', (req, res) => {
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
    router.post('/settings/debug', (req, res) => {
        const active = !!req.body.active;
        config.setDebugMode(active);
        res.json({ success: true });
    });

    /**
     * Get diagnostics information
     * GET /api/diagnostics
     */
    router.get('/diagnostics', asyncHandler(async (req, res) => {
        if (!config.isReady()) {
            return res.status(503).json({ error: 'Not configured' });
        }

        const diagnostics = await hueClient.getDiagnostics();
        res.json(diagnostics);
    }));

    /**
     * Get health status
     * GET /api/health
     */
    router.get('/health', (req, res) => {
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
    router.get('/download/outputs', (req, res) => {
        const filterNames = req.query.names ? req.query.names.split(',') : null;

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
    router.get('/download/inputs', (req, res) => {
        const filterNames = req.query.names ? req.query.names.split(',') : null;

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
    router.get('/download/scenes', asyncHandler(async (req, res) => {
        if (!config.isReady()) {
            return res.status(503).send('Not configured');
        }

        const filterUuids = req.query.uuids ? req.query.uuids.split(',') : null;

        // Get all scenes from Hue Bridge
        let scenes = await hueClient.getScenes();

        // Filter by selected UUIDs if provided
        if (filterUuids) {
            scenes = scenes.filter(s => filterUuids.includes(s.uuid));
        }

        // Generate XML
        const xml = generateScenesXML(scenes, getServerIp(), httpPort);

        // Send as downloadable file
        res.set('Content-Type', 'text/xml');
        res.set('Content-Disposition', 'attachment; filename="lox_scenes.xml"');
        res.send(xml);
    }));

    return router;
}

module.exports = createApiRoutes;
