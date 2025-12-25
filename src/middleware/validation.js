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

// Logger instance (set during initialization)
let logger = null;

/**
 * Set logger instance for validation logging
 * @param {Object} loggerInstance - Logger instance
 */
function setLogger(loggerInstance) {
    logger = loggerInstance;
}

/**
 * Validate light control command parameters
 */
function validateLightCommand(req, res, next) {
    const { name, value } = req.params;

    // Validate device name
    if (!isValidDeviceName(name)) {
        const error = {
            error: 'Invalid device name format',
            details: 'Device name must be alphanumeric with optional spaces, hyphens, underscores, dots (1-100 chars, no leading/trailing spaces)',
            name: name
        };

        if (logger) {
            logger.warn(`Validation failed: Invalid device name`, 'API', {
                name: name,
                length: name?.length,
                hasLeadingSpace: name !== name?.trim(),
                hasMultipleSpaces: /\s{2,}/.test(name)
            });
        }

        return res.status(400).json(error);
    }

    // Validate control value
    if (!isValidControlValue(value)) {
        const error = {
            error: 'Invalid control value',
            details: 'Value must be 0-100 for dimming or a valid color format',
            value: value
        };

        if (logger) {
            logger.warn(`Validation failed: Invalid control value`, 'API', {
                name: name,
                value: value
            });
        }

        return res.status(400).json(error);
    }

    next();
}

/**
 * Validate mapping data
 */
function validateMapping(req, res, next) {
    const mapping = req.body;

    if (!Array.isArray(mapping)) {
        const error = {
            error: 'Invalid mapping format',
            details: 'Mapping must be an array'
        };

        if (logger) {
            logger.warn(`Validation failed: Mapping not an array`, 'API', {
                receivedType: typeof mapping
            });
        }

        return res.status(400).json(error);
    }

    // Validate each mapping entry
    for (let i = 0; i < mapping.length; i++) {
        const entry = mapping[i];

        if (!entry.loxone_name || !isValidLoxoneName(entry.loxone_name)) {
            const error = {
                error: 'Invalid Loxone name',
                details: 'Loxone name must be alphanumeric with optional spaces, hyphens, underscores, dots (1-100 chars, no leading/trailing spaces)',
                entry,
                index: i
            };

            if (logger) {
                logger.warn(`Validation failed: Invalid Loxone name in mapping`, 'API', {
                    index: i,
                    loxoneName: entry.loxone_name,
                    length: entry.loxone_name?.length,
                    hasLeadingSpace: entry.loxone_name !== entry.loxone_name?.trim()
                });
            }

            return res.status(400).json(error);
        }

        if (!entry.hue_uuid || !isValidHueUuid(entry.hue_uuid)) {
            const error = {
                error: 'Invalid Hue UUID',
                details: 'Hue UUID must be a valid UUID format',
                entry,
                index: i
            };

            if (logger) {
                logger.warn(`Validation failed: Invalid Hue UUID in mapping`, 'API', {
                    index: i,
                    loxoneName: entry.loxone_name,
                    hueUuid: entry.hue_uuid
                });
            }

            return res.status(400).json(error);
        }

        if (!entry.hue_type || !isValidDeviceType(entry.hue_type)) {
            const error = {
                error: 'Invalid device type',
                details: 'Device type must be: light, group, sensor, or button',
                entry,
                index: i
            };

            if (logger) {
                logger.warn(`Validation failed: Invalid device type in mapping`, 'API', {
                    index: i,
                    loxoneName: entry.loxone_name,
                    hueType: entry.hue_type
                });
            }

            return res.status(400).json(error);
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
        const error = {
            error: 'Invalid Loxone IP address',
            details: 'Must be a valid IPv4 address',
            loxoneIp: loxoneIp
        };

        if (logger) {
            logger.warn(`Validation failed: Invalid Loxone IP`, 'API', {
                loxoneIp: loxoneIp
            });
        }

        return res.status(400).json(error);
    }

    if (loxonePort && !isValidPort(loxonePort)) {
        const error = {
            error: 'Invalid Loxone port',
            details: 'Port must be between 1 and 65535',
            loxonePort: loxonePort
        };

        if (logger) {
            logger.warn(`Validation failed: Invalid Loxone port`, 'API', {
                loxonePort: loxonePort
            });
        }

        return res.status(400).json(error);
    }

    if (transitionTime !== undefined && !isValidTransitionTime(transitionTime)) {
        const error = {
            error: 'Invalid transition time',
            details: 'Transition time must be between 0 and 10000ms',
            transitionTime: transitionTime
        };

        if (logger) {
            logger.warn(`Validation failed: Invalid transition time`, 'API', {
                transitionTime: transitionTime
            });
        }

        return res.status(400).json(error);
    }

    next();
}

/**
 * Validate Hue Bridge registration
 */
function validateBridgeRegistration(req, res, next) {
    const { ip } = req.body;

    if (!ip || !isValidIpAddress(ip)) {
        const error = {
            error: 'Invalid Bridge IP address',
            details: 'Must be a valid IPv4 address',
            ip: ip
        };

        if (logger) {
            logger.warn(`Validation failed: Invalid Bridge IP`, 'API', {
                ip: ip
            });
        }

        return res.status(400).json(error);
    }

    next();
}

module.exports = {
    validateLightCommand,
    validateMapping,
    validateLoxoneConfig,
    validateBridgeRegistration,
    setLogger
};
