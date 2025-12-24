/**
 * Lights Routes
 * Handles light control commands from Loxone
 */

const express = require('express');
const CONSTANTS = require('../constants');
const { asyncHandler } = require('../middleware/error-handler');
const { validateLightCommand } = require('../middleware/validation');

const router = express.Router();

/**
 * Initialize light control routes
 * @param {Object} dependencies - Service dependencies
 * @returns {Router} Express router
 */
function createLightsRoutes(dependencies) {
    const { config, hueClient, logger, statusManager, detectedItems } = dependencies;

    /**
     * Execute light control command
     * @param {Object} entry - Mapping entry
     * @param {string} value - Control value
     * @param {number|null} forcedTransition - Forced transition time
     * @returns {Promise<void>}
     */
    async function executeCommand(entry, value, forcedTransition = null) {
        const uuid = entry.hue_uuid;
        const resourceType = entry.hue_type === 'group' ? 'grouped_light' : 'light';

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
    router.get('/:name/:value', validateLightCommand, asyncHandler(async (req, res) => {
        const { name, value } = req.params;
        const search = name.toLowerCase();

        logger.debug(`Command: /${name}/${value}`, 'LIGHT');

        if (!config.isReady()) {
            return res.status(503).send('Not configured');
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
                        logger.error(`Sequence error for ${target.loxone_name}: ${error.message}`, 'LIGHT');
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
                    id: 'cmd_' + name
                });

                if (detectedItems.items.length > CONSTANTS.DETECTION.MAX_ITEMS) {
                    detectedItems.items.shift();
                }
            }

            return res.status(200).send('Recorded');
        }

        // Reject control of sensors and buttons
        if (entry.hue_type === 'sensor' || entry.hue_type === 'button') {
            return res.status(400).send('Read-only device');
        }

        // Execute command
        await executeCommand(entry, value);
        res.status(200).send('OK');
    }));

    return router;
}

module.exports = createLightsRoutes;
