/**
 * Hue Client Service
 * Manages communication with Philips Hue Bridge V2 API
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import https from 'https';
import { mapRange, kelvinToMirek, rgbToXy, rgbToMirekFallback } from '../utils/color';
import CONSTANTS from '../constants';
import Config from '../config';
import Logger from '../utils/logger';
import RateLimiter from './rate-limiter';

/**
 * Service to device mapping structure
 */
interface ServiceToDeviceMapEntry {
  deviceId: string;
  deviceName: string;
  serviceType: string;
}

/**
 * Light capabilities structure
 */
interface LightCapabilities {
  supportsColor: boolean;
  supportsCt: boolean;
  min: number;
  max: number;
}

/**
 * Command state for queueing
 */
interface CommandState {
  busy: boolean;
  next: HuePayload | null;
}

/**
 * Hue API response structure
 */
interface HueResponse {
  data?: any[];
  errors?: any[];
  [key: string]: unknown;
}

/**
 * Hue target device structure
 */
interface HueTarget {
  uuid: string;
  name: string;
  type: 'light' | 'group' | 'sensor' | 'button';
  capabilities?: LightCapabilities | null;
}

/**
 * Hue light state payload
 */
interface HuePayload {
  on?: { on: boolean };
  dimming?: { brightness: number };
  color?: { xy: { x: number; y: number } };
  color_temperature?: { mirek: number };
  dynamics?: { duration: number };
}

/**
 * Scene action structure
 */
interface SceneAction {
  target?: { rid: string; rtype?: string };
  action?: Record<string, unknown>;
}

/**
 * Scene information structure
 */
interface SceneInfo {
  uuid: string;
  name: string;
  lights: Array<{
    uuid: string;
    name: string;
    action: Record<string, unknown>;
  }>;
  lightCount: number;
  group: {
    uuid: string;
    name: string;
    type: string;
  } | null;
  speed: unknown | null;
  palette: unknown | null;
}

/**
 * Diagnostic information structure
 */
interface DiagnosticsInfo {
  name: string;
  model: string;
  type: string;
  status: string;
  mac: string;
  battery: number | null;
  last_seen: unknown | null;
}

class HueClient {
  private config: Config;
  private logger: Logger;
  private rateLimiter: RateLimiter;
  private httpsAgent: https.Agent;
  private serviceToDeviceMap: Record<string, ServiceToDeviceMapEntry>;
  private lightCapabilities: Record<string, LightCapabilities>;
  private commandState: Record<string, CommandState>;

