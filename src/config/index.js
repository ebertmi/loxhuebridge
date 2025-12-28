/**
 * Configuration Management
 * Handles loading, saving, and validating application configuration
 */

const fs = require('fs');
const path = require('path');
const CONSTANTS = require('../constants');

class Config {
    constructor(logger, dataDir = null) {
        this.logger = logger;
        this.dataDir = dataDir || path.join(__dirname, '../../', CONSTANTS.PATHS.DATA_DIR);
        this.configFile = path.join(this.dataDir, CONSTANTS.PATHS.CONFIG_FILE);
        this.mappingFile = path.join(this.dataDir, CONSTANTS.PATHS.MAPPING_FILE);

        // Default configuration
        this.config = {
            bridgeIp: process.env.HUE_BRIDGE_IP || null,
            appKey: process.env.HUE_APP_KEY || null,
            loxoneIp: process.env.LOXONE_IP || null,
            loxonePort: parseInt(process.env.LOXONE_UDP_PORT || CONSTANTS.LOXONE.DEFAULT_UDP_PORT),
            debug: process.env.DEBUG === 'true',
            transitionTime: 400,
            certPinningEnabled: process.env.HUE_CERT_PINNING_ENABLED === 'true',
            certFingerprint: process.env.HUE_CERT_FINGERPRINT || null
        };

        this.mapping = [];
        this.isConfigured = false;

        this._ensureDataDir();
        this.load();
    }

