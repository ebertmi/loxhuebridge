/**
 * Event Stream Service
 * Handles Server-Sent Events (SSE) from Hue Bridge
 * Processes real-time device state changes
 */

import axios, { AxiosResponse } from 'axios';
import { IncomingMessage } from 'http';
import { xyToHex, mirekToHex, hueLightToLux } from '../utils/color';
import CONSTANTS from '../constants';
import Config from '../config';
import Logger from '../utils/logger';
import HueClient from './hue-client';
import LoxoneUDP from './loxone-udp';
import StatusManager from './status-manager';
import BidirectionalSyncManager from './bidirectional-sync';
import { DeviceMapping } from '../types';

/**
 * Hue event structure
 */
interface HueEvent {
  type: string;
  data: DeviceEventData[];
}

/**
 * Device event data from Hue
 */
interface DeviceEventData {
  id: string;
  motion?: {
    motion: boolean;
  };
  temperature?: {
    temperature: number;
  };
  light?: {
    light_level: number;
  };
  on?: {
    on: boolean;
  };
  dimming?: {
    brightness: number;
  };
  button?: {
    last_event: string;
  };
  power_state?: {
    battery_level: number;
  };
  relative_rotary?: {
    rotary_report?: {
      rotation?: {
        direction: string;
      };
    };
    last_event?: {
      rotation?: {
        direction: string;
      };
    };
    rotation?: {
      direction: string;
    };
  };
  color?: {
    xy: {
      x: number;
      y: number;
    };
  };
  color_temperature?: {
    mirek: number;
  };
}

/**
 * Light state structure
 */
interface LightState {
  id: string;
  on?: {
    on: boolean;
  };
  dimming?: {
    brightness: number;
  };
  color?: {
    xy: {
      x: number;
      y: number;
    };
  };
  color_temperature?: {
    mirek: number;
  };
}

/**
 * Event stream status
 */
interface EventStreamStatus {
  active: boolean;
  healthy: boolean;
  lastEvent: number;
  reconnectAttempts: number;
  timeSinceLastEvent: number;
}

class EventStream {
  private config: Config;
  private logger: Logger;
  private hueClient: HueClient;
  private loxoneUdp: LoxoneUDP;
  private statusManager: StatusManager;
  private bidirectionalSync: BidirectionalSyncManager | null;
  private isActive: boolean;
  private reconnectAttempts: number;
  private lastSuccessfulEvent: number;

  constructor(
    config: Config,
    logger: Logger,
    hueClient: HueClient,
    loxoneUdp: LoxoneUDP,
    statusManager: StatusManager,
    bidirectionalSync: BidirectionalSyncManager | null = null
  ) {
    this.config = config;
    this.logger = logger;
    this.hueClient = hueClient;
    this.loxoneUdp = loxoneUdp;
    this.statusManager = statusManager;
    this.bidirectionalSync = bidirectionalSync;

    this.isActive = false;
    this.reconnectAttempts = 0;
    this.lastSuccessfulEvent = Date.now();
  }

  /**
   * Set bidirectional sync manager (can be set after construction)
   */
  setBidirectionalSync(bidirectionalSync: BidirectionalSyncManager): void {
    this.bidirectionalSync = bidirectionalSync;
    this.logger.debug('BidirectionalSync manager attached to EventStream', 'SYSTEM');
  }

