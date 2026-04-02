/**
 * Service Interface Contracts
 * Decouple routes and sync manager from concrete service implementations.
 */

import { EventEmitter } from 'events';
import { LoxoneStructureFile } from './index';
import { HuePayload } from '../utils/light-converters/types';

// ---------------------------------------------------------------------------
// Hue Client
// ---------------------------------------------------------------------------

export interface IHueClient {
  buildDeviceMap(): Promise<void>;
  getTargets(): Promise<any[]>;
  buildLightPayload(value: string | number, uuid: string, forcedDuration?: number | null): HuePayload;
  updateLight(uuid: string, type: string, payload: HuePayload, loxName: string): Promise<void>;
  getLightStates(): Promise<any[]>;
  getLight(uuid: string, resourceType?: 'light' | 'grouped_light'): Promise<any | null>;
  getScenes(): Promise<any[]>;
  activateScene(sceneId: string): Promise<void>;
  deactivateScene(sceneId: string): Promise<void>;
  getDiagnostics(): Promise<any[]>;
  getServiceToDeviceMap(): Record<string, any>;
  getLightCapabilities(): Record<string, any>;
}

// ---------------------------------------------------------------------------
// Loxone Client
// ---------------------------------------------------------------------------

export interface ILoxoneClient extends EventEmitter {
  readonly connected: boolean;
  connect(): Promise<void>;
  disconnect(): void;
  sendCommand(uuid: string, value: string | number): Promise<void>;
  enableStatusUpdates(): Promise<void>;
  loadStructureFile(): Promise<void>;
  checkAndReloadStructureFile(): Promise<boolean>;
  getStructure(): LoxoneStructureFile | null;
  getControlByStateUuid(stateUuid: string): any | null;
  getStateValue(stateUuid: string): number | string | null;
}