    /**
     * Ensure data directory exists
     */
    _ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            try {
                fs.mkdirSync(this.dataDir, { recursive: true });
                this.logger.info(`Created data directory: ${this.dataDir}`, 'SYSTEM');
            } catch (error) {
                this.logger.error(`Failed to create data directory: ${error.message}`, 'SYSTEM');
                throw error;
            }
        }
    }

    /**
     * Validate configuration structure
     * @param {Object} config - Configuration to validate
     * @returns {boolean} True if valid
     */
    _isValidConfig(config) {
        return (
            typeof config === 'object' &&
            (config.bridgeIp === null || typeof config.bridgeIp === 'string') &&
            (config.appKey === null || typeof config.appKey === 'string') &&
            (config.loxoneIp === null || typeof config.loxoneIp === 'string') &&
            typeof config.loxonePort === 'number' &&
            config.loxonePort > 0 &&
            config.loxonePort <= 65535 &&
            typeof config.debug === 'boolean' &&
            (config.certPinningEnabled === undefined || typeof config.certPinningEnabled === 'boolean') &&
            (config.certFingerprint === undefined || config.certFingerprint === null || typeof config.certFingerprint === 'string')
        );
    }

    /**
     * Validate mapping structure
     * @param {Array} mapping - Mapping to validate
     * @returns {Array} Validated and filtered mapping
     */
    _validateMapping(mapping) {
        if (!Array.isArray(mapping)) {
            this.logger.warn('Mapping is not an array, resetting', 'SYSTEM');
            return [];
        }

        return mapping.filter(m => {
            const isValid = (
                m.loxone_name &&
                typeof m.loxone_name === 'string' &&
                m.loxone_name.length > 0 &&
                m.hue_uuid &&
                m.hue_name &&
                ['light', 'group', 'sensor', 'button'].includes(m.hue_type)
            );

            if (!isValid) {
                this.logger.warn(`Invalid mapping entry filtered out: ${JSON.stringify(m)}`, 'SYSTEM');
            }

            return isValid;
        });
    }

    /**
     * Load configuration from file
     */
    load() {
        this._loadConfig();
        this._loadMapping();
    }

    /**
     * Load main configuration file
     */
    _loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                const data = fs.readFileSync(this.configFile, 'utf8');
                const parsed = JSON.parse(data);

                if (!this._isValidConfig(parsed)) {
                    throw new Error('Invalid config structure');
                }

                this.config = { ...this.config, ...parsed };

                // Ensure transitionTime exists
                if (this.config.transitionTime === undefined) {
                    this.config.transitionTime = 400;
                }

                // Ensure certificate pinning fields exist
                if (this.config.certPinningEnabled === undefined) {
                    this.config.certPinningEnabled = false;
                }
                if (this.config.certFingerprint === undefined) {
                    this.config.certFingerprint = null;
                }

                this.logger.success('Configuration loaded', 'SYSTEM');
            }
        } catch (error) {
            this.logger.error(`Failed to load config: ${error.message}`, 'SYSTEM');

            // Backup corrupt file
            if (fs.existsSync(this.configFile)) {
                const backup = `${this.configFile}.corrupt.${Date.now()}`;
                try {
                    fs.copyFileSync(this.configFile, backup);
                    this.logger.warn(`Corrupt config backed up to ${backup}`, 'SYSTEM');
                } catch (backupError) {
                    this.logger.error(`Failed to backup config: ${backupError.message}`, 'SYSTEM');
                }
            }

            // Reset to defaults
            this.save();
        }

        // Check if configured
        if (this.config.bridgeIp && this.config.appKey) {
            this.isConfigured = true;
        } else {
            this.logger.warn('Setup required - Bridge not configured', 'SYSTEM');
        }
    }

    /**
     * Load mapping configuration file
     */
    _loadMapping() {
        try {
            if (fs.existsSync(this.mappingFile)) {
                const data = fs.readFileSync(this.mappingFile, 'utf8');
                const parsed = JSON.parse(data);
                this.mapping = this._validateMapping(parsed);
                this.logger.info(`Loaded ${this.mapping.length} device mappings`, 'SYSTEM');
            }
        } catch (error) {
            this.logger.error(`Failed to load mapping: ${error.message}`, 'SYSTEM');
            this.mapping = [];
        }
    }

    /**
     * Save configuration to file
     */
    save() {
        try {
            fs.writeFileSync(
                this.configFile,
                JSON.stringify(this.config, null, 4),
                'utf8'
            );
            this.logger.debug('Configuration saved', 'SYSTEM');
        } catch (error) {
            this.logger.error(`Failed to save config: ${error.message}`, 'SYSTEM');
            throw error;
        }
    }

    /**
     * Save mapping to file
     */
    saveMapping() {
        try {
            const validated = this._validateMapping(this.mapping);
            fs.writeFileSync(
                this.mappingFile,
                JSON.stringify(validated, null, 4),
                'utf8'
            );
            this.logger.debug('Mapping saved', 'SYSTEM');
        } catch (error) {
            this.logger.error(`Failed to save mapping: ${error.message}`, 'SYSTEM');
            throw error;
        }
    }

    /**
     * Update configuration values
     * @param {Object} updates - Configuration updates
     */
    update(updates) {
        this.config = { ...this.config, ...updates };

        // Update configured status
        if (this.config.bridgeIp && this.config.appKey) {
            this.isConfigured = true;
        }

        this.save();
    }

    /**
     * Update mapping
     * @param {Array} newMapping - New mapping array
     */
    updateMapping(newMapping) {
        this.mapping = this._validateMapping(newMapping);
        this.saveMapping();
    }

    /**
     * Get configuration value
     * @param {string} key - Configuration key
     * @returns {*} Configuration value
     */
    get(key) {
        return this.config[key];
    }

    /**
     * Set configuration value
     * @param {string} key - Configuration key
     * @param {*} value - Configuration value
     */
    set(key, value) {
        this.config[key] = value;
    }

    /**
     * Get all configuration
     * @returns {Object} Configuration object
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Get mapping
     * @returns {Array} Mapping array
     */
    getMapping() {
        return [...this.mapping];
    }

    /**
     * Check if bridge is configured
     * @returns {boolean} True if configured
     */
    isReady() {
        return this.isConfigured;
    }

    /**
     * Set debug mode
     * @param {boolean} enabled - Enable debug mode
     */
    setDebugMode(enabled) {
        this.config.debug = enabled;
        this.logger.setDebugMode(enabled);
        this.save();
    }
}

module.exports = Config;