  constructor(config: Config, logger: Logger, rateLimiter: RateLimiter) {
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
   * @returns Configured HTTPS agent
   */
  private _createHttpsAgent(): https.Agent {
    const certPinningEnabled = this.config.get('certPinningEnabled');
    const certFingerprint = this.config.get('certFingerprint');

    if (certPinningEnabled && certFingerprint) {
      this.logger.info('Certificate pinning enabled for Hue Bridge', 'HUE');

      return new https.Agent({
        rejectUnauthorized: true,
        checkServerIdentity: (_host, cert) => {
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
            return error;
          }

          this.logger.debug('Certificate fingerprint validated', 'HUE');
          return undefined;
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
   * @returns Base URL
   */
  private _getBaseUrl(): string {
    const bridgeIp = this.config.get('bridgeIp');
    return `https://${bridgeIp}/clip/v2/resource`;
  }

  /**
   * Get request headers
   * @returns Headers object
   */
  private _getHeaders(): Record<string, string> {
    return {
      'hue-application-key': this.config.get('appKey') || ''
    };
  }

  /**
   * Determine if an error is retryable
   * @param error - Error object
   * @returns True if error should trigger a retry
   */
  private _isRetryableError(error: AxiosError): boolean {
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
   * @param attempt - Current attempt number (0-indexed)
   * @returns Delay in milliseconds
   */
  private _getBackoffDelay(attempt: number): number {
    const delay = CONSTANTS.RETRY.INITIAL_BACKOFF_MS *
                 Math.pow(CONSTANTS.RETRY.BACKOFF_MULTIPLIER, attempt);
    return Math.min(delay, CONSTANTS.RETRY.MAX_BACKOFF_MS);
  }

  /**
   * Sleep for specified duration
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after delay
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make authenticated request to Hue Bridge with retry logic
   * @param method - HTTP method
   * @param path - API path
   * @param data - Request data
   * @returns Response data
   */
  private async _request(method: string, path: string, data: any = null): Promise<HueResponse> {
    const url = `${this._getBaseUrl()}${path}`;
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: this._getHeaders(),
      httpsAgent: this.httpsAgent
    };

    if (data) {
      config.data = data;
    }

    let lastError: AxiosError | null = null;

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
        lastError = error as AxiosError;

        // Check if we should retry this error
        const shouldRetry = this._isRetryableError(lastError);
        const isLastAttempt = attempt === CONSTANTS.RETRY.MAX_ATTEMPTS - 1;

        if (!shouldRetry || isLastAttempt) {
          // Don't retry, or this was the last attempt
          this.logger.hueError(lastError, 'HUE');
          throw lastError;
        }

        // Calculate backoff delay
        const delay = this._getBackoffDelay(attempt);

        // Log retry attempt
        const errorContext = lastError.response
          ? `HTTP ${lastError.response.status}`
          : lastError.code || 'Network error';

        this.logger.warn(
          `${errorContext} - Retry ${attempt + 1}/${CONSTANTS.RETRY.MAX_ATTEMPTS} in ${delay}ms (${path})`,
          'HUE'
        );

        // Wait before retrying
        await this._sleep(delay);
      }
    }

    // This shouldn't be reached, but just in case
    this.logger.hueError(lastError!, 'HUE');
    throw lastError;
  }

  /**
   * Build device to service mapping and light capabilities
   * Essential for event processing and device management
   */
  async buildDeviceMap(): Promise<void> {
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
        devicesData.data.forEach((device: any) => {
          device.services.forEach((service: any) => {
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
        lightsData.data.forEach((light: any) => {
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to build device map: ${message}`, 'HUE');
    }
  }

  /**
   * Get all available targets (lights, groups, sensors, buttons)
   * @returns Array of target devices
   */
  async getTargets(): Promise<HueTarget[]> {
    await this.buildDeviceMap();

    try {
      const [lightsRes, roomsRes, zonesRes, devicesRes] = await Promise.all([
        this._request('GET', '/light'),
        this._request('GET', '/room'),
        this._request('GET', '/zone'),
        this._request('GET', '/device')
      ]);

      const targets: HueTarget[] = [];

      // Add individual lights
      if (lightsRes.data) {
        lightsRes.data.forEach((light: any) => {
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
      groups.forEach((group: any) => {
        const groupedLightService = group.services.find((s: any) => s.rtype === 'grouped_light');
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
        devicesRes.data.forEach((device: any) => {
          // Motion sensors
          const motionService = device.services.find((s: any) => s.rtype === 'motion');
          if (motionService) {
            targets.push({
              uuid: motionService.rid,
              name: device.metadata.name,
              type: 'sensor'
            });
          }

          // Buttons (can be multiple per device)
          const buttonServices = device.services.filter((s: any) => s.rtype === 'button');
          buttonServices.forEach((button: any, index: number) => {
            const suffix = buttonServices.length > 1 ? ` (Taste ${index + 1})` : '';
            targets.push({
              uuid: button.rid,
              name: `${device.metadata.name}${suffix}`,
              type: 'button'
            });
          });

          // Rotary encoder (Tap Dial)
          const rotaryService = device.services.find((s: any) => s.rtype === 'relative_rotary');
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get targets: ${message}`, 'HUE');
      return [];
    }
  }

  /**
   * Build payload for light control command
   * @param value - Control value from Loxone
   * @param uuid - Light UUID
   * @param forcedDuration - Override transition duration
   * @returns Command payload
   */
  buildLightPayload(value: string | number, uuid: string, forcedDuration: number | null = null): HuePayload {
    const payload: HuePayload = {};
    const n = parseInt(String(value));
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
   * @param uuid - Light UUID
   * @param type - Resource type ('light' or 'grouped_light')
   * @param payload - Command payload
   * @param loxName - Loxone device name
   */
  async updateLight(uuid: string, type: string, payload: HuePayload, loxName: string): Promise<void> {
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
   * @param uuid - Light UUID
   * @param type - Resource type
   * @param payload - Command payload
   * @param loxName - Loxone device name
   */
  private async _sendToHueRecursive(uuid: string, type: string, payload: HuePayload, loxName: string): Promise<void> {
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
   * @returns Array of light states
   */
  async getLightStates(): Promise<any[]> {
    try {
      const response = await this._request('GET', '/light');
      return response.data || [];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get light states: ${message}`, 'HUE');
      return [];
    }
  }

  /**
   * Get all scenes from Hue Bridge with enriched data
   * @returns Array of scenes with resolved light names and group info
   */
  async getScenes(): Promise<SceneInfo[]> {
    try {
      const [scenesRes, lightsRes, roomsRes, zonesRes] = await Promise.all([
        this._request('GET', '/scene'),
        this._request('GET', '/light'),
        this._request('GET', '/room'),
        this._request('GET', '/zone')
      ]);

      // Build light lookup map (UUID -> name)
      const lightMap: Record<string, string> = {};
      if (lightsRes.data) {
        lightsRes.data.forEach((light: any) => {
          lightMap[light.id] = light.metadata.name;
        });
      }

      // Build group lookup map (UUID -> name and type)
      const groupMap: Record<string, { name: string; type: string }> = {};
      const allGroups = [...(roomsRes.data || []), ...(zonesRes.data || [])];
      allGroups.forEach((group: any) => {
        groupMap[group.id] = {
          name: group.metadata.name,
          type: group.type // 'room' or 'zone'
        };
      });

      const scenes: SceneInfo[] = [];

      if (scenesRes.data) {
        scenesRes.data.forEach((scene: any) => {
          // Extract lights involved in this scene
          const lights: Array<{ uuid: string; name: string; action: Record<string, unknown> }> = [];
          if (scene.actions && Array.isArray(scene.actions)) {
            scene.actions.forEach((action: SceneAction) => {
              if (action.target && action.target.rid) {
                const lightName = lightMap[action.target.rid];
                if (lightName) {
                  lights.push({
                    uuid: action.target.rid,
                    name: lightName,
                    action: action.action || {} // on/off, dimming, color info
                  });
                }
              }
            });
          }

          // Get group/room information
          let groupInfo: { uuid: string; name: string; type: string } | null = null;
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get scenes: ${message}`, 'HUE');
      return [];
    }
  }

  /**
   * Activate a scene
   * @param sceneId - Scene UUID
   */
  async activateScene(sceneId: string): Promise<void> {
    try {
      this.logger.info(`Activating scene ${sceneId}`, 'HUE');

      await this._request('PUT', `/scene/${sceneId}`, {
        recall: {
          action: 'active'
        }
      });

      this.logger.success(`Scene ${sceneId} activated`, 'HUE');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to activate scene ${sceneId}: ${message}`, 'HUE');
      throw error;
    }
  }

  /**
   * Deactivate a scene by turning off all lights in the scene
   * @param sceneId - Scene UUID
   */
  async deactivateScene(sceneId: string): Promise<void> {
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
      const turnOffPromises = scene.actions.map((action: SceneAction) => {
        if (action.target && action.target.rid) {
          return this._request('PUT', `/light/${action.target.rid}`, {
            on: { on: false }
          }).catch(err => {
            const message = err instanceof Error ? err.message : 'Unknown error';
            this.logger.error(`Failed to turn off light ${action.target!.rid}: ${message}`, 'HUE');
          });
        }
        return Promise.resolve();
      });

      await Promise.all(turnOffPromises);
      this.logger.success(`Scene ${sceneId} deactivated (lights turned off)`, 'HUE');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to deactivate scene ${sceneId}: ${message}`, 'HUE');
      throw error;
    }
  }

  /**
   * Get diagnostics information
   * @returns Diagnostics data
   */
  async getDiagnostics(): Promise<DiagnosticsInfo[]> {
    try {
      const [zigbeeRes, devicesRes, powerRes] = await Promise.all([
        this._request('GET', '/zigbee_connectivity'),
        this._request('GET', '/device'),
        this._request('GET', '/device_power')
      ]);

      const deviceMap: Record<string, any> = {};
      devicesRes.data?.forEach((d: any) => {
        deviceMap[d.id] = d;
      });

      const powerMap: Record<string, any> = {};
      if (powerRes.data) {
        powerRes.data.forEach((p: any) => {
          if (p.owner && p.owner.rid) {
            powerMap[p.owner.rid] = p.power_state;
          }
        });
      }

      const result: DiagnosticsInfo[] = [];

      devicesRes.data?.forEach((device: any) => {
        const deviceId = device.id;
        const zigbee = zigbeeRes.data?.find((z: any) => z.owner.rid === deviceId);
        const power = powerMap[deviceId];

        // Determine device type
        let type = 'Sonstiges';
        if (device.services.some((s: any) => s.rtype === 'light')) {
          type = 'Licht';
        } else if (device.services.some((s: any) => s.rtype === 'motion')) {
          type = 'Sensor';
        } else if (device.services.some((s: any) => s.rtype === 'button' || s.rtype === 'relative_rotary')) {
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Diagnostics error: ${message}`, 'SYSTEM');
      throw error;
    }
  }

  /**
   * Get device map for event processing
   * @returns Service to device map
   */
  getServiceToDeviceMap(): Record<string, ServiceToDeviceMapEntry> {
    return this.serviceToDeviceMap;
  }

  /**
   * Get light capabilities
   * @returns Light capabilities map
   */
  getLightCapabilities(): Record<string, LightCapabilities> {
    return this.lightCapabilities;
  }
}

export default HueClient;
