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
