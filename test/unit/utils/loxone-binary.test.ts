/**
 * Unit Tests for Loxone Binary Message Parsing
 * Tests binary WebSocket message parsing in src/utils/loxone-binary.ts
 */

import {
  MESSAGE_TYPES,
  parseMessageHeader,
  formatLoxoneUuid,
  parseValueStates,
  parseTextStates,
  parseMessage
} from '../../../src/utils/loxone-binary';

describe('Loxone Binary Message Parsing', () => {
  describe('MESSAGE_TYPES', () => {
    it('should define all message type constants', () => {
      expect(MESSAGE_TYPES.TEXT).toBe(0);
      expect(MESSAGE_TYPES.BINARY_FILE).toBe(1);
      expect(MESSAGE_TYPES.VALUE_STATES).toBe(2);
      expect(MESSAGE_TYPES.TEXT_STATES).toBe(3);
      expect(MESSAGE_TYPES.DAYTIMER_STATES).toBe(4);
      expect(MESSAGE_TYPES.OUT_OF_SERVICE).toBe(5);
      expect(MESSAGE_TYPES.KEEPALIVE).toBe(6);
      expect(MESSAGE_TYPES.WEATHER_STATES).toBe(7);
    });
  });

  describe('parseMessageHeader()', () => {
    it('should parse valid message header', () => {
      // Create a valid header: marker(0x03), identifier(2), info(0), reserved(0), length(24)
      const buffer = Buffer.alloc(8);
      buffer.writeUInt8(0x03, 0);      // marker
      buffer.writeUInt8(2, 1);         // identifier (VALUE_STATES)
      buffer.writeUInt8(0, 2);         // info
      buffer.writeUInt8(0, 3);         // reserved
      buffer.writeUInt32LE(24, 4);     // length

      const header = parseMessageHeader(buffer);

      expect(header.marker).toBe(0x03);
      expect(header.identifier).toBe(2);
      expect(header.info).toBe(0);
      expect(header.reserved).toBe(0);
      expect(header.length).toBe(24);
    });

    it('should throw error for buffer too small', () => {
      const buffer = Buffer.alloc(7); // Only 7 bytes

      expect(() => {
        parseMessageHeader(buffer);
      }).toThrow('Invalid message header: buffer too small');
    });

    it('should throw error for invalid marker', () => {
      const buffer = Buffer.alloc(8);
      buffer.writeUInt8(0x05, 0); // Invalid marker (should be 0x03)

      expect(() => {
        parseMessageHeader(buffer);
      }).toThrow('Invalid message marker');
    });

    it('should handle large payload lengths', () => {
      const buffer = Buffer.alloc(8);
      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(2, 1);
      buffer.writeUInt32LE(1000000, 4); // 1MB payload

      const header = parseMessageHeader(buffer);
      expect(header.length).toBe(1000000);
    });

    it('should handle zero-length payload', () => {
      const buffer = Buffer.alloc(8);
      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(6, 1); // KEEPALIVE
      buffer.writeUInt32LE(0, 4);

      const header = parseMessageHeader(buffer);
      expect(header.length).toBe(0);
    });
  });

  describe('formatLoxoneUuid()', () => {
    it('should format UUID in Loxone format', () => {
      // Create a 16-byte UUID buffer
      const buffer = Buffer.alloc(16);
      // Set known values
      buffer.writeUInt32LE(0x12345678, 0);
      buffer.writeUInt16LE(0xabcd, 4);
      buffer.writeUInt16LE(0xef01, 6);
      buffer.writeUInt8(0x23, 8);
      buffer.writeUInt8(0x45, 9);
      buffer.writeUInt8(0x67, 10);
      buffer.writeUInt8(0x89, 11);
      buffer.writeUInt8(0xab, 12);
      buffer.writeUInt8(0xcd, 13);
      buffer.writeUInt8(0xef, 14);
      buffer.writeUInt8(0x01, 15);

      const uuid = formatLoxoneUuid(buffer);

      // Loxone format: xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx (standard UUID but parts 4-5 merged)
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{16}$/);
      expect(uuid.split('-')).toHaveLength(4);
    });

    it('should handle zero UUID', () => {
      const buffer = Buffer.alloc(16, 0);
      const uuid = formatLoxoneUuid(buffer);

      expect(uuid).toBe('00000000-0000-0000-0000000000000000');
    });

    it('should handle all-ones UUID', () => {
      const buffer = Buffer.alloc(16, 0xff);
      const uuid = formatLoxoneUuid(buffer);

      expect(uuid).toBe('ffffffff-ffff-ffff-ffffffffffffffff');
    });

    it('should format UUID with correct byte order', () => {
      const buffer = Buffer.from([
        0x01, 0x02, 0x03, 0x04, // part1 (LE)
        0x05, 0x06,             // part2 (LE)
        0x07, 0x08,             // part3 (LE)
        0x09, 0x0a,             // part4 (BE)
        0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10  // part5 (BE)
      ]);

      const uuid = formatLoxoneUuid(buffer);
      expect(uuid).toBe('04030201-0605-0807-090a0b0c0d0e0f10');
    });
  });

  describe('parseValueStates()', () => {
    it('should parse single value state', () => {
      const buffer = Buffer.alloc(24);

      // Write UUID (16 bytes)
      buffer.writeUInt32LE(0x12345678, 0);
      buffer.writeUInt16LE(0xabcd, 4);
      buffer.writeUInt16LE(0xef01, 6);
      buffer.fill(0, 8, 16);

      // Write value (8 bytes double)
      buffer.writeDoubleLE(42.5, 16);

      const states = parseValueStates(buffer);

      expect(states).toHaveLength(1);
      expect(states[0].value).toBe(42.5);
      expect(states[0].uuid).toMatch(/^[0-9a-f-]+$/);
    });

    it('should parse multiple value states', () => {
      const buffer = Buffer.alloc(72); // 3 states * 24 bytes

      // First state
      buffer.fill(0x01, 0, 16);
      buffer.writeDoubleLE(10.0, 16);

      // Second state
      buffer.fill(0x02, 24, 40);
      buffer.writeDoubleLE(20.0, 40);

      // Third state
      buffer.fill(0x03, 48, 64);
      buffer.writeDoubleLE(30.0, 64);

      const states = parseValueStates(buffer);

      expect(states).toHaveLength(3);
      expect(states[0].value).toBe(10.0);
      expect(states[1].value).toBe(20.0);
      expect(states[2].value).toBe(30.0);
    });

    it('should handle negative values', () => {
      const buffer = Buffer.alloc(24);
      buffer.fill(0, 0, 16);
      buffer.writeDoubleLE(-123.456, 16);

      const states = parseValueStates(buffer);

      expect(states[0].value).toBe(-123.456);
    });

    it('should handle zero value', () => {
      const buffer = Buffer.alloc(24);
      buffer.fill(0, 0, 16);
      buffer.writeDoubleLE(0, 16);

      const states = parseValueStates(buffer);

      expect(states[0].value).toBe(0);
    });

    it('should handle empty payload', () => {
      const buffer = Buffer.alloc(0);
      const states = parseValueStates(buffer);

      expect(states).toHaveLength(0);
    });

    it('should handle payload with leftover bytes', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const buffer = Buffer.alloc(26); // 24 + 2 leftover
      buffer.fill(0, 0, 16);
      buffer.writeDoubleLE(100, 16);

      const states = parseValueStates(buffer);

      expect(states).toHaveLength(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('2 leftover bytes')
      );

      consoleSpy.mockRestore();
    });

    it('should handle very large values', () => {
      const buffer = Buffer.alloc(24);
      buffer.fill(0, 0, 16);
      buffer.writeDoubleLE(Number.MAX_SAFE_INTEGER, 16);

      const states = parseValueStates(buffer);

      expect(states[0].value).toBeGreaterThan(0);
    });
  });

  describe('parseTextStates()', () => {
    it('should parse single text state', () => {
      const uuid1 = Buffer.alloc(16, 0x01);
      const uuid2 = Buffer.alloc(16, 0x02);
      const text = 'Hello World';
      const textBuffer = Buffer.from(text, 'utf8');

      // Calculate padded length (4-byte boundary)
      const paddedLength = (textBuffer.length + 3) & ~3;
      const totalLength = 16 + 16 + 4 + paddedLength;

      const buffer = Buffer.alloc(totalLength);
      let offset = 0;

      // Write UUIDs
      uuid1.copy(buffer, offset);
      offset += 16;
      uuid2.copy(buffer, offset);
      offset += 16;

      // Write text length
      buffer.writeUInt32LE(textBuffer.length, offset);
      offset += 4;

      // Write text
      textBuffer.copy(buffer, offset);

      const states = parseTextStates(buffer);

      expect(states).toHaveLength(1);
      expect(states[0].text).toBe(text);
      expect(states[0].uuid).toMatch(/^[0-9a-f-]+$/);
      expect(states[0].uuidIcon).toMatch(/^[0-9a-f-]+$/);
    });

    it('should parse multiple text states', () => {
      const texts = ['First', 'Second Text', 'Third'];
      let totalLength = 0;

      texts.forEach(text => {
        const textLen = Buffer.from(text, 'utf8').length;
        const paddedLen = (textLen + 3) & ~3;
        totalLength += 16 + 16 + 4 + paddedLen;
      });

      const buffer = Buffer.alloc(totalLength);
      let offset = 0;

      texts.forEach((text, idx) => {
        // Write UUIDs
        buffer.fill(idx + 1, offset, offset + 16);
        offset += 16;
        buffer.fill(idx + 10, offset, offset + 16);
        offset += 16;

        // Write text
        const textBuffer = Buffer.from(text, 'utf8');
        buffer.writeUInt32LE(textBuffer.length, offset);
        offset += 4;
        textBuffer.copy(buffer, offset);

        const paddedLength = (textBuffer.length + 3) & ~3;
        offset += paddedLength;
      });

      const states = parseTextStates(buffer);

      expect(states).toHaveLength(3);
      expect(states[0].text).toBe('First');
      expect(states[1].text).toBe('Second Text');
      expect(states[2].text).toBe('Third');
    });

    it('should handle empty text', () => {
      const buffer = Buffer.alloc(36); // 16 + 16 + 4 + 0

      buffer.fill(0x01, 0, 16);
      buffer.fill(0x02, 16, 32);
      buffer.writeUInt32LE(0, 32); // text length = 0

      const states = parseTextStates(buffer);

      expect(states).toHaveLength(1);
      expect(states[0].text).toBe('');
    });

    it('should handle text with special characters', () => {
      const text = 'Hello 世界 🌍';
      const textBuffer = Buffer.from(text, 'utf8');
      const paddedLength = (textBuffer.length + 3) & ~3;

      const buffer = Buffer.alloc(36 + paddedLength);
      buffer.fill(0, 0, 32);
      buffer.writeUInt32LE(textBuffer.length, 32);
      textBuffer.copy(buffer, 36);

      const states = parseTextStates(buffer);

      expect(states[0].text).toBe(text);
    });

    it('should handle text requiring padding', () => {
      const text = 'Hi'; // 2 bytes, will pad to 4
      const textBuffer = Buffer.from(text, 'utf8');
      const paddedLength = 4; // (2 + 3) & ~3 = 4

      const buffer = Buffer.alloc(36 + paddedLength);
      buffer.fill(0, 0, 32);
      buffer.writeUInt32LE(textBuffer.length, 32);
      textBuffer.copy(buffer, 36);

      const states = parseTextStates(buffer);

      expect(states).toHaveLength(1);
      expect(states[0].text).toBe(text);
    });

    it('should handle empty payload', () => {
      const buffer = Buffer.alloc(0);
      const states = parseTextStates(buffer);

      expect(states).toHaveLength(0);
    });
  });

  describe('parseMessage()', () => {
    it('should parse TEXT message', () => {
      const text = 'Test message';
      const textBuffer = Buffer.from(text, 'utf8');

      const buffer = Buffer.alloc(8 + textBuffer.length);
      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(MESSAGE_TYPES.TEXT, 1);
      buffer.writeUInt32LE(textBuffer.length, 4);
      textBuffer.copy(buffer, 8);

      const message = parseMessage(buffer);

      expect(message.type).toBe('text');
      expect(message.data).toBe(text);
    });

    it('should parse VALUE_STATES message', () => {
      const buffer = Buffer.alloc(8 + 24);
      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(MESSAGE_TYPES.VALUE_STATES, 1);
      buffer.writeUInt32LE(24, 4);

      // Add one value state
      buffer.fill(0x01, 8, 24);
      buffer.writeDoubleLE(42.5, 24);

      const message = parseMessage(buffer);

      expect(message.type).toBe('value_states');
      if (message.type === 'value_states') {
        expect(message.data).toHaveLength(1);
        expect(message.data[0].value).toBe(42.5);
      }
    });

    it('should parse TEXT_STATES message', () => {
      const text = 'Status';
      const textBuffer = Buffer.from(text, 'utf8');
      const paddedLength = (textBuffer.length + 3) & ~3;
      const payloadLength = 16 + 16 + 4 + paddedLength;

      const buffer = Buffer.alloc(8 + payloadLength);
      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(MESSAGE_TYPES.TEXT_STATES, 1);
      buffer.writeUInt32LE(payloadLength, 4);

      // Write payload
      buffer.fill(0x01, 8, 24);
      buffer.fill(0x02, 24, 40);
      buffer.writeUInt32LE(textBuffer.length, 40);
      textBuffer.copy(buffer, 44);

      const message = parseMessage(buffer);

      expect(message.type).toBe('text_states');
      if (message.type === 'text_states') {
        expect(message.data).toHaveLength(1);
        expect(message.data[0].text).toBe(text);
      }
    });

    it('should parse KEEPALIVE message', () => {
      const buffer = Buffer.alloc(8);
      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(MESSAGE_TYPES.KEEPALIVE, 1);
      buffer.writeUInt32LE(0, 4);

      const message = parseMessage(buffer);

      expect(message.type).toBe('keepalive');
      expect(message.data).toBeNull();
    });

    it('should parse OUT_OF_SERVICE message', () => {
      const buffer = Buffer.alloc(8);
      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(MESSAGE_TYPES.OUT_OF_SERVICE, 1);
      buffer.writeUInt32LE(0, 4);

      const message = parseMessage(buffer);

      expect(message.type).toBe('out_of_service');
      expect(message.data).toBeNull();
    });

    it('should handle BINARY_FILE as unknown type', () => {
      const buffer = Buffer.alloc(8 + 10);
      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(MESSAGE_TYPES.BINARY_FILE, 1);
      buffer.writeUInt32LE(10, 4);
      buffer.fill(0xaa, 8);

      const message = parseMessage(buffer);

      expect(message.type).toBe('unknown');
      if (message.type === 'unknown') {
        expect(message.identifier).toBe(MESSAGE_TYPES.BINARY_FILE);
        expect(message.data).toBeInstanceOf(Buffer);
      }
    });

    it('should throw error for payload length mismatch', () => {
      const buffer = Buffer.alloc(8 + 5);
      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(MESSAGE_TYPES.TEXT, 1);
      buffer.writeUInt32LE(10, 4); // Claims 10 bytes but buffer only has 5

      expect(() => {
        parseMessage(buffer);
      }).toThrow('Payload length mismatch');
    });

    it('should throw error for unknown message type', () => {
      const buffer = Buffer.alloc(8);
      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(99, 1); // Invalid message type
      buffer.writeUInt32LE(0, 4);

      expect(() => {
        parseMessage(buffer);
      }).toThrow('Unknown message type: 99');
    });

    it('should handle maximum-size message', () => {
      const largePayload = Buffer.alloc(10000, 0x55);
      const buffer = Buffer.alloc(8 + largePayload.length);

      buffer.writeUInt8(0x03, 0);
      buffer.writeUInt8(MESSAGE_TYPES.TEXT, 1);
      buffer.writeUInt32LE(largePayload.length, 4);
      largePayload.copy(buffer, 8);

      const message = parseMessage(buffer);

      expect(message.type).toBe('text');
      if (message.type === 'text') {
        expect(message.data.length).toBe(10000);
      }
    });
  });

  describe('Error Handling', () => {
    it('should provide descriptive error for parseValueStates failure', () => {
      const buffer = Buffer.alloc(20); // Not enough for complete state
      buffer.fill(0);

      // parseValueStates doesn't throw for incomplete data, it just skips it
      const states = parseValueStates(buffer);
      expect(states).toHaveLength(0);
    });

    it('should provide descriptive error for parseTextStates failure', () => {
      const buffer = Buffer.alloc(10); // Too small
      buffer.fill(0);

      expect(() => {
        parseTextStates(buffer);
      }).toThrow('Failed to parse text state');
    });
  });
});
