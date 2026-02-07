export interface HueLight {
  id: string;
  name: string;
  type: string;
  on?: boolean;
  brightness?: number;
  color_temperature?: number;
  color?: {
    xy?: { x: number; y: number };
    gamut_type?: string;
  };
  reachable?: boolean;
}

export interface HueGroup {
  id: string;
  name: string;
  type: string;
  lights: string[];
  on?: boolean;
  brightness?: number;
}

export interface HueSensor {
  id: string;
  name: string;
  type: string;
  battery?: number;
  temperature?: number;
  motion?: boolean;
  light_level?: number;
  reachable?: boolean;
}

export interface HueButton {
  id: string;
  name: string;
  type: string;
  battery?: number;
  last_event?: string;
  reachable?: boolean;
}

export interface HueTarget {
  uuid: string;
  name: string;
  type: 'light' | 'group' | 'sensor' | 'button';
  capabilities?: {
    supportsColor?: boolean;
    supportsCt?: boolean;
    min?: number;
    max?: number;
  };
}

// API returns flat array, not nested object
export type HueTargetsResponse = HueTarget[];
