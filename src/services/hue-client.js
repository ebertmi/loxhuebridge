/**
 * Hue Client Service
 * Manages communication with Philips Hue Bridge V2 API
 */

const axios = require('axios');
const https = require('https');
const { mapRange, kelvinToMirek, rgbToXy, rgbToMirekFallback } = require('../utils/color');
const CONSTANTS = require('../constants');

class HueClient {
    constructor(config, logger, rateLimiter) {
        this.config = config;
        this.logger = logger;
        this.rateLimiter = rateLimiter;

        // Create HTTPS agent with optional certificate pinning
        this.httpsAgent = this._createHttpsAgent();

        // Device and capability caches
        this.serviceToDeviceMap = {};
        this.lightCapabilities = {};

        // Command state for handling queued commands
        this.commandState = {};
    }

    /**
     * Create HTTPS agent with optional certificate pinning
     * @returns {https.Agent} Configured HTTPS agent
     */
    _createHttpsAgent() {
        const certPinningEnabled = this.config.get('certPinningEnabled');
        const certFingerprint = this.config.get('certFingerprint');

        if (certPinningEnabled && certFingerprint) {
            this.logger.info('Certificate pinning enabled for Hue Bridge', 'HUE');

            return new https.Agent({
                rejectUnauthorized: true,
                checkServerIdentity: (host, cert) => {
                    // Normalize fingerprints (remove colons, convert to uppercase)
                    const expectedFingerprint = certFingerprint.replace(/:/g, '').toUpperCase();
                    const actualFingerprint = cert.fingerprint256.replace(/:/g, '').toUpperCase();

                    if (actualFingerprint !== expectedFingerprint) {
                        const error = new Error(
                            `Certificate fingerprint mismatch!\n` +
                            `Expected: ${certFingerprint}\n` +
                            `Actual: ${cert.fingerprint256}`
                        );
                        this.logger.error(error.message, 'HUE');
                        throw error;
                    }

                    this.logger.debug('Certificate fingerprint validated', 'HUE');
                }
            });
        } else {
            // Certificate pinning disabled - use insecure mode
            if (!certPinningEnabled) {
                this.logger.warn(
                    'Certificate validation DISABLED - HTTPS traffic is vulnerable to MITM attacks',
                    'HUE'
                );
            }

            return new https.Agent({
                rejectUnauthorized: false
            });
        }
    }

    /**
     * Get base URL for Hue Bridge API
     * @returns {string} Base URL
     */
    _getBaseUrl() {
        const bridgeIp = this.config.get('bridgeIp');
        return `https://${bridgeIp}/clip/v2/resource`;
    }

    /**
     * Get request headers
     * @returns {Object} Headers object
     */
    _getHeaders() {
        return {
            'hue-application-key': this.config.get('appKey')
        };
    }

    /**
     * Determine if an error is retryable
     * @param {Error} error - Error object
     * @returns {boolean} True if error should trigger a retry
     */
    _isRetryableError(error) {
        // Network errors (ECONNRESET, ETIMEDOUT, etc.)
        if (error.code && CONSTANTS.RETRY.RETRYABLE_ERROR_CODES.includes(error.code)) {
            return true;
        }

        // HTTP status codes (5xx, 408, 429)
        if (error.response && error.response.status) {
            return CONSTANTS.RETRY.RETRYABLE_STATUS_CODES.includes(error.response.status);
        }

        return false;
    }

    /**
     * Calculate exponential backoff delay
     * @param {number} attempt - Current attempt number (0-indexed)
     * @returns {number} Delay in milliseconds
     */
    _getBackoffDelay(attempt) {
        const delay = CONSTANTS.RETRY.INITIAL_BACKOFF_MS *
                     Math.pow(CONSTANTS.RETRY.BACKOFF_MULTIPLIER, attempt);
        return Math.min(delay, CONSTANTS.RETRY.MAX_BACKOFF_MS);
    }

