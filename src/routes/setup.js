/**
 * Setup Routes
 * Handles initial bridge setup and configuration
 */

const express = require('express');
const axios = require('axios');
const https = require('https');
const { asyncHandler } = require('../middleware/error-handler');
const { validateBridgeRegistration, validateLoxoneConfig } = require('../middleware/validation');

const router = express.Router();

// HTTPS agent for Hue Bridge discovery and registration
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Initialize setup routes
 * @param {Object} config - Config instance
 * @param {Object} eventStream - EventStream instance
 * @returns {Router} Express router
 */
function createSetupRoutes(config, eventStream) {
    /**
     * Discover Hue Bridge on local network
     * GET /api/setup/discover
     */
    router.get('/discover', asyncHandler(async (req, res) => {
        try {
            const response = await axios.get('https://discovery.meethue.com/');
            res.json(response.data);
        } catch (error) {
            res.status(500).json({
                error: 'Failed to discover Hue Bridge',
                details: error.message
            });
        }
    }));

    /**
     * Register with Hue Bridge
     * POST /api/setup/register
     * Body: { ip: "192.168.x.x" }
     */
    router.post('/register', validateBridgeRegistration, asyncHandler(async (req, res) => {
        const { ip } = req.body;

        try {
            const response = await axios.post(
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
                    error: error.description || 'Registration failed'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }));

    /**
     * Configure Loxone settings
     * POST /api/setup/loxone
     * Body: { loxoneIp, loxonePort, debug, transitionTime }
     */
    router.post('/loxone', validateLoxoneConfig, asyncHandler(async (req, res) => {
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

module.exports = createSetupRoutes;
