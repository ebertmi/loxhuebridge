export interface AppSettings {
  bridge_ip?: string;
  loxone_ip?: string;
  loxone_port?: number;
  http_port?: number;
  debug?: boolean;
  key_configured?: boolean;
  transitionTime?: number;
  version?: string;
  bidirectional_sync?: boolean;
  loxone_user?: string;
  loxone_http_port?: number;
  loxone_connection_configured?: boolean;
}

export interface DiagnosticsData {
  lights: DiagnosticDevice[];
  sensors: DiagnosticDevice[];
  buttons: DiagnosticDevice[];
  bridge: BridgeStatus;
}

export interface DiagnosticDevice {
  id: string;
  name: string;
  type: string;
  reachable: boolean;
  battery?: number;
  firmware?: string;
  last_seen?: string;
}

export interface BridgeStatus {
  ip: string;
  connected: boolean;
  api_version?: string;
  software_version?: string;
  zigbee_channel?: number;
}
