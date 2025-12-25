/**
 * Application Constants
 * Centralized configuration values to avoid magic numbers
 */

const CONSTANTS = {
    LOG: {
        MAX_BUFFER_SIZE: 100,
        RETENTION_MS: 3600000 // 1 hour
    },
    COLOR: {
        LOXONE_MIN_MIREK: 153,
        LOXONE_MAX_MIREK: 370,
        HUE_MIN_MIREK: 153,
        HUE_MAX_MIREK: 500
    },
    RATE_LIMIT: {
        LIGHT_DELAY_MS: 120,           // ~8 requests/sec
        GROUPED_LIGHT_DELAY_MS: 1100,  // ~0.9 requests/sec
        SEQUENCE_DELAY_MS: 100
    },
    DETECTION: {
        MAX_ITEMS: 10
    },
    RECONNECT: {
        EVENT_STREAM_DELAY_MS: 5000,
        EVENT_STREAM_ERROR_DELAY_MS: 10000,
        MAX_BACKOFF_MS: 60000
    },
    RETRY: {
        MAX_ATTEMPTS: 3,           // Maximum retry attempts
        INITIAL_BACKOFF_MS: 1000,  // Initial backoff delay (1 second)
        MAX_BACKOFF_MS: 10000,     // Maximum backoff delay (10 seconds)
        BACKOFF_MULTIPLIER: 2,     // Exponential backoff multiplier
        // HTTP status codes that should trigger a retry
        RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
        // Network error codes that should trigger a retry
        RETRYABLE_ERROR_CODES: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'ENETUNREACH']
    },
    HTTP: {
        DEFAULT_PORT: 8555
    },
    LOXONE: {
        DEFAULT_UDP_PORT: 7000
    },
    PATHS: {
        DATA_DIR: 'data',
        CONFIG_FILE: 'config.json',
        MAPPING_FILE: 'mapping.json'
    }
};

module.exports = CONSTANTS;
