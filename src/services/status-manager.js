/**
 * Status Manager Service
 * Manages device status cache and handles status updates with deduplication
 */

class StatusManager {
    constructor(loxoneUdp, logger) {
        this.loxoneUdp = loxoneUdp;
        this.logger = logger;
        this.statusCache = new Map();
    }

    /**
     * Update device status
     * @param {string} loxName - Loxone device name
     * @param {string} key - Status key (e.g., 'on', 'bri', 'temp')
     * @param {*} value - Status value
     * @param {Object} entry - Mapping entry
     */
    update(loxName, key, value, entry) {
        if (!this.statusCache.has(loxName)) {
            this.statusCache.set(loxName, {});
        }

        const deviceStatus = this.statusCache.get(loxName);

        // IMPORTANT: Events (buttons/rotary) are never cached!
        const isEvent = (key === 'button' || key === 'rotary');

        // Deduplicate: skip if value hasn't changed (except for events)
        if (!isEvent && deviceStatus[key] === value) {
            return;
        }

        // Update cache
        deviceStatus[key] = value;

        // Determine if we should send to Loxone
        let shouldSend = false;
        let category = 'SYSTEM';

        if (entry.hue_type === 'sensor') {
            shouldSend = true;
            category = 'SENSOR';
        } else if (entry.hue_type === 'button') {
            shouldSend = true;
            category = 'BUTTON';
        } else if (entry.sync_lox === true) {
            shouldSend = true;
            category = 'LIGHT';
        }

        // Send to Loxone if enabled
        if (shouldSend) {
            this.loxoneUdp.send(loxName, key, value, category);
        }
    }

    /**
     * Get status for a specific device
     * @param {string} loxName - Loxone device name
     * @returns {Object} Device status
     */
    get(loxName) {
        return this.statusCache.get(loxName) || {};
    }

    /**
     * Get all statuses
     * @returns {Object} All device statuses
     */
    getAll() {
        const result = {};
        this.statusCache.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    /**
     * Clear status for a device
     * @param {string} loxName - Loxone device name
     */
    clear(loxName) {
        this.statusCache.delete(loxName);
    }

    /**
     * Clear all statuses
     */
    clearAll() {
        this.statusCache.clear();
        this.logger.info('Status cache cleared', 'SYSTEM');
    }

    /**
     * Cleanup stale entries
     * @param {Array} validDeviceNames - Array of valid device names
     */
    cleanup(validDeviceNames) {
        const validSet = new Set(validDeviceNames);
        let removed = 0;

        this.statusCache.forEach((value, key) => {
            if (!validSet.has(key)) {
                this.statusCache.delete(key);
                removed++;
            }
        });

        if (removed > 0) {
            this.logger.info(`Cleaned up ${removed} stale status entries`, 'SYSTEM');
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        return {
            size: this.statusCache.size,
            devices: Array.from(this.statusCache.keys())
        };
    }
}

module.exports = StatusManager;
