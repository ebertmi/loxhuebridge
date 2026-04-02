/**
 * Loxone Structure Manager
 * Loads, caches, and indexes the Loxone structure file (LoxAPP3.json).
 * Owns the state UUID reverse-index and cached state values.
 */

import fs from 'fs';
import path from 'path';
import Logger from '../utils/logger';
import { LoxoneStructureFile } from '../types';

export interface ControlInfo {
  controlUuid: string;
  controlName: string;
  controlType: string;
  parentControlUuid?: string;
  parentControlName?: string;
  stateName: string;
  isSubControl: boolean;
  details?: Record<string, any>;
}

interface LoxoneVersionResponse {
  LL?: { code?: string; Code?: string; value?: any; [key: string]: unknown };
  [key: string]: unknown;
}

export type SendCommandFn = (command: string, encrypt?: boolean) => Promise<string>;
export type HttpRequestFn = (endpoint: string) => Promise<any>;

/**
 * Manages the Loxone structure file: loading, disk-caching, version checks,
 * state UUID index, and state value cache.
 */
export class LoxoneStructureManager {
  private logger: Logger;
  private sendCommand: SendCommandFn;
  private httpRequest: HttpRequestFn;
  private cachePath: string;

  private structure: LoxoneStructureFile | null = null;
  private structureVersion: string | null = null;
  private stateUuidIndex: Map<string, ControlInfo> = new Map();
  private stateValues: Map<string, number | string> = new Map();

  constructor(
    logger: Logger,
    sendCommand: SendCommandFn,
    httpRequest: HttpRequestFn,
    dataDir: string
  ) {
    this.logger = logger;
    this.sendCommand = sendCommand;
    this.httpRequest = httpRequest;
    this.cachePath = path.join(dataDir, 'loxone-structure.json');
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  getStructure(): LoxoneStructureFile | null {
    return this.structure;
  }

  getControlByStateUuid(stateUuid: string): ControlInfo | null {
    return this.stateUuidIndex.get(stateUuid) || null;
  }

  getStateValue(stateUuid: string): number | string | null {
    return this.stateValues.has(stateUuid) ? this.stateValues.get(stateUuid)! : null;
  }

  updateStateValue(uuid: string, value: number | string): void {
    this.stateValues.set(uuid, value);
  }

  findColorStateUuid(uuidAction: string): string | null {
    if (!this.structure?.controls) return null;

    for (const control of Object.values(this.structure.controls)) {
      if (control.subControls) {
        for (const subControl of Object.values(control.subControls)) {
          if (subControl.uuidAction === uuidAction && subControl.type === 'ColorPickerV2') {
            return subControl.states?.color || null;
          }
        }
      }
    }
    return null;
  }

  /**
   * Load structure file, using the disk cache when the version matches.
   */
  async load(): Promise<void> {
    try {
      if (fs.existsSync(this.cachePath)) {
        try {
          const cachedData = JSON.parse(fs.readFileSync(this.cachePath, 'utf8'));
          const currentVersion = await this._getVersion();

          if (cachedData.lastModified === currentVersion) {
            this.logger.info('Using cached structure file (up to date)', 'LOXONE');
            this.structure = cachedData;
            this.structureVersion = currentVersion;
            this._buildIndex();
            this.logger.success(`State UUID index built (${this.stateUuidIndex.size} states)`, 'LOXONE');
            return;
          }

          this.logger.info(`Structure file outdated (cached: ${cachedData.lastModified}, current: ${currentVersion})`, 'LOXONE');
        } catch (cacheError) {
          const msg = cacheError instanceof Error ? cacheError.message : 'Unknown error';
          this.logger.warn(`Failed to load cached structure file: ${msg}`, 'LOXONE');
        }
      }

      this.logger.debug('Loading structure file from Miniserver...', 'LOXONE');
      const data = await this.httpRequest('/data/LoxAPP3.json');

      if (!data) throw new Error('Structure file is empty');

      try {
        fs.writeFileSync(this.cachePath, JSON.stringify(data, null, 2));
        this.logger.debug('Structure file cached to disk', 'LOXONE');
      } catch (writeError) {
        const msg = writeError instanceof Error ? writeError.message : 'Unknown error';
        this.logger.warn(`Failed to cache structure file: ${msg}`, 'LOXONE');
      }

      this.structure = data;
      this.structureVersion = data.lastModified;
      this.logger.success(`Structure file loaded (${data.msInfo?.projectName || 'unknown'})`, 'LOXONE');

      this._buildIndex();
      this.logger.success(`State UUID index built (${this.stateUuidIndex.size} states)`, 'LOXONE');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load structure file: ${msg}`);
    }
  }

  /**
   * Check if the server has a newer structure file and reload if so.
   * @returns true if the file was reloaded
   */
  async checkAndReload(): Promise<boolean> {
    try {
      const currentVersion = await this._getVersion();

      if (!currentVersion) {
        this.logger.warn('Could not check structure file version', 'LOXONE');
        return false;
      }

      if (this.structureVersion !== currentVersion) {
        this.logger.info(`Structure file changed (${this.structureVersion} → ${currentVersion}), reloading...`, 'LOXONE');
        await this.load();
        return true;
      }

      this.logger.debug('Structure file up to date', 'LOXONE');
      return false;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to check structure file version: ${msg}`, 'LOXONE');
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async _getVersion(): Promise<string | null> {
    try {
      const responseText = await this.sendCommand('jdev/sps/LoxAPPversion3', false);
      const response: LoxoneVersionResponse = JSON.parse(responseText);

      if (response?.LL?.value) return response.LL.value;

      throw new Error('Invalid version response');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to get structure version: ${msg}`, 'LOXONE');
      return null;
    }
  }

  private _buildIndex(): void {
    this.stateUuidIndex.clear();

    if (!this.structure?.controls) return;

    for (const [controlUuid, control] of Object.entries(this.structure.controls)) {
      if (control.states) {
        for (const [stateName, stateUuid] of Object.entries(control.states)) {
          this.stateUuidIndex.set(stateUuid, {
            controlUuid,
            controlName: control.name,
            controlType: control.type,
            stateName,
            isSubControl: false,
            details: control.details
          });
        }
      }

      if (control.subControls) {
        for (const [subControlUuid, subControl] of Object.entries(control.subControls)) {
          if (subControl.states) {
            for (const [stateName, stateUuid] of Object.entries(subControl.states)) {
              this.stateUuidIndex.set(stateUuid, {
                controlUuid: subControlUuid,
                controlName: subControl.name,
                controlType: subControl.type,
                parentControlUuid: controlUuid,
                parentControlName: control.name,
                stateName,
                isSubControl: true,
                details: subControl.details
              });
            }
          }
        }
      }
    }

    this.logger.debug(`Indexed ${this.stateUuidIndex.size} state UUIDs`, 'LOXONE');
  }
}
