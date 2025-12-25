/**
 * Input Validation
 * Validates user input to prevent security vulnerabilities
 */

/**
 * Validates light/device name from URL parameter
 * @param {string} name - Device name to validate
 * @returns {boolean} True if valid
 */
function isValidDeviceName(name) {
    if (!name || typeof name !== 'string') {
        return false;
    }

    // Allow alphanumeric, spaces, underscore, hyphen, dots
    // No leading/trailing spaces allowed
    // Length: 1-100 characters
    // Prevent control characters and special chars that could cause injection
    if (name !== name.trim()) {
        return false; // No leading/trailing spaces
    }

    // Allow letters, numbers, spaces, underscore, hyphen, dots
    // Prevent multiple consecutive spaces
    if (/\s{2,}/.test(name)) {
        return false; // No multiple spaces
    }

    return /^[a-zA-Z0-9_\-\.\s]{1,100}$/.test(name);
}

/**
 * Validates light control value from URL parameter
 * @param {string} value - Control value to validate
 * @returns {boolean} True if valid
 */
function isValidControlValue(value) {
    const numValue = parseInt(value);

    // Check if it's a valid number
    if (!isNaN(numValue)) {
        // Simple on/off/dimming: 0-100
        if (numValue >= 0 && numValue <= 100) {
            return true;
        }

        // RGB format: up to 9 digits (BRI_GRN_RED)
        if (numValue >= 0 && numValue <= 999999999) {
            return true;
        }
    }

    // Color temperature format: starts with "20" and at least 9 digits
    if (/^20\d{7,}$/.test(value)) {
        return true;
    }

    return false;
}

/**
 * Validates IP address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid
 */
function isValidIpAddress(ip) {
    if (!ip || typeof ip !== 'string') {
        return false;
    }

    const parts = ip.split('.');

    if (parts.length !== 4) {
        return false;
    }

    return parts.every(part => {
        const num = parseInt(part, 10);
        return !isNaN(num) && num >= 0 && num <= 255 && part === String(num);
    });
}

/**
 * Validates port number
 * @param {number|string} port - Port number to validate
 * @returns {boolean} True if valid
 */
function isValidPort(port) {
    const num = parseInt(port);
    return !isNaN(num) && num > 0 && num <= 65535;
}

/**
 * Validates Loxone name for mapping
 * @param {string} name - Loxone name to validate
 * @returns {boolean} True if valid
 */
function isValidLoxoneName(name) {
    if (!name || typeof name !== 'string') {
        return false;
    }

    // No leading/trailing spaces
    if (name !== name.trim()) {
        return false;
    }

    // Prevent multiple consecutive spaces
    if (/\s{2,}/.test(name)) {
        return false;
    }

    // Allow letters, numbers, spaces, underscore, hyphen, dots
    // Length: 1-100 characters
    return /^[a-zA-Z0-9_\-\.\s]{1,100}$/.test(name);
}

/**
 * Validates Hue UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid
 */
function isValidHueUuid(uuid) {
    if (!uuid || typeof uuid !== 'string') {
        return false;
    }

    // Hue UUIDs are typically hex strings with hyphens
    // Also allow "pseudo-all" for special case
    if (uuid === 'pseudo-all') {
        return true;
    }

    // UUID format: 8-4-4-4-12 hex digits
    return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(uuid);
}

/**
 * Validates device type
 * @param {string} type - Device type to validate
 * @returns {boolean} True if valid
 */
function isValidDeviceType(type) {
    return ['light', 'group', 'sensor', 'button'].includes(type);
}

/**
 * Sanitizes string for safe output
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
    if (typeof str !== 'string') {
        return '';
    }

    return str
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim()
        .substring(0, 500); // Limit length
}

/**
 * Validates transition time value
 * @param {number|string} time - Transition time in ms
 * @returns {boolean} True if valid
 */
function isValidTransitionTime(time) {
    const num = parseInt(time);
    return !isNaN(num) && num >= 0 && num <= 10000; // 0-10 seconds
}

module.exports = {
    isValidDeviceName,
    isValidControlValue,
    isValidIpAddress,
    isValidPort,
    isValidLoxoneName,
    isValidHueUuid,
    isValidDeviceType,
    sanitizeString,
    isValidTransitionTime
};
