/**
 * Bidirectional Sync Manager
 * Coordinates synchronization between Hue and Loxone
 * Prevents infinite loops with debouncing and change source tracking
 */

import Config from '../config';
import Logger from '../utils/logger';
import HueClient from './hue-client';
import LoxoneClient from './loxone-client';
import LoxoneUDP from './loxone-udp';
import { DeviceMapping } from '../types';

/**
 * Change source tracking entry
 */
interface ChangeSourceEntry {
  source: string;
  timestamp: number;
}

/**
 * Sync statistics
 */
interface SyncStats {
  hueToLoxone: number;
  loxoneToHue: number;
  loopsPrevented: number;
}

/**
 * Loxone control information
 */
interface ControlInfo {
  controlName: string;
  stateName: string;
  controlType: string;
}

/**
 * Loxone value state update
 */
interface LoxoneUpdate {
  uuid: string;
  value: number;
  control: ControlInfo;
}

/**
 * Hue event data
 */
interface HueEventData {
  on?: {
    on: boolean;
  };
  dimming?: {
    brightness: number;
  };
  color_temperature?: {
    mirek: number;
  };
  color?: {
    xy: {
      x: number;
      y: number;
    };
  };
}

/**
 * Hue API payload for light updates
 */
interface HuePayload {
  on?: {
    on: boolean;
  };
  dimming?: {
    brightness: number;
  };
  color_temperature?: {
    mirek: number;
  };
  color?: {
    xy: {
      x: number;
      y: number;
    };
  };
}

class BidirectionalSyncManager {
  private config: Config;
  private logger: Logger;
  private hueClient: HueClient;
  private loxoneClient: LoxoneClient;
  private changeSource: Map<string, ChangeSourceEntry>;
  private debounceWindow: number;
  private cleanupInterval: NodeJS.Timeout | null;
  private cleanupIntervalMs: number;
  private stats: SyncStats;

  constructor(
    config: Config,
    logger: Logger,
    hueClient: HueClient,
    loxoneClient: LoxoneClient,
    _loxoneUdp: LoxoneUDP
  ) {
    this.config = config;
    this.logger = logger;
    this.hueClient = hueClient;
    this.loxoneClient = loxoneClient;

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
  start(): void {
    this.logger.info('Starting BidirectionalSyncManager...', 'SYNC');

    // Listen to Loxone value state updates
    this.loxoneClient.on('value_states', (updates: LoxoneUpdate[]) => {
      this._handleLoxoneUpdates(updates);
    });

    // Start cleanup interval
    this._startCleanup();

    this.logger.success('BidirectionalSyncManager started', 'SYNC');
  }

  /**
   * Stop the sync manager
   */
  stop(): void {
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
  private _startCleanup(): void {
    this._stopCleanup();

    this.cleanupInterval = setInterval(() => {
      this._cleanupOldEntries();
    }, this.cleanupIntervalMs);
  }

  /**
   * Stop cleanup interval
   */
  private _stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clean up old entries from change source map
   */
  private _cleanupOldEntries(): void {
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
   */
  markChangeSource(deviceId: string, source: string): void {
    this.changeSource.set(deviceId, {
      source,
      timestamp: Date.now()
    });

    this.logger.debug(`Change source marked: ${deviceId} = ${source}`, 'SYNC');
  }

  /**
   * Check if update should be ignored (is an echo)
   */
  private _isEcho(deviceId: string, expectedSource: string): boolean {
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
   */
  private _findMappingByHueUuid(hueUuid: string): DeviceMapping | null {
    const mapping = this.config.getMapping();
    return mapping.find(m => m.hue_uuid === hueUuid) || null;
  }

  /**
   * Find mapping by Loxone state UUID
   */
  private _findMappingByLoxoneStateUuid(loxoneStateUuid: string): DeviceMapping | null {
    const mapping = this.config.getMapping();
    return mapping.find(m => {
      // Check if this state UUID matches any of the configured state UUIDs
      return m.loxone_state_uuid === loxoneStateUuid ||
             m.loxone_dimmer_uuid === loxoneStateUuid;
    }) || null;
  }

  /**
   * Handle Loxone value state updates
   */
  private async _handleLoxoneUpdates(updates: LoxoneUpdate[]): Promise<void> {
    for (const update of updates) {
      try {
        await this._processLoxoneUpdate(update);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to process Loxone update: ${message}`, 'SYNC');
      }
    }
  }

  /**
   * Process a single Loxone update
   */
  private async _processLoxoneUpdate(update: LoxoneUpdate): Promise<void> {
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
   */
  private async _updateHueFromLoxone(
    mapping: DeviceMapping,
    control: ControlInfo,
    value: number
  ): Promise<void> {
    try {
      const payload: HuePayload = {};

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
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update Hue from Loxone: ${message}`);
    }
  }

  /**
   * Handle Hue device change (called from EventStream)
   */
  async onHueChange(hueUuid: string, data: HueEventData): Promise<void> {
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to process Hue change: ${message}`, 'SYNC');
    }
  }

  /**
   * Update Loxone from Hue state change
   */
  private async _updateLoxoneFromHue(mapping: DeviceMapping, data: HueEventData): Promise<void> {
    try {
      if (!mapping.loxone_control_uuid) {
        this.logger.warn('No Loxone control UUID configured for mapping', 'SYNC');
        return;
      }

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
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update Loxone from Hue: ${message}`);
    }
  }

  /**
   * Get sync statistics
   */
  getStats(): Record<string, unknown> {
    return {
      ...this.stats,
      changeSourceEntries: this.changeSource.size,
      debounceWindow: this.debounceWindow
    };
  }
}

export default BidirectionalSyncManager;
