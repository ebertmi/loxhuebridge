/**
 * Loxone Message Parser
 * Handles incoming WebSocket binary data from the Miniserver.
 * Buffers partial data, extracts complete messages, and emits typed events.
 */

import { EventEmitter } from 'events';
import {
  parseMessage,
  ParsedMessage,
  ValueState
} from '../utils/loxone-binary';
import Logger from '../utils/logger';
import { ControlInfo } from './loxone-structure';

/** Value state enriched with the matching control metadata */
export interface EnrichedValueState extends ValueState {
  control: ControlInfo | null;
}

/** Events emitted by LoxoneMessageParser */
export interface LoxoneMessageParserEvents {
  text_message: (data: string) => void;
  value_states: (states: EnrichedValueState[]) => void;
  text_states: (states: { uuid: string; text: string }[]) => void;
}

/**
 * Stateful binary message parser for the Loxone WebSocket protocol.
 *
 * Emits:
 *   - `text_message`  — raw text response
 *   - `value_states`  — enriched numeric state updates
 *   - `text_states`   — text (string) state updates (e.g. ColorPickerV2 colour values)
 */
export class LoxoneMessageParser extends EventEmitter {
  private logger: Logger;
  private getControlByStateUuid: (uuid: string) => ControlInfo | null;
  private onStateValue: (uuid: string, value: number | string) => void;
  private messageBuffer: Buffer;

  constructor(
    logger: Logger,
    getControlByStateUuid: (uuid: string) => ControlInfo | null,
    onStateValue: (uuid: string, value: number | string) => void
  ) {
    super();
    this.logger = logger;
    this.getControlByStateUuid = getControlByStateUuid;
    this.onStateValue = onStateValue;
    this.messageBuffer = Buffer.alloc(0);
  }

  /** Reset the internal buffer (call on disconnect/reconnect) */
  reset(): void {
    this.messageBuffer = Buffer.alloc(0);
  }

  /**
   * Feed raw WebSocket data into the parser.
   * Complete messages are extracted and processed immediately.
   */
  handleRawData(data: Buffer): void {
    try {
      this.messageBuffer = Buffer.concat([this.messageBuffer, data]);

      while (this.messageBuffer.length >= 8) {
        const bodyLength = this.messageBuffer.readUInt32LE(4);
        const totalLength = 8 + bodyLength;

        if (this.messageBuffer.length < totalLength) break;

        const messageData = this.messageBuffer.slice(0, totalLength);
        this.messageBuffer = this.messageBuffer.slice(totalLength);

        this._process(parseMessage(messageData));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to handle message: ${msg}`, 'LOXONE');
    }
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private _process(message: ParsedMessage): void {
    switch (message.type) {
      case 'text':
        this.logger.debug(`Text message: ${message.data}`, 'LOXONE');
        this.emit('text_message', message.data);
        break;

      case 'value_states': {
        this.logger.debug(`Value states: ${message.data.length} updates`, 'LOXONE');

        message.data.forEach(state => {
          this.onStateValue(state.uuid, state.value);
        });

        const enriched: EnrichedValueState[] = message.data
          .map(state => ({ ...state, control: this.getControlByStateUuid(state.uuid) }))
          .filter(state => state.control !== null);

        if (enriched.length > 0) this.emit('value_states', enriched);
        break;
      }

      case 'text_states':
        this.logger.debug(`Text states: ${message.data.length} updates`, 'LOXONE');

        message.data.forEach(state => {
          this.onStateValue(state.uuid, state.text);
          this.logger.debug(`Text state: UUID=${state.uuid}, text="${state.text}"`, 'LOXONE');

          const control = this.getControlByStateUuid(state.uuid);
          if (control) {
            this.logger.debug(`  → Control: ${control.controlName} (${control.stateName})`, 'LOXONE');
          } else {
            this.logger.debug(`  → UUID not found in state index`, 'LOXONE');
          }
        });

        this.emit('text_states', message.data);
        break;

      case 'keepalive':
        this.logger.debug('Keepalive response received', 'LOXONE');
        break;

      case 'out_of_service':
        this.logger.warn('Miniserver is out of service', 'LOXONE');
        break;

      case 'unknown': {
        const typeName = this._typeName(message.identifier);
        this.logger.debug(`Ignoring unsupported message type: ${typeName} (ID: ${message.identifier})`, 'LOXONE');
        break;
      }
    }
  }

  private _typeName(id: number): string {
    const names: Record<number, string> = {
      0: 'TEXT', 1: 'BINARY_FILE', 2: 'VALUE_STATES',
      3: 'TEXT_STATES', 4: 'DAYTIMER_STATES', 5: 'OUT_OF_SERVICE',
      6: 'KEEPALIVE', 7: 'WEATHER_STATES'
    };
    return names[id] || `UNKNOWN_${id}`;
  }
}
