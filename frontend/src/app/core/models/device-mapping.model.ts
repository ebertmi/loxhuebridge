export type SyncMode = 'http' | 'bidirectional';

export interface DeviceMapping {
  loxone_name: string;
  hue_id: string;
  hue_name: string;
  hue_type: 'light' | 'group' | 'sensor' | 'button';
  sync_mode: SyncMode;
  loxone_format?: 'rgb' | 'smart_actuator' | 'switch';
  gamut?: string;
}

export interface DeviceStatus {
  on?: boolean;
  brightness?: number;
  color_temperature?: number;
  color?: {
    xy?: { x: number; y: number };
    gamut_type?: string;
  };
  battery?: number;
  temperature?: number;
  motion?: boolean;
  light_level?: number;
  button_event?: number;
  last_updated?: string;
}

export interface MappingWithStatus extends DeviceMapping {
  currentStatus?: DeviceStatus;
}

export interface DetectedItem {
  name: string;
  timestamp: string;
  value?: string;
}
