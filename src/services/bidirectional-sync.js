/**
 * Bidirectional Sync Manager
 * Coordinates synchronization between Hue and Loxone
 * Prevents infinite loops with debouncing and change source tracking
 */

const CONSTANTS = require('../constants');

class BidirectionalSyncManager {
    constructor(config, logger, hueClient, loxoneClient, loxoneUdp) {
        this.config = config;
        this.logger = logger;
        this.hueClient = hueClient;
        this.loxoneClient = loxoneClient;
        this.loxoneUdp = loxoneUdp;

        // Change source tracking: deviceId → { source, timestamp }
        this.changeSource = new Map();

        // Debounce window (milliseconds)
        this.debounceWindow = this.config.get('bidirectionalDebounceMs') || 2000;

        // Cleanup interval for old entries
        this.cleanupInterval = null;
        this.cleanupIntervalMs = 10000; // Clean up every 10 seconds

        // Statistics
        this.stats = {
            hueToLoxone: 0,
            loxoneToHue: 0,
            loopsPrevented: 0
        };
    }

    /**
     * Start the sync manager
     */
    start() {
        this.logger.info('Starting BidirectionalSyncManager...', 'SYNC');

        // Listen to Loxone value state updates
        this.loxoneClient.on('value_states', (updates) => {
            this._handleLoxoneUpdates(updates);
        });

        // Start cleanup interval
        this._startCleanup();

        this.logger.success('BidirectionalSyncManager started', 'SYNC');
    }

    /**
     * Stop the sync manager
     */
    stop() {
        this.logger.info('Stopping BidirectionalSyncManager...', 'SYNC');

        // Remove event listeners
        this.loxoneClient.removeAllListeners('value_states');

        // Stop cleanup
        this._stopCleanup();

        this.logger.success('BidirectionalSyncManager stopped', 'SYNC');
    }

    /**
     * Start cleanup interval for change source map
     */
    _startCleanup() {
        this._stopCleanup();

        this.cleanupInterval = setInterval(() => {
            this._cleanupOldEntries();
        }, this.cleanupIntervalMs);
    }

    /**
     * Stop cleanup interval
     */
    _stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    /**
     * Clean up old entries from change source map
     */
    _cleanupOldEntries() {
        const now = Date.now();
        const cutoff = now - (this.debounceWindow * 5); // Keep entries for 5x debounce window

        let removed = 0;
        for (const [key, entry] of this.changeSource.entries()) {
            if (entry.timestamp < cutoff) {
                this.changeSource.delete(key);
                removed++;
            }
        }

        if (removed > 0) {
            this.logger.debug(`Cleaned up ${removed} old change source entries`, 'SYNC');
        }
    }

    /**
     * Mark change source for a device
     *
     * @param {string} deviceId - Device identifier (hue_uuid or loxone_uuid)
     * @param {string} source - Change source ('hue', 'loxone', 'bridge')
     */
    markChangeSource(deviceId, source) {
        this.changeSource.set(deviceId, {
            source,
            timestamp: Date.now()
        });

        this.logger.debug(`Change source marked: ${deviceId} = ${source}`, 'SYNC');
    }

    /**
     * Check if update should be ignored (is an echo)
     *
     * @param {string} deviceId - Device identifier
     * @param {string} expectedSource - Expected source to ignore
     * @returns {boolean} True if update should be ignored
     */
    _isEcho(deviceId, expectedSource) {
        const entry = this.changeSource.get(deviceId);

        if (!entry) {
            return false; // No recent change, not an echo
        }

        const age = Date.now() - entry.timestamp;

        if (age > this.debounceWindow) {
            return false; // Change is too old, not an echo
        }

        if (entry.source === expectedSource) {
            this.stats.loopsPrevented++;
            this.logger.debug(`Echo detected for ${deviceId} (source: ${expectedSource}, age: ${age}ms)`, 'SYNC');
            return true;
        }

        return false;
    }

    /**
     * Find mapping by Hue UUID
     *
     * @param {string} hueUuid - Hue device UUID
     * @returns {Object|null} Mapping entry or null
     */
    _findMappingByHueUuid(hueUuid) {
        const mapping = this.config.getMapping();
        return mapping.find(m => m.hue_uuid === hueUuid) || null;
    }

    /**
     * Find mapping by Loxone control UUID
     *
     * @param {string} loxoneControlUuid - Loxone control UUID
     * @returns {Object|null} Mapping entry or null
     */
    _findMappingByLoxoneUuid(loxoneControlUuid) {
        const mapping = this.config.getMapping();
        return mapping.find(m => m.loxone_control_uuid === loxoneControlUuid) || null;
    }

    /**
     * Find mapping by Loxone state UUID
     *
     * @param {string} loxoneStateUuid - Loxone state UUID
     * @returns {Object|null} Mapping entry or null
     */
    _findMappingByLoxoneStateUuid(loxoneStateUuid) {
        const mapping = this.config.getMapping();
        return mapping.find(m => {
            // Check if this state UUID matches any of the configured state UUIDs
            return m.loxone_state_uuid === loxoneStateUuid ||
                   m.loxone_dimmer_uuid === loxoneStateUuid;
        }) || null;
    }

    /**
     * Handle Loxone value state updates
     *
     * @param {Array} updates - Array of enriched state updates
     */
    async _handleLoxoneUpdates(updates) {
        for (const update of updates) {
            try {
                await this._processLoxoneUpdate(update);
            } catch (error) {
                this.logger.error(`Failed to process Loxone update: ${error.message}`, 'SYNC');
            }
        }
    }