    /**
     * Sleep for specified duration
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Make authenticated request to Hue Bridge with retry logic
     * @param {string} method - HTTP method
     * @param {string} path - API path
     * @param {Object} data - Request data
     * @returns {Promise<Object>} Response data
     */
    async _request(method, path, data = null) {
        const url = `${this._getBaseUrl()}${path}`;
        const config = {
            method,
            url,
            headers: this._getHeaders(),
            httpsAgent: this.httpsAgent
        };

        if (data) {
            config.data = data;
        }

        let lastError = null;

        for (let attempt = 0; attempt < CONSTANTS.RETRY.MAX_ATTEMPTS; attempt++) {
            try {
                const response = await axios(config);

                // Success - reset backoff if this was a retry
                if (attempt > 0) {
                    this.logger.success(
                        `Request succeeded after ${attempt} ${attempt === 1 ? 'retry' : 'retries'}`,
                        'HUE'
                    );
                }

                return response.data;
            } catch (error) {
                lastError = error;

                // Check if we should retry this error
                const shouldRetry = this._isRetryableError(error);
                const isLastAttempt = attempt === CONSTANTS.RETRY.MAX_ATTEMPTS - 1;

                if (!shouldRetry || isLastAttempt) {
                    // Don't retry, or this was the last attempt
                    this.logger.hueError(error, 'HUE');
                    throw error;
                }

                // Calculate backoff delay
                const delay = this._getBackoffDelay(attempt);

                // Log retry attempt
                const errorContext = error.response
                    ? `HTTP ${error.response.status}`
                    : error.code || 'Network error';

                this.logger.warn(
                    `${errorContext} - Retry ${attempt + 1}/${CONSTANTS.RETRY.MAX_ATTEMPTS} in ${delay}ms (${path})`,
                    'HUE'
                );

                // Wait before retrying
                await this._sleep(delay);
            }
        }

        // This shouldn't be reached, but just in case
        this.logger.hueError(lastError, 'HUE');
        throw lastError;
    }

    /**
     * Build device to service mapping and light capabilities
     * Essential for event processing and device management
     * @returns {Promise<void>}
     */
    async buildDeviceMap() {
        if (!this.config.isReady()) {
            return;
        }

        try {
            const [devicesData, lightsData] = await Promise.all([
                this._request('GET', '/device'),
                this._request('GET', '/light')
            ]);

            // Reset maps
            this.serviceToDeviceMap = {};
            this.lightCapabilities = {};

            // Build service to device mapping
            if (devicesData.data) {
                devicesData.data.forEach(device => {
                    device.services.forEach(service => {
                        this.serviceToDeviceMap[service.rid] = {
                            deviceId: device.id,
                            deviceName: device.metadata.name,
                            serviceType: service.rtype
                        };
                    });
                });
            }

            // Build light capabilities map
            if (lightsData.data) {
                lightsData.data.forEach(light => {
                    this.lightCapabilities[light.id] = {
                        supportsColor: !!light.color,
                        supportsCt: !!light.color_temperature,
                        min: light.color_temperature?.mirek_schema?.mirek_minimum || CONSTANTS.COLOR.HUE_MIN_MIREK,
                        max: light.color_temperature?.mirek_schema?.mirek_maximum || CONSTANTS.COLOR.HUE_MAX_MIREK
                    };
                });
            }

            this.logger.success('Device map built successfully', 'HUE');
        } catch (error) {
            this.logger.error(`Failed to build device map: ${error.message}`, 'HUE');
        }
    }

