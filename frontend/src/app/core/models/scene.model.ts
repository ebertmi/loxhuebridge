export interface HueScene {
  uuid: string;
  name: string;
  type: string;
  group_id?: string;
  group_name?: string;
  lights?: string[];
  palette?: ScenePalette;
  image?: string;
}

export interface ScenePalette {
  color?: SceneColor[];
  dimming?: SceneDimming[];
  color_temperature?: SceneColorTemperature[];
}

export interface SceneColor {
  color: {
    xy: { x: number; y: number };
  };
  dimming: { brightness: number };
}

export interface SceneDimming {
  brightness: number;
}

export interface SceneColorTemperature {
  color_temperature: { mirek: number };
  dimming: { brightness: number };
}

export interface SceneWithStatus extends HueScene {
  isActive: boolean;
}