    /**
     * Process a single Loxone update
     *
     * @param {Object} update - State update with control info
     */
    async _processLoxoneUpdate(update) {
        const { uuid, value, control } = update;

        // Find mapping for this state UUID
        const mapping = this._findMappingByLoxoneStateUuid(uuid);

        if (!mapping) {
            // No mapping for this state, ignore
            return;
        }

        if (!mapping.bidirectional) {
            // Bidirectional sync not enabled for this device
            return;
        }

        // Check if this is an echo of our own change
        if (this._isEcho(mapping.hue_uuid, 'hue')) {
            return; // Ignore echo
        }

        this.logger.debug(
            `Loxone update: ${control.controlName} (${control.stateName}) = ${value}`,
            'SYNC'
        );

        // Mark change source as Loxone
        this.markChangeSource(mapping.hue_uuid, 'loxone');

        // Update Hue device
        await this._updateHueFromLoxone(mapping, control, value);

        this.stats.loxoneToHue++;
    }

    /**
     * Update Hue device from Loxone state change
     *
     * @param {Object} mapping - Mapping entry
     * @param {Object} control - Loxone control info
     * @param {number} value - State value
     */
    async _updateHueFromLoxone(mapping, control, value) {
        try {
            const payload = {};

            // Determine what to update based on control type and state name
            if (control.controlType === 'Dimmer' && control.stateName === 'position') {
                // Dimmer position: 0-100
                if (value === 0) {
                    payload.on = { on: false };
                } else {
                    payload.on = { on: true };
                    payload.dimming = { brightness: Math.max(0, Math.min(100, value)) };
                }
            } else if (control.controlType === 'ColorPickerV2' && control.stateName === 'color') {
                // Color picker: value is encoded color
                // TODO: Decode Loxone color format and convert to Hue XY or Mirek
                // For now, just turn on the light
                payload.on = { on: true };
                this.logger.warn('Color conversion from Loxone not yet implemented', 'SYNC');
            } else if (control.controlType === 'Switch') {
                // Switch: binary on/off
                payload.on = { on: value > 0 };
            } else {
                // Unknown control type
                this.logger.debug(`Unsupported control type: ${control.controlType}`, 'SYNC');
                return;
            }

            // Determine resource type
            const resourceType = mapping.hue_type === 'group' ? 'grouped_light' : 'light';

            // Send to Hue
            this.logger.debug(`Updating Hue ${mapping.hue_name}: ${JSON.stringify(payload)}`, 'SYNC');
            await this.hueClient.updateLight(mapping.hue_uuid, resourceType, payload, mapping.loxone_name);

            this.logger.success(
                `Synced ${control.controlName} → ${mapping.hue_name}`,
                'SYNC'
            );
        } catch (error) {
            throw new Error(`Failed to update Hue from Loxone: ${error.message}`);
        }
    }

    /**
     * Handle Hue device change (called from EventStream)
     *
     * @param {string} hueUuid - Hue device UUID
     * @param {Object} data - Hue event data
     */
    async onHueChange(hueUuid, data) {
        try {
            // Find mapping
            const mapping = this._findMappingByHueUuid(hueUuid);

            if (!mapping) {
                return; // No mapping
            }

            if (!mapping.bidirectional) {
                return; // Bidirectional sync not enabled
            }

            // Check if this is an echo of our own change
            if (this._isEcho(hueUuid, 'loxone')) {
                return; // Ignore echo
            }

            this.logger.debug(`Hue change: ${mapping.hue_name}`, 'SYNC');

            // Mark change source as Hue
            this.markChangeSource(hueUuid, 'hue');

            // Update Loxone
            await this._updateLoxoneFromHue(mapping, data);

            this.stats.hueToLoxone++;
        } catch (error) {
            this.logger.error(`Failed to process Hue change: ${error.message}`, 'SYNC');
        }
    }

    /**
     * Update Loxone from Hue state change
     *
     * @param {Object} mapping - Mapping entry
     * @param {Object} data - Hue event data
     */
    async _updateLoxoneFromHue(mapping, data) {
        try {
            // Determine what changed and send appropriate command to Loxone
            if (data.on !== undefined) {
                // On/Off state changed
                const value = data.on.on ? 'On' : 'Off';
                await this.loxoneClient.sendCommand(mapping.loxone_control_uuid, value);
                this.logger.debug(`Sent to Loxone: ${mapping.loxone_control_uuid} = ${value}`, 'SYNC');
            }

            if (data.dimming !== undefined) {
                // Brightness changed
                const brightness = Math.round(data.dimming.brightness);
                await this.loxoneClient.sendCommand(mapping.loxone_control_uuid, brightness);
                this.logger.debug(`Sent to Loxone: ${mapping.loxone_control_uuid} = ${brightness}`, 'SYNC');
            }

            if (data.color_temperature !== undefined || data.color !== undefined) {
                // Color/temperature changed
                // TODO: Convert Hue color to Loxone format
                this.logger.warn('Color conversion to Loxone not yet implemented', 'SYNC');
            }

            this.logger.success(`Synced ${mapping.hue_name} → Loxone`, 'SYNC');
        } catch (error) {
            throw new Error(`Failed to update Loxone from Hue: ${error.message}`);
        }
    }

    /**
     * Get sync statistics
     *
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            ...this.stats,
            changeSourceEntries: this.changeSource.size,
            debounceWindow: this.debounceWindow
        };
    }
}

module.exports = BidirectionalSyncManager;
