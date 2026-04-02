/**
 * Core Type Definitions for loxHueBridge
 * Central type definitions for configuration, mapping, and service interfaces
 */

// ===== Configuration Types =====

export interface BridgeConfig {
  bridgeIp: string | null;
  appKey: string | null;
  loxoneIp: string | null;
  loxonePort: number;
  loxoneHttpPort: number;
  loxoneUser: string | null;
  loxonePassword: string | null;
  loxoneToken: string | null;
  loxoneTokenExpiry: number | null;
  bidirectionalSync: boolean;
  bidirectionalDebounceMs: number;
  syncEnabled: boolean;
  debug: boolean;
  transitionTime: number;
  certPinningEnabled: boolean;
  certFingerprint: string | null;
}

// ===== Device Mapping Types =====

export interface DeviceMapping {
  loxone_name: string;
  hue_uuid: string;
  hue_name: string;
  hue_type: 'light' | 'group' | 'sensor' | 'button';
  loxone_control_uuid?: string;
  loxone_state_uuid?: string;
  loxone_dimmer_uuid?: string;
  bidirectional?: boolean;
}

// ===== Hue API Types =====

export interface HueTarget {
  id: string;
  name: string;
  type: 'light' | 'grouped_light';
  deviceId?: string;
}

export interface HueScene {
  uuid: string;
  name: string;
  group?: {
    rid: string;
    rtype: string;
  };
}

export interface HueLightCapabilities {
  supportsColor: boolean;
  supportsTemperature: boolean;
  minMirek?: number;
  maxMirek?: number;
}

export interface HueLightState {
  on: boolean;
  brightness?: number;
  color?: XYColor;
  colorTemp?: number;
}

export interface HueServiceToDeviceMap {
  [serviceId: string]: {
    deviceId: string;
    type: string;
  };
}

// ===== Color Types =====

export interface XYColor {
  x: number;
  y: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSVColor {
  h: number;
  s: number;
  v: number;
}

// ===== Logging Types =====

export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'success' | 'info' | 'debug';
  message: string;
  category: string;
}

// ===== Detection Types =====

export interface DetectedItem {
  type: 'command' | 'event' | 'device';
  id?: string;
  name: string;
  timestamp: number;
  data?: unknown;
}

export interface DetectedItemsStore {
  items: DetectedItem[];
}

// ===== Loxone Types =====

export interface LoxoneControl {
  uuid: string;
  name: string;
  type: string;
  room?: string;
  cat?: string;
  states?: Record<string, string>;
  stateValues?: Record<string, number | string>;
  details?: Record<string, unknown>;
  subControls?: LoxoneSubControl[];
  moodInfo?: MoodInfo;
}

export interface LoxoneSubControl {
  uuid: string;
  name: string;
  type: string;
  states?: Record<string, string>;
  stateValues?: Record<string, number | string>;
  details?: Record<string, unknown>;
}

export interface LoxoneStructureFile {
  lastModified: string;
  msInfo?: {
    projectName?: string;
    [key: string]: unknown;
  };
  controls: Record<string, LoxoneControlRaw>;
  rooms?: Record<string, LoxoneRoom>;
  [key: string]: unknown;
}

export interface LoxoneControlRaw {
  name: string;
  type: string;
  uuidAction: string;
  room?: string;
  cat?: string;
  states?: Record<string, string>;
  details?: Record<string, unknown>;
  subControls?: Record<string, LoxoneSubControlRaw>;
}

export interface LoxoneSubControlRaw {
  name: string;
  type: string;
  uuidAction: string;
  states?: Record<string, string>;
  details?: Record<string, unknown>;
}

export interface LoxoneRoom {
  name: string;
  uuid: string;
  [key: string]: unknown;
}

export interface MoodInfo {
  activeMoodNames: string[];
  activeMoodsNum: number;
  activeMoodIds: number[];
  moodList: Mood[];
}

export interface Mood {
  id: number;
  name: string;
  static?: boolean;
  used?: number;
}

// ===== Service Dependency Types =====

export interface ServiceDependencies {
  config: any;
  hueClient?: import('./services').IHueClient;
  loxoneClient?: import('./services').ILoxoneClient;
  logger: any;
  statusManager?: any;
  eventStream?: any;
  rateLimiter?: any;
  detectedItems?: DetectedItemsStore;
  httpPort?: number;
  version?: string;
}

// ===== Rate Limiter Types =====

export interface QueueTask {
  (): Promise<unknown>;
}

export interface QueueStats {
  lights: {
    pending: number;
    processed: number;
  };
  groupedLights: {
    pending: number;
    processed: number;
  };
}

// ===== Status Manager Types =====

export interface CachedStatus {
  value: unknown;
  timestamp: number;
}

// ===== Event Stream Types =====

export interface EventStreamStatus {
  connected: boolean;
  healthy: boolean;
  lastEvent?: number;
  reconnectAttempts?: number;
}

// ===== Bidirectional Sync Types =====

export interface ChangeSource {
  source: 'hue' | 'loxone';
  timestamp: number;
}

export interface SyncStats {
  hueToLoxone: number;
  loxoneToHue: number;
  loopsPrevented: number;
}

// ===== Light Control Types =====

export interface LightCommand {
  on?: boolean;
  brightness?: number;
  color?: XYColor;
  colorTemp?: number;
  transitionTime?: number;
}

// ===== Validation Types =====

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

// ===== Health Check Types =====

export interface HealthStatus {
  status: 'healthy' | 'degraded';
  configured: boolean;
  eventStream: EventStreamStatus;
  queues: QueueStats;
  uptime: number;
  memory: NodeJS.MemoryUsage;
}

// ===== Diagnostics Types =====

export interface DiagnosticsInfo {
  bridge?: {
    ip: string;
    connected: boolean;
  };
  devices?: {
    total: number;
    lights: number;
    groups: number;
  };
  errors?: string[];
}
