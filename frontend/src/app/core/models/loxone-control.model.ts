export interface LoxoneControlsResponse {
  projectName: string;
  controls: LoxoneControl[];
}

export interface LoxoneControl {
  uuid: string;
  name: string;
  type: string;
  room?: string;
  category?: string;
  states?: Record<string, string>;
  stateValues?: Record<string, unknown>;
  details?: Record<string, unknown>;
  moodInfo?: LoxoneMoodInfo;
  subControls?: LoxoneSubControl[];
}

export interface LoxoneSubControl {
  uuid: string;
  name: string;
  type: string;
  states?: Record<string, string>;
  stateValues?: Record<string, unknown>;
  details?: Record<string, unknown>;
}

export interface LoxoneMoodInfo {
  activeMoodNames: string[];
  activeMoodsNum: number;
  activeMoodIds: number[];
  moodList: LoxoneMood[];
}

export interface LoxoneMood {
  id: number;
  name: string;
  static?: boolean;
  used?: number;
}

export interface LoxoneCommandResponse {
  success: boolean;
  message?: string;
  error?: string;
}
