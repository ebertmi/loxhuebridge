/**
 * Configuration Management
 * Handles loading, saving, and validating application configuration
 */

import fs from 'fs';
import path from 'path';
import CONSTANTS from '../constants';
import Logger from '../utils/logger';
import { BridgeConfig, DeviceMapping } from '../types';

class Config {
  private logger: Logger;
  private dataDir: string;
  private configFile: string;
  private mappingFile: string;
  private config: BridgeConfig;
  private mapping: DeviceMapping[];
  private isConfigured: boolean;

  constructor(logger: Logger, dataDir: string | null = null) {
    this.logger = logger;
    this.dataDir = dataDir || path.join(process.cwd(), CONSTANTS.PATHS.DATA_DIR);
    this.configFile = path.join(this.dataDir, CONSTANTS.PATHS.CONFIG_FILE);
    this.mappingFile = path.join(this.dataDir, CONSTANTS.PATHS.MAPPING_FILE);

    // Default configuration
    this.config = {
      bridgeIp: process.env.HUE_BRIDGE_IP || null,
      appKey: process.env.HUE_APP_KEY || null,
      loxoneIp: process.env.LOXONE_IP || null,
      loxonePort: parseInt(process.env.LOXONE_UDP_PORT || String(CONSTANTS.LOXONE.DEFAULT_UDP_PORT)),
      loxoneHttpPort: parseInt(process.env.LOXONE_HTTP_PORT || '80'),
      loxoneUser: process.env.LOXONE_USER || null,
      loxonePassword: process.env.LOXONE_PASSWORD || null,
      loxoneToken: null,
      loxoneTokenExpiry: null,
      bidirectionalSync: false,
      bidirectionalDebounceMs: 2000,
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
  private _ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
        this.logger.info(`Created data directory: ${this.dataDir}`, 'SYSTEM');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to create data directory: ${message}`, 'SYSTEM');
        throw error;
      }
    }
  }

  /**
   * Validate configuration structure
   */
  private _isValidConfig(config: any): config is BridgeConfig {
    return (
      typeof config === 'object' &&
      (config.bridgeIp === null || typeof config.bridgeIp === 'string') &&
      (config.appKey === null || typeof config.appKey === 'string') &&
      (config.loxoneIp === null || typeof config.loxoneIp === 'string') &&
      typeof config.loxonePort === 'number' &&
      config.loxonePort > 0 &&
      config.loxonePort <= 65535 &&
      (config.loxoneHttpPort === undefined || (typeof config.loxoneHttpPort === 'number' && config.loxoneHttpPort > 0 && config.loxoneHttpPort <= 65535)) &&
      (config.loxoneUser === undefined || config.loxoneUser === null || typeof config.loxoneUser === 'string') &&
      (config.loxonePassword === undefined || config.loxonePassword === null || typeof config.loxonePassword === 'string') &&
      (config.loxoneToken === undefined || config.loxoneToken === null || typeof config.loxoneToken === 'string') &&
      (config.loxoneTokenExpiry === undefined || config.loxoneTokenExpiry === null || typeof config.loxoneTokenExpiry === 'number') &&
      (config.bidirectionalSync === undefined || typeof config.bidirectionalSync === 'boolean') &&
      (config.bidirectionalDebounceMs === undefined || typeof config.bidirectionalDebounceMs === 'number') &&
      typeof config.debug === 'boolean' &&
      (config.certPinningEnabled === undefined || typeof config.certPinningEnabled === 'boolean') &&
      (config.certFingerprint === undefined || config.certFingerprint === null || typeof config.certFingerprint === 'string')
    );
  }

  /**
   * Validate mapping structure
   */
  private _validateMapping(mapping: any): DeviceMapping[] {
    if (!Array.isArray(mapping)) {
      this.logger.warn('Mapping is not an array, resetting', 'SYSTEM');
      return [];
    }

    return mapping.filter((m: any) => {
      const isValid = (
        m.loxone_name &&
        typeof m.loxone_name === 'string' &&
        m.loxone_name.length > 0 &&
        m.hue_uuid &&
        m.hue_name &&
        ['light', 'group', 'sensor', 'button'].includes(m.hue_type) &&
        // Optional bidirectional fields
        (m.loxone_control_uuid === undefined || typeof m.loxone_control_uuid === 'string') &&
        (m.loxone_state_uuid === undefined || typeof m.loxone_state_uuid === 'string') &&
        (m.loxone_dimmer_uuid === undefined || typeof m.loxone_dimmer_uuid === 'string') &&
        (m.bidirectional === undefined || typeof m.bidirectional === 'boolean')
      );

      if (!isValid) {
        this.logger.warn(`Invalid mapping entry filtered out: ${JSON.stringify(m)}`, 'SYSTEM');
      }

      return isValid;
    }) as DeviceMapping[];
  }

  /**
   * Load configuration from file
   */
  load(): void {
    this._loadConfig();
    this._loadMapping();
  }

  /**
   * Load main configuration file
   */
  private _loadConfig(): void {
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

        // Ensure Loxone bidirectional sync fields exist
        if (this.config.loxoneHttpPort === undefined) {
          this.config.loxoneHttpPort = 80;
        }
        if (this.config.loxoneUser === undefined) {
          this.config.loxoneUser = null;
        }
        if (this.config.loxonePassword === undefined) {
          this.config.loxonePassword = null;
        }
        if (this.config.loxoneToken === undefined) {
          this.config.loxoneToken = null;
        }
        if (this.config.loxoneTokenExpiry === undefined) {
          this.config.loxoneTokenExpiry = null;
        }
        if (this.config.bidirectionalSync === undefined) {
          this.config.bidirectionalSync = false;
        }
        if (this.config.bidirectionalDebounceMs === undefined) {
          this.config.bidirectionalDebounceMs = 2000;
        }

        this.logger.success('Configuration loaded', 'SYSTEM');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to load config: ${message}`, 'SYSTEM');

      // Backup corrupt file
      if (fs.existsSync(this.configFile)) {
        const backup = `${this.configFile}.corrupt.${Date.now()}`;
        try {
          fs.copyFileSync(this.configFile, backup);
          this.logger.warn(`Corrupt config backed up to ${backup}`, 'SYSTEM');
        } catch (backupError) {
          const backupMsg = backupError instanceof Error ? backupError.message : 'Unknown error';
          this.logger.error(`Failed to backup config: ${backupMsg}`, 'SYSTEM');
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
  private _loadMapping(): void {
    try {
      if (fs.existsSync(this.mappingFile)) {
        const data = fs.readFileSync(this.mappingFile, 'utf8');
        const parsed = JSON.parse(data);
        this.mapping = this._validateMapping(parsed);
        this.logger.info(`Loaded ${this.mapping.length} device mappings`, 'SYSTEM');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to load mapping: ${message}`, 'SYSTEM');
      this.mapping = [];
    }
  }

  /**
   * Save configuration to file
   */
  save(): void {
    try {
      fs.writeFileSync(
        this.configFile,
        JSON.stringify(this.config, null, 4),
        'utf8'
      );
      this.logger.debug('Configuration saved', 'SYSTEM');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to save config: ${message}`, 'SYSTEM');
      throw error;
    }
  }

  /**
   * Save mapping to file
   */
  saveMapping(): void {
    try {
      const validated = this._validateMapping(this.mapping);
      fs.writeFileSync(
        this.mappingFile,
        JSON.stringify(validated, null, 4),
        'utf8'
      );
      this.logger.debug('Mapping saved', 'SYSTEM');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to save mapping: ${message}`, 'SYSTEM');
      throw error;
    }
  }

  /**
   * Update configuration values
   */
  update(updates: Partial<BridgeConfig>): void {
    this.config = { ...this.config, ...updates };

    // Update configured status
    if (this.config.bridgeIp && this.config.appKey) {
      this.isConfigured = true;
    }

    this.save();
  }

  /**
   * Update mapping
   */
  updateMapping(newMapping: DeviceMapping[]): void {
    this.mapping = this._validateMapping(newMapping);
    this.saveMapping();
  }

  /**
   * Get configuration value
   */
  get<K extends keyof BridgeConfig>(key: K): BridgeConfig[K] {
    return this.config[key];
  }

  /**
   * Set configuration value
   */
  set<K extends keyof BridgeConfig>(key: K, value: BridgeConfig[K]): void {
    this.config[key] = value;
  }

  /**
   * Get all configuration
   */
  getAll(): BridgeConfig {
    return { ...this.config };
  }

  /**
   * Get mapping
   */
  getMapping(): DeviceMapping[] {
    return [...this.mapping];
  }

  /**
   * Check if bridge is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Set debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.config.debug = enabled;
    this.logger.setDebugMode(enabled);
    this.save();
  }
}

export default Config;
