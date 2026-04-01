/**
 * Status Manager Service
 * Manages device status cache and handles status updates with deduplication
 */

import LoxoneUDP from './loxone-udp';
import Config from '../config';
import Logger from '../utils/logger';
import { DeviceMapping } from '../types';

/**
 * Device status structure
 */
interface DeviceStatus {
  [key: string]: unknown;
}

/**
 * Status cache statistics
 */
interface CacheStats {
  size: number;
  devices: string[];
}

class StatusManager {
  private loxoneUdp: LoxoneUDP;
  private config: Config;
  private logger: Logger;
  private statusCache: Map<string, DeviceStatus>;

  constructor(loxoneUdp: LoxoneUDP, logger: Logger, config: Config) {
    this.loxoneUdp = loxoneUdp;
    this.config = config;
    this.logger = logger;
    this.statusCache = new Map();
  }

  /**
   * Update device status
   * @param loxName - Loxone device name
   * @param key - Status key (e.g., 'on', 'bri', 'temp')
   * @param value - Status value
   * @param entry - Mapping entry
   */
  update(loxName: string, key: string, value: unknown, entry: DeviceMapping): void {
    if (!this.statusCache.has(loxName)) {
      this.statusCache.set(loxName, {});
    }

    const deviceStatus = this.statusCache.get(loxName)!;

    // IMPORTANT: Events (buttons/rotary) are never cached!
    const isEvent = (key === 'button' || key === 'rotary');

    // Deduplicate: skip if value hasn't changed (except for events)
    if (!isEvent && deviceStatus[key] === value) {
      return;
    }

    // Update cache
    deviceStatus[key] = value;

    // Do not propagate to Loxone when sync is disabled
    if (!this.config.get('syncEnabled')) {
      return;
    }

    // Determine if we should send to Loxone
    let shouldSend = false;
    let category = 'SYSTEM';

    if (entry.hue_type === 'sensor') {
      shouldSend = true;
      category = 'SENSOR';
    } else if (entry.hue_type === 'button') {
      shouldSend = true;
      category = 'BUTTON';
    } else if (entry.bidirectional === true) {
      shouldSend = true;
      category = 'LIGHT';
    }

    // Send to Loxone if enabled
    if (shouldSend) {
      this.loxoneUdp.send(loxName, key, value as string | number, category);
    }
  }

  /**
   * Get status for a specific device
   * @param loxName - Loxone device name
   * @returns Device status
   */
  get(loxName: string): DeviceStatus {
    return this.statusCache.get(loxName) || {};
  }

  /**
   * Get all statuses
   * @returns All device statuses
   */
  getAll(): Record<string, DeviceStatus> {
    const result: Record<string, DeviceStatus> = {};
    this.statusCache.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Clear status for a device
   * @param loxName - Loxone device name
   */
  clear(loxName: string): void {
    this.statusCache.delete(loxName);
  }

  /**
   * Clear all statuses
   */
  clearAll(): void {
    this.statusCache.clear();
    this.logger.info('Status cache cleared', 'SYSTEM');
  }

  /**
   * Cleanup stale entries
   * @param validDeviceNames - Array of valid device names
   */
  cleanup(validDeviceNames: string[]): void {
    const validSet = new Set(validDeviceNames);
    let removed = 0;

    this.statusCache.forEach((_value, key) => {
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
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    return {
      size: this.statusCache.size,
      devices: Array.from(this.statusCache.keys())
    };
  }
}

export default StatusManager;
