/**
 * Loxone Binary Message Parsing
 * Handles parsing of binary WebSocket messages from Loxone Miniserver
 */

/**
 * Message identifiers
 */
export const MESSAGE_TYPES = {
  TEXT: 0,
  BINARY_FILE: 1,
  VALUE_STATES: 2,
  TEXT_STATES: 3,
  DAYTIMER_STATES: 4,
  OUT_OF_SERVICE: 5,
  KEEPALIVE: 6,
  WEATHER_STATES: 7
} as const;

/**
 * Message header structure
 */
export interface MessageHeader {
  marker: number;
  identifier: number;
  info: number;
  reserved: number;
  length: number;
}

/**
 * Value state structure
 */
export interface ValueState {
  uuid: string;
  value: number;
}

/**
 * Text state structure
 */
export interface TextState {
  uuid: string;
  uuidIcon: string;
  text: string;
}

/**
 * Parsed message structures
 */
export type ParsedMessage =
  | { type: 'text'; header: MessageHeader; data: string }
  | { type: 'value_states'; header: MessageHeader; data: ValueState[] }
  | { type: 'text_states'; header: MessageHeader; data: TextState[] }
  | { type: 'keepalive'; header: MessageHeader; data: null }
  | { type: 'out_of_service'; header: MessageHeader; data: null }
  | { type: 'unknown'; identifier: number; header: MessageHeader; data: Buffer };

/**
 * Parse message header (8 bytes)
 *
 * Header structure:
 * - Byte 0: Marker (always 0x03)
 * - Byte 1: Identifier (message type)
 * - Byte 2: Info flags
 * - Byte 3: Reserved
 * - Bytes 4-7: Payload length (32-bit unsigned little-endian)
 */
export function parseMessageHeader(buffer: Buffer): MessageHeader {
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
 * Convert 16-byte binary UUID to Loxone string format
 * Loxone UUIDs use little-endian byte order for first 3 components
 *
 * @returns UUID in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
export function formatLoxoneUuid(bytes: Buffer): string {
  // Read components in little-endian format
  const part1 = bytes.readUInt32LE(0).toString(16).padStart(8, '0');
  const part2 = bytes.readUInt16LE(4).toString(16).padStart(4, '0');
  const part3 = bytes.readUInt16LE(6).toString(16).padStart(4, '0');
  // Last two parts are big-endian - Loxone format merges them without hyphen
  const part4 = bytes.toString('hex', 8, 10);
  const part5 = bytes.toString('hex', 10, 16);

  // Loxone uses non-standard UUID format: xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx (3 hyphens)
  const result = `${part1}-${part2}-${part3}-${part4}${part5}`;
  return result;
}

/**
 * Parse value states payload
 *
 * Payload structure:
 * - UUID (16 bytes, binary)
 * - Value (8 bytes, double little-endian)
 * - Repeat for each state...
 */
export function parseValueStates(payload: Buffer): ValueState[] {
  const states: ValueState[] = [];
  let offset = 0;

  while (offset + 24 <= payload.length) { // 16 bytes UUID + 8 bytes value
    try {
      // Read UUID (16 bytes binary)
      const uuidBytes = payload.slice(offset, offset + 16);
      const uuid = formatLoxoneUuid(uuidBytes);
      offset += 16;

      // Read value (8 bytes, double)
      const value = payload.readDoubleLE(offset);
      offset += 8;

      states.push({ uuid, value });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse value state at offset ${offset}: ${message}`);
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
 * - UUID (16 bytes, binary)
 * - UUID icon (16 bytes, binary)
 * - Text length (32-bit unsigned little-endian)
 * - Text (variable length, UTF-8 string)
 * - Repeat for each state...
 */
export function parseTextStates(payload: Buffer): TextState[] {
  const states: TextState[] = [];
  let offset = 0;

  while (offset < payload.length) {
    try {
      // Read UUID (16 bytes binary)
      const uuidBytes = payload.slice(offset, offset + 16);
      const uuid = formatLoxoneUuid(uuidBytes);
      offset += 16;

      // Read UUID icon (16 bytes binary)
      const uuidIconBytes = payload.slice(offset, offset + 16);
      const uuidIcon = formatLoxoneUuid(uuidIconBytes);
      offset += 16;

      // Read text length (4 bytes)
      const textLength = payload.readUInt32LE(offset);
      offset += 4;

      // Read text
      const text = payload.toString('utf8', offset, offset + textLength);

      // Text is padded to 4-byte boundary
      const paddedLength = (textLength + 3) & ~3;
      offset += paddedLength;

      states.push({ uuid, uuidIcon, text });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse text state at offset ${offset}: ${message}`);
    }
  }

  return states;
}

/**
 * Parse a complete Loxone message
 *
 * @returns Parsed message or null for keepalive
 */
export function parseMessage(buffer: Buffer): ParsedMessage {
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
