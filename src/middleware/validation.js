/**
 * Validation Middleware
 * Express middleware for validating request parameters
 */

const {
    isValidDeviceName,
    isValidControlValue,
    isValidLoxoneName,
    isValidHueUuid,
    isValidDeviceType,
    isValidIpAddress,
    isValidPort,
    isValidTransitionTime
} = require('../config/validation');

/**
 * Validate light control command parameters
 */
function validateLightCommand(req, res, next) {
    const { name, value } = req.params;

    // Validate device name
    if (!isValidDeviceName(name)) {
        return res.status(400).json({
            error: 'Invalid device name format',
            details: 'Device name must be alphanumeric with optional hyphens/underscores (1-50 chars)'
        });
    }

    // Validate control value
    if (!isValidControlValue(value)) {
        return res.status(400).json({
            error: 'Invalid control value',
            details: 'Value must be 0-100 for dimming or a valid color format'
        });
    }

    next();
}

/**
 * Validate mapping data
 */
function validateMapping(req, res, next) {
    const mapping = req.body;

    if (!Array.isArray(mapping)) {
        return res.status(400).json({
            error: 'Invalid mapping format',
            details: 'Mapping must be an array'
        });
    }

    // Validate each mapping entry
    for (const entry of mapping) {
        if (!entry.loxone_name || !isValidLoxoneName(entry.loxone_name)) {
            return res.status(400).json({
                error: 'Invalid Loxone name',
                details: 'Loxone name must be alphanumeric with optional hyphens/underscores (1-100 chars)',
                entry
            });
        }

        if (!entry.hue_uuid || !isValidHueUuid(entry.hue_uuid)) {
            return res.status(400).json({
                error: 'Invalid Hue UUID',
                details: 'Hue UUID must be a valid UUID format',
                entry
            });
        }

        if (!entry.hue_type || !isValidDeviceType(entry.hue_type)) {
            return res.status(400).json({
                error: 'Invalid device type',
                details: 'Device type must be: light, group, sensor, or button',
                entry
            });
        }
    }

    next();
}

/**
 * Validate Loxone configuration
 */
function validateLoxoneConfig(req, res, next) {
    const { loxoneIp, loxonePort, transitionTime } = req.body;

    if (loxoneIp && !isValidIpAddress(loxoneIp)) {
        return res.status(400).json({
            error: 'Invalid Loxone IP address',
            details: 'Must be a valid IPv4 address'
        });
    }

    if (loxonePort && !isValidPort(loxonePort)) {
        return res.status(400).json({
            error: 'Invalid Loxone port',
            details: 'Port must be between 1 and 65535'
        });
    }

    if (transitionTime !== undefined && !isValidTransitionTime(transitionTime)) {
        return res.status(400).json({
            error: 'Invalid transition time',
            details: 'Transition time must be between 0 and 10000ms'
        });
    }

    next();
}

/**
 * Validate Hue Bridge registration
 */
function validateBridgeRegistration(req, res, next) {
    const { ip } = req.body;

    if (!ip || !isValidIpAddress(ip)) {
        return res.status(400).json({
            error: 'Invalid Bridge IP address',
            details: 'Must be a valid IPv4 address'
        });
    }

    next();
}

module.exports = {
    validateLightCommand,
    validateMapping,
    validateLoxoneConfig,
    validateBridgeRegistration
};
