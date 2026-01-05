/**
 * Constants Type Definitions
 * Types for application-wide constant values
 */

export interface Constants {
  LOG: {
    MAX_BUFFER_SIZE: number;
    RETENTION_MS: number;
  };
  COLOR: {
    LOXONE_MIN_MIREK: number;
    LOXONE_MAX_MIREK: number;
    HUE_MIN_MIREK: number;
    HUE_MAX_MIREK: number;
  };
  RATE_LIMIT: {
    LIGHT_DELAY_MS: number;
    GROUPED_LIGHT_DELAY_MS: number;
    SEQUENCE_DELAY_MS: number;
  };
  DETECTION: {
    MAX_ITEMS: number;
  };
  RECONNECT: {
    EVENT_STREAM_DELAY_MS: number;
    EVENT_STREAM_ERROR_DELAY_MS: number;
    MAX_BACKOFF_MS: number;
  };
  RETRY: {
    MAX_ATTEMPTS: number;
    INITIAL_BACKOFF_MS: number;
    MAX_BACKOFF_MS: number;
    BACKOFF_MULTIPLIER: number;
    RETRYABLE_STATUS_CODES: number[];
    RETRYABLE_ERROR_CODES: string[];
  };
  HTTP: {
    DEFAULT_PORT: number;
  };
  LOXONE: {
    DEFAULT_UDP_PORT: number;
  };
  PATHS: {
    DATA_DIR: string;
    CONFIG_FILE: string;
    MAPPING_FILE: string;
  };
}
