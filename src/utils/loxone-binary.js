/**
 * Loxone Binary Message Parsing
 * Handles parsing of binary WebSocket messages from Loxone Miniserver
 */

/**
 * Message identifiers
 */
const MESSAGE_TYPES = {
    TEXT: 0,
    BINARY_FILE: 1,
    VALUE_STATES: 2,
    TEXT_STATES: 3,
    DAYTIMER_STATES: 4,
    OUT_OF_SERVICE: 5,
    KEEPALIVE: 6,
    WEATHER_STATES: 7
};

/**
 * Parse message header (8 bytes)
 *
 * Header structure:
 * - Byte 0: Marker (always 0x03)
 * - Byte 1: Identifier (message type)
 * - Byte 2: Info flags
 * - Byte 3: Reserved
 * - Bytes 4-7: Payload length (32-bit unsigned little-endian)
 *
 * @param {Buffer} buffer - Buffer containing at least 8 bytes
 * @returns {Object} Parsed header
 */
function parseMessageHeader(buffer) {
    if (buffer.length < 8) {
        throw new Error(`Invalid message header: buffer too small (${buffer.length} bytes)`);
    }

    const marker = buffer.readUInt8(0);
    if (marker !== 0x03) {
        throw new Error(`Invalid message marker: expected 0x03, got 0x${marker.toString(16)}`);
    }

    return {
        marker,
        identifier: buffer.readUInt8(1),
        info: buffer.readUInt8(2),
        reserved: buffer.readUInt8(3),
        length: buffer.readUInt32LE(4)
    };
}

/**
 * Parse value states payload
 *
 * Payload structure:
 * - UUID (36 bytes, UTF-8 string)
 * - Value (8 bytes, double little-endian)
 * - Repeat for each state...
 *
 * @param {Buffer} payload - Payload buffer
 * @returns {Array<{uuid: string, value: number}>} Array of state updates
 */
function parseValueStates(payload) {
    const states = [];
    let offset = 0;

    while (offset + 44 <= payload.length) { // 36 bytes UUID + 8 bytes value
        try {
            // Read UUID (36 bytes)
            const uuid = payload.toString('utf8', offset, offset + 36);
            offset += 36;

            // Read value (8 bytes, double)
            const value = payload.readDoubleLE(offset);
            offset += 8;

            states.push({ uuid, value });
        } catch (error) {
            throw new Error(`Failed to parse value state at offset ${offset}: ${error.message}`);
        }
    }

    // Warn if there are leftover bytes
    if (offset < payload.length) {
        const remaining = payload.length - offset;
        console.warn(`Value states payload has ${remaining} leftover bytes`);
    }

    return states;
}

/**
 * Parse text states payload
 *
 * Payload structure:
 * - UUID (36 bytes, UTF-8 string)
 * - UUID icon (36 bytes, UTF-8 string)
 * - Text length (32-bit unsigned little-endian)
 * - Text (variable length, UTF-8 string)
 * - Repeat for each state...
 *
 * @param {Buffer} payload - Payload buffer
 * @returns {Array<{uuid: string, uuidIcon: string, text: string}>} Array of text states
 */
function parseTextStates(payload) {
    const states = [];
    let offset = 0;

    while (offset < payload.length) {
        try {
            // Read UUID (36 bytes)
            const uuid = payload.toString('utf8', offset, offset + 36);
            offset += 36;

            // Read UUID icon (36 bytes)
            const uuidIcon = payload.toString('utf8', offset, offset + 36);
            offset += 36;

            // Read text length (4 bytes)
            const textLength = payload.readUInt32LE(offset);
            offset += 4;

            // Read text
            const text = payload.toString('utf8', offset, offset + textLength);
            offset += textLength;

            states.push({ uuid, uuidIcon, text });
        } catch (error) {
            throw new Error(`Failed to parse text state at offset ${offset}: ${error.message}`);
        }
    }

    return states;
}

/**
 * Parse a complete Loxone message
 *
 * @param {Buffer} buffer - Complete message buffer (header + payload)
 * @returns {Object|null} Parsed message or null for keepalive
 */
function parseMessage(buffer) {
    // Parse header
    const header = parseMessageHeader(buffer);

    // Extract payload
    const payload = buffer.slice(8, 8 + header.length);

    if (payload.length !== header.length) {
        throw new Error(`Payload length mismatch: expected ${header.length}, got ${payload.length}`);
    }

    // Handle different message types
    switch (header.identifier) {
        case MESSAGE_TYPES.TEXT:
            return {
                type: 'text',
                header,
                data: payload.toString('utf8')
            };

        case MESSAGE_TYPES.VALUE_STATES:
            return {
                type: 'value_states',
                header,
                data: parseValueStates(payload)
            };

        case MESSAGE_TYPES.TEXT_STATES:
            return {
                type: 'text_states',
                header,
                data: parseTextStates(payload)
            };

        case MESSAGE_TYPES.KEEPALIVE:
            return {
                type: 'keepalive',
                header,
                data: null
            };

        case MESSAGE_TYPES.OUT_OF_SERVICE:
            return {
                type: 'out_of_service',
                header,
                data: null
            };

        case MESSAGE_TYPES.BINARY_FILE:
        case MESSAGE_TYPES.DAYTIMER_STATES:
        case MESSAGE_TYPES.WEATHER_STATES:
            // Not currently parsed - return raw payload
            return {
                type: 'unknown',
                identifier: header.identifier,
                header,
                data: payload
            };

        default:
            throw new Error(`Unknown message type: ${header.identifier}`);
    }
}

module.exports = {
    MESSAGE_TYPES,
    parseMessageHeader,
    parseValueStates,
    parseTextStates,
    parseMessage
};