    /**
     * Get all available targets (lights, groups, sensors, buttons)
     * @returns {Promise<Array>} Array of target devices
     */
    async getTargets() {
        await this.buildDeviceMap();

        try {
            const [lightsRes, roomsRes, zonesRes, devicesRes] = await Promise.all([
                this._request('GET', '/light'),
                this._request('GET', '/room'),
                this._request('GET', '/zone'),
                this._request('GET', '/device')
            ]);

            const targets = [];

            // Add individual lights
            if (lightsRes.data) {
                lightsRes.data.forEach(light => {
                    targets.push({
                        uuid: light.id,
                        name: light.metadata.name,
                        type: 'light',
                        capabilities: this.lightCapabilities[light.id] || null
                    });
                });
            }

            // Add rooms and zones as groups
            const groups = [...(roomsRes.data || []), ...(zonesRes.data || [])];
            groups.forEach(group => {
                const groupedLightService = group.services.find(s => s.rtype === 'grouped_light');
                if (groupedLightService) {
                    targets.push({
                        uuid: groupedLightService.rid,
                        name: group.metadata.name,
                        type: 'group'
                    });
                }
            });

            // Add sensors and buttons from devices
            if (devicesRes.data) {
                devicesRes.data.forEach(device => {
                    // Motion sensors
                    const motionService = device.services.find(s => s.rtype === 'motion');
                    if (motionService) {
                        targets.push({
                            uuid: motionService.rid,
                            name: device.metadata.name,
                            type: 'sensor'
                        });
                    }

                    // Buttons (can be multiple per device)
                    const buttonServices = device.services.filter(s => s.rtype === 'button');
                    buttonServices.forEach((button, index) => {
                        const suffix = buttonServices.length > 1 ? ` (Taste ${index + 1})` : '';
                        targets.push({
                            uuid: button.rid,
                            name: `${device.metadata.name}${suffix}`,
                            type: 'button'
                        });
                    });

                    // Rotary encoder (Tap Dial)
                    const rotaryService = device.services.find(s => s.rtype === 'relative_rotary');
                    if (rotaryService) {
                        targets.push({
                            uuid: rotaryService.rid,
                            name: `${device.metadata.name} (Drehring)`,
                            type: 'button'
                        });
                    }
                });
            }

            // Sort alphabetically
            targets.sort((a, b) => a.name.localeCompare(b.name));

            return targets;
        } catch (error) {
            this.logger.error(`Failed to get targets: ${error.message}`, 'HUE');
            return [];
        }
    }