  /**
   * Calculate exponential backoff delay
   */
  private _getBackoffDelay(): number {
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      CONSTANTS.RECONNECT.MAX_BACKOFF_MS
    );
    this.reconnectAttempts++;
    return delay;
  }

  /**
   * Reset backoff counter on successful connection
   */
  private _resetBackoff(): void {
    this.reconnectAttempts = 0;
  }

  /**
   * Process Hue events and update status/send to Loxone
   */
  private _processEvents(events: HueEvent[]): void {
    const mapping = this.config.getMapping();
    const serviceToDeviceMap = this.hueClient.getServiceToDeviceMap();

    events.forEach(event => {
      if (event.type !== 'update' && event.type !== 'add') {
        return;
      }

      event.data.forEach(data => {
        // Find mapping entry for this device
        const entry = mapping.find(m => m.hue_uuid === data.id) || mapping.find(m => {
          const dataMeta = serviceToDeviceMap[data.id];
          const mapMeta = serviceToDeviceMap[m.hue_uuid];
          return dataMeta && mapMeta && dataMeta.deviceId === mapMeta.deviceId;
        });

        // Determine log category
        let category = 'SYSTEM';
        if (entry) {
          if (entry.hue_type === 'light' || entry.hue_type === 'group') {
            category = 'LIGHT';
          } else if (entry.hue_type === 'sensor') {
            category = 'SENSOR';
          } else if (entry.hue_type === 'button') {
            category = 'BUTTON';
          }
        } else if (data.motion) {
          category = 'SENSOR';
        } else if (data.button) {
          category = 'BUTTON';
        } else if (data.on) {
          category = 'LIGHT';
        }

        if (!entry) {
          return;
        }

        const loxName = entry.loxone_name;

        // Process different event types
        this._processDeviceEvent(data, loxName, category, entry);
      });
    });

    // Update last successful event timestamp
    this.lastSuccessfulEvent = Date.now();
  }

  /**
   * Process individual device event
   */
  private _processDeviceEvent(
    data: DeviceEventData,
    loxName: string,
    category: string,
    entry: DeviceMapping
  ): void {
    // Motion sensor
    if (data.motion && data.motion.motion !== undefined) {
      this.statusManager.update(loxName, 'motion', data.motion.motion ? 1 : 0, entry);
      if (this.config.get('debug')) {
        this.logger.debug(`Event: ${loxName} Motion ${data.motion.motion}`, category);
      }
    }

    // Temperature sensor
    if (data.temperature) {
      this.statusManager.update(loxName, 'temp', data.temperature.temperature, entry);
    }

    // Light level sensor
    if (data.light) {
      const lux = hueLightToLux(data.light.light_level);
      this.statusManager.update(loxName, 'lux', lux, entry);
    }

    // Light on/off state
    if (data.on) {
      this.statusManager.update(loxName, 'on', data.on.on ? 1 : 0, entry);
      if (this.config.get('debug')) {
        this.logger.debug(`Event: ${loxName} On=${data.on.on}`, category);
      }
    }

    // Light brightness
    if (data.dimming) {
      this.statusManager.update(loxName, 'bri', data.dimming.brightness, entry);
    }

    // Button events (with filtering)
    if (data.button) {
      const evt = data.button.last_event;

      // Only process meaningful button events
      if (evt === 'short_release' || evt === 'long_press') {
        this.statusManager.update(loxName, 'button', evt, entry);
        this.logger.debug(`Event: ${loxName} Button=${evt}`, category);
      } else if (this.config.get('debug')) {
        this.logger.debug(`Ignored Event: ${loxName} (${evt})`, category);
      }
    }

    // Battery level
    if (data.power_state) {
      this.statusManager.update(loxName, 'bat', data.power_state.battery_level, entry);
    }

    // Rotary encoder (Tap Dial)
    if (data.relative_rotary) {
      const rotaryData = data.relative_rotary.rotary_report ||
                        data.relative_rotary.last_event ||
                        data.relative_rotary;

      if (rotaryData && rotaryData.rotation) {
        const direction = rotaryData.rotation.direction === 'clock_wise' ? 'cw' : 'ccw';

        // Send directly via UDP (bypass cache for events)
        this.loxoneUdp.send(loxName, 'rotary', direction, category);
        this.logger.debug(`Event: ${loxName} Dial=${direction}`, category);
      }
    }

    // Color (XY format)
    if (data.color && data.color.xy) {
      const hex = xyToHex(data.color.xy.x, data.color.xy.y);
      this.statusManager.update(loxName, 'hex', hex, entry);
    }

    // Color temperature
    if (data.color_temperature && data.color_temperature.mirek) {
      const hex = mirekToHex(data.color_temperature.mirek);
      this.statusManager.update(loxName, 'hex', hex, entry);
    }

    // Notify bidirectional sync for light/group changes
    if (this.bidirectionalSync && (entry.hue_type === 'light' || entry.hue_type === 'group')) {
      // Only notify for relevant light changes (not sensors/buttons)
      if (data.on || data.dimming || data.color || data.color_temperature) {
        this.bidirectionalSync.onHueChange(data.id, data);
      }
    }
  }

  /**
   * Sync initial states from Hue Bridge
   */
  async syncInitialStates(): Promise<void> {
    if (!this.config.isReady()) {
      return;
    }

    try {
      const lights: LightState[] = await this.hueClient.getLightStates();
      const mapping = this.config.getMapping();
      const serviceToDeviceMap = this.hueClient.getServiceToDeviceMap();

      lights.forEach(light => {
        const entry = mapping.find(m => m.hue_uuid === light.id) || mapping.find(m => {
          const lightMeta = serviceToDeviceMap[light.id];
          const mapMeta = serviceToDeviceMap[m.hue_uuid];
          return lightMeta && mapMeta && lightMeta.deviceId === mapMeta.deviceId;
        });

        if (entry) {
          const loxName = entry.loxone_name;

          if (light.on) {
            this.statusManager.update(loxName, 'on', light.on.on ? 1 : 0, entry);
          }

          if (light.dimming) {
            this.statusManager.update(loxName, 'bri', light.dimming.brightness, entry);
          }

          if (light.color && light.color.xy) {
            const hex = xyToHex(light.color.xy.x, light.color.xy.y, 1.0);
            this.statusManager.update(loxName, 'hex', hex, entry);
          } else if (light.color_temperature && light.color_temperature.mirek) {
            const hex = mirekToHex(light.color_temperature.mirek);
            this.statusManager.update(loxName, 'hex', hex, entry);
          }
        }
      });

      this.logger.info('Initial status loaded', 'SYSTEM');
    } catch (error) {
      this.logger.warn('Sync initial states failed', 'SYSTEM');
    }
  }

  /**
   * Start event stream connection
   */
  async start(): Promise<void> {
    if (!this.config.isReady() || this.isActive) {
      return;
    }

    this.isActive = true;

    // Build device map and sync initial states
    await this.hueClient.buildDeviceMap();
    await this.syncInitialStates();

    this.logger.info('Starting event stream...', 'SYSTEM');

    try {
      const bridgeIp = this.config.get('bridgeIp');
      const appKey = this.config.get('appKey');

      const response: AxiosResponse<IncomingMessage> = await axios({
        method: 'get',
        url: `https://${bridgeIp}/eventstream/clip/v2`,
        headers: {
          'hue-application-key': appKey,
          'Accept': 'text/event-stream'
        },
        httpsAgent: this.hueClient.httpsAgent,
        responseType: 'stream'
      });

      // Reset backoff on successful connection
      this._resetBackoff();
      this.logger.success('Event stream connected', 'SYSTEM');

      // Process incoming data
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n');

        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const events: HueEvent[] = JSON.parse(line.substring(6));
              this._processEvents(events);
            } catch (error) {
              // Ignore parse errors for malformed events
            }
          }
        });
      });

      // Handle stream end
      response.data.on('end', () => {
        this.isActive = false;
        const delay = this._getBackoffDelay();
        this.logger.warn(`Event stream ended. Reconnecting in ${delay}ms...`, 'SYSTEM');
        setTimeout(() => this.start(), delay);
      });

      // Handle stream errors
      response.data.on('error', (error: Error) => {
        this.isActive = false;
        const delay = this._getBackoffDelay();
        this.logger.error(`Event stream error: ${error.message}. Retry in ${delay}ms`, 'SYSTEM');
        setTimeout(() => this.start(), delay);
      });

    } catch (error) {
      this.isActive = false;
      const delay = this._getBackoffDelay();
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to start event stream: ${message}`, 'SYSTEM');
      setTimeout(() => this.start(), delay);
    }
  }

  /**
   * Stop event stream
   */
  stop(): void {
    this.isActive = false;
    this.logger.info('Event stream stopped', 'SYSTEM');
  }

  /**
   * Check if event stream is healthy
   */
  isHealthy(): boolean {
    const timeSinceLastEvent = Date.now() - this.lastSuccessfulEvent;
    const isStale = timeSinceLastEvent > 300000; // 5 minutes

    return this.isActive && !isStale;
  }

  /**
   * Get event stream status
   */
  getStatus(): EventStreamStatus {
    return {
      active: this.isActive,
      healthy: this.isHealthy(),
      lastEvent: this.lastSuccessfulEvent,
      reconnectAttempts: this.reconnectAttempts,
      timeSinceLastEvent: Date.now() - this.lastSuccessfulEvent
    };
  }
}

export default EventStream;