    /**
     * Build payload for light control command
     * @param {number} value - Control value from Loxone
     * @param {string} uuid - Light UUID
     * @param {number|null} forcedDuration - Override transition duration
     * @returns {Object} Command payload
     */
    buildLightPayload(value, uuid, forcedDuration = null) {
        const payload = {};
        const n = parseInt(value);
        const safeN = isNaN(n) ? 0 : n;

        // Simple on/off/dimming
        if (safeN === 0) {
            payload.on = { on: false };
        } else if (safeN === 1) {
            payload.on = { on: true };
        } else if (safeN > 1 && safeN <= 100) {
            payload.on = { on: true };
            payload.dimming = { brightness: safeN };
        } else {
            const valueStr = value.toString();

            // Color temperature format: 20BBBKKKK (brightness + kelvin)
            if (valueStr.startsWith('20') && valueStr.length >= 9) {
                const brightness = parseInt(valueStr.substring(2, 5));
                const kelvin = parseInt(valueStr.substring(5));

                let targetMirek = kelvinToMirek(kelvin);

                // Scale to light's supported range
                const caps = this.lightCapabilities[uuid];
                if (caps && caps.min && caps.max) {
                    const scaled = Math.round(mapRange(
                        targetMirek,
                        CONSTANTS.COLOR.LOXONE_MIN_MIREK,
                        CONSTANTS.COLOR.LOXONE_MAX_MIREK,
                        caps.min,
                        caps.max
                    ));
                    targetMirek = Math.max(caps.min, Math.min(caps.max, scaled));
                }

                if (brightness === 0) {
                    payload.on = { on: false };
                } else {
                    payload.on = { on: true };
                    payload.dimming = { brightness };
                    payload.color_temperature = { mirek: targetMirek };
                }
            } else {
                // RGB format: BBBGGGRRR (blue, green, red)
                const brightness = Math.floor(safeN / 1000000);
                const remainder = safeN % 1000000;
                const green = Math.floor(remainder / 1000);
                const red = remainder % 1000;
                const blue = brightness;
                const maxComponent = Math.max(red, green, blue);

                if (maxComponent === 0) {
                    payload.on = { on: false };
                } else {
                    const caps = this.lightCapabilities[uuid];
                    const supportsColor = caps ? caps.supportsColor : true;

                    if (!supportsColor && caps && caps.supportsCt) {
                        // Fallback: convert RGB to color temperature
                        const minMirek = caps.min || CONSTANTS.COLOR.HUE_MIN_MIREK;
                        const maxMirek = caps.max || CONSTANTS.COLOR.HUE_MAX_MIREK;
                        const targetMirek = rgbToMirekFallback(red, green, blue, minMirek, maxMirek);

                        payload.on = { on: true };
                        payload.dimming = { brightness: maxComponent };
                        payload.color_temperature = { mirek: targetMirek };

                        this.logger.debug(
                            `RGB Fallback: R${red} G${green} B${blue} -> ${targetMirek}m`,
                            'LIGHT'
                        );
                    } else {
                        // Full color support
                        payload.on = { on: true };
                        payload.dimming = { brightness: maxComponent };
                        payload.color = { xy: rgbToXy(red, green, blue) };
                    }
                }
            }
        }

        // Add transition time
        let duration = this.config.get('transitionTime') || 400;

        // Instant on for digital switches
        const isDigitalSwitch = Object.keys(payload).length === 1 && payload.on !== undefined;
        if (isDigitalSwitch && payload.on.on === true) {
            duration = 0;
        }

        // Override with forced duration
        if (forcedDuration !== null) {
            duration = forcedDuration;
        }

        if (duration > 0) {
            payload.dynamics = { duration };
        }

        return payload;
    }

    /**
     * Update light state with queueing
     * @param {string} uuid - Light UUID
     * @param {string} type - Resource type ('light' or 'grouped_light')
     * @param {Object} payload - Command payload
     * @param {string} loxName - Loxone device name
     * @returns {Promise<void>}
     */
    async updateLight(uuid, type, payload, loxName) {
        if (!this.commandState[uuid]) {
            this.commandState[uuid] = { busy: false, next: null };
        }

        if (this.commandState[uuid].busy) {
            this.commandState[uuid].next = payload;
            return;
        }

        this.commandState[uuid].busy = true;
        await this._sendToHueRecursive(uuid, type, payload, loxName);
    }

    /**
     * Recursively send commands to Hue, handling queued commands
     * @param {string} uuid - Light UUID
     * @param {string} type - Resource type
     * @param {Object} payload - Command payload
     * @param {string} loxName - Loxone device name
     * @returns {Promise<void>}
     */
    async _sendToHueRecursive(uuid, type, payload, loxName) {
        await this.rateLimiter.enqueue(type, async () => {
            try {
                const url = `/${type}/${uuid}`;
                this.logger.debug(`Hue command (${loxName}): ${JSON.stringify(payload)}`, 'LIGHT');

                await this._request('PUT', url, payload);

                // Update local status cache would be handled by caller
                this.logger.debug(`Light updated: ${loxName}`, 'LIGHT');
            } catch (error) {
                this.logger.hueError(error, 'LIGHT');
            } finally {
                // Process next queued command if exists
                if (this.commandState[uuid].next) {
                    const nextPayload = this.commandState[uuid].next;
                    this.commandState[uuid].next = null;
                    await this._sendToHueRecursive(uuid, type, nextPayload, loxName);
                } else {
                    this.commandState[uuid].busy = false;
                }
            }
        });
    }

    /**
     * Get current state of all lights
     * @returns {Promise<Array>} Array of light states
     */
    async getLightStates() {
        try {
            const response = await this._request('GET', '/light');
            return response.data || [];
        } catch (error) {
            this.logger.error(`Failed to get light states: ${error.message}`, 'HUE');
            return [];
        }
    }

    /**
     * Get all scenes from Hue Bridge with enriched data
     * @returns {Promise<Array>} Array of scenes with resolved light names and group info
     */
    async getScenes() {
        try {
            const [scenesRes, lightsRes, roomsRes, zonesRes] = await Promise.all([
                this._request('GET', '/scene'),
                this._request('GET', '/light'),
                this._request('GET', '/room'),
                this._request('GET', '/zone')
            ]);

            // Build light lookup map (UUID -> name)
            const lightMap = {};
            if (lightsRes.data) {
                lightsRes.data.forEach(light => {
                    lightMap[light.id] = light.metadata.name;
                });
            }

            // Build group lookup map (UUID -> name and type)
            const groupMap = {};
            const allGroups = [...(roomsRes.data || []), ...(zonesRes.data || [])];
            allGroups.forEach(group => {
                groupMap[group.id] = {
                    name: group.metadata.name,
                    type: group.type // 'room' or 'zone'
                };
            });

            const scenes = [];

            if (scenesRes.data) {
                scenesRes.data.forEach(scene => {
                    // Extract lights involved in this scene
                    const lights = [];
                    if (scene.actions && Array.isArray(scene.actions)) {
                        scene.actions.forEach(action => {
                            if (action.target && action.target.rid) {
                                const lightName = lightMap[action.target.rid];
                                if (lightName) {
                                    lights.push({
                                        uuid: action.target.rid,
                                        name: lightName,
                                        action: action.action // on/off, dimming, color info
                                    });
                                }
                            }
                        });
                    }

                    // Get group/room information
                    let groupInfo = null;
                    if (scene.group && scene.group.rid) {
                        const group = groupMap[scene.group.rid];
                        if (group) {
                            groupInfo = {
                                uuid: scene.group.rid,
                                name: group.name,
                                type: group.type
                            };
                        }
                    }

                    scenes.push({
                        uuid: scene.id,
                        name: scene.metadata ? scene.metadata.name : 'Unnamed Scene',
                        lights: lights,
                        lightCount: lights.length,
                        group: groupInfo,
                        speed: scene.speed || null,
                        palette: scene.palette || null
                    });
                });
            }

            // Sort alphabetically by name
            scenes.sort((a, b) => a.name.localeCompare(b.name));

            return scenes;
        } catch (error) {
            this.logger.error(`Failed to get scenes: ${error.message}`, 'HUE');
            return [];
        }
    }

    /**
     * Activate a scene
     * @param {string} sceneId - Scene UUID
     * @returns {Promise<void>}
     */
    async activateScene(sceneId) {
        try {
            this.logger.info(`Activating scene ${sceneId}`, 'HUE');

            await this._request('PUT', `/scene/${sceneId}`, {
                recall: {
                    action: 'active'
                }
            });

            this.logger.success(`Scene ${sceneId} activated`, 'HUE');
        } catch (error) {
            this.logger.error(`Failed to activate scene ${sceneId}: ${error.message}`, 'HUE');
            throw error;
        }
    }

    /**
     * Deactivate a scene by turning off all lights in the scene
     * @param {string} sceneId - Scene UUID
     * @returns {Promise<void>}
     */
    async deactivateScene(sceneId) {
        try {
            this.logger.info(`Deactivating scene ${sceneId}`, 'HUE');

            // Get scene details to find lights
            const sceneRes = await this._request('GET', `/scene/${sceneId}`);
            const scene = sceneRes.data && sceneRes.data.length > 0 ? sceneRes.data[0] : sceneRes.data;

            if (!scene || !scene.actions || scene.actions.length === 0) {
                this.logger.warn(`Scene ${sceneId} has no lights to turn off`, 'HUE');
                return;
            }

            // Turn off all lights in the scene
            const turnOffPromises = scene.actions.map(action => {
                if (action.target && action.target.rid) {
                    return this._request('PUT', `/light/${action.target.rid}`, {
                        on: { on: false }
                    }).catch(err => {
                        this.logger.error(`Failed to turn off light ${action.target.rid}: ${err.message}`, 'HUE');
                    });
                }
            });

            await Promise.all(turnOffPromises.filter(p => p));
            this.logger.success(`Scene ${sceneId} deactivated (lights turned off)`, 'HUE');
        } catch (error) {
            this.logger.error(`Failed to deactivate scene ${sceneId}: ${error.message}`, 'HUE');
            throw error;
        }
    }

    /**
     * Get diagnostics information
     * @returns {Promise<Array>} Diagnostics data
     */
    async getDiagnostics() {
        try {
            const [zigbeeRes, devicesRes, powerRes] = await Promise.all([
                this._request('GET', '/zigbee_connectivity'),
                this._request('GET', '/device'),
                this._request('GET', '/device_power')
            ]);

            const deviceMap = {};
            devicesRes.data.forEach(d => {
                deviceMap[d.id] = d;
            });

            const powerMap = {};
            if (powerRes.data) {
                powerRes.data.forEach(p => {
                    if (p.owner && p.owner.rid) {
                        powerMap[p.owner.rid] = p.power_state;
                    }
                });
            }

            const result = [];

            devicesRes.data.forEach(device => {
                const deviceId = device.id;
                const zigbee = zigbeeRes.data.find(z => z.owner.rid === deviceId);
                const power = powerMap[deviceId];

                // Determine device type
                let type = 'Sonstiges';
                if (device.services.some(s => s.rtype === 'light')) {
                    type = 'Licht';
                } else if (device.services.some(s => s.rtype === 'motion')) {
                    type = 'Sensor';
                } else if (device.services.some(s => s.rtype === 'button' || s.rtype === 'relative_rotary')) {
                    type = 'Taster';
                } else if (device.product_data.product_name.toLowerCase().includes('bridge')) {
                    type = 'Bridge';
                }

                // Skip devices without diagnostics data (unless Bridge)
                if (!zigbee && !power && type !== 'Bridge') {
                    return;
                }

                result.push({
                    name: device.metadata.name,
                    model: device.product_data.product_name,
                    type: type,
                    status: zigbee ? zigbee.status : (type === 'Bridge' ? 'connected' : 'unknown'),
                    mac: zigbee ? zigbee.mac_address : '-',
                    battery: power ? power.battery_level : null,
                    last_seen: zigbee ? zigbee.last_seen : null
                });
            });

            // Sort: critical issues first, then by type, then by name
            result.sort((a, b) => {
                const aCritical = (a.status === 'connectivity_issue' || a.status === 'disconnected') ||
                                 (a.battery !== null && a.battery <= 20);
                const bCritical = (b.status === 'connectivity_issue' || b.status === 'disconnected') ||
                                 (b.battery !== null && b.battery <= 20);

                if (aCritical && !bCritical) return -1;
                if (!aCritical && bCritical) return 1;
                if (a.type !== b.type) return a.type.localeCompare(b.type);
                return a.name.localeCompare(b.name);
            });

            return result;
        } catch (error) {
            this.logger.error(`Diagnostics error: ${error.message}`, 'SYSTEM');
            throw error;
        }
    }

    /**
     * Get device map for event processing
     * @returns {Object} Service to device map
     */
    getServiceToDeviceMap() {
        return this.serviceToDeviceMap;
    }

    /**
     * Get light capabilities
     * @returns {Object} Light capabilities map
     */
    getLightCapabilities() {
        return this.lightCapabilities;
    }
}

module.exports = HueClient;
