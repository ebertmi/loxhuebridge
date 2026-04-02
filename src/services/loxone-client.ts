/**
 * Loxone Client Service
 * Manages WebSocket connection to Loxone Miniserver
 * Handles authentication, status updates, and control commands
 * 
 * Features:
 * - Secure authentication with RSA and AES encryption
 * - Automatic reconnection with exponential backoff
 * - Structure file management with caching
 * - Parsing of binary and text messages from Miniserver
 * - Emission of enriched state updates with control information
 * - Support for bidirectional synchronization of states
 * 
 */

import WebSocket from 'ws';
import axios from 'axios';
import https from 'https';
import path from 'path';
import { EventEmitter } from 'events';
import { LoxoneAuthService } from './loxone-auth';
import { LoxoneStructureManager } from './loxone-structure';
import { LoxoneMessageParser } from './loxone-message-parser';
import { ILoxoneClient } from '../types/services';
import CONSTANTS from '../constants';
import Config from '../config';
import Logger from '../utils/logger';
import { LoxoneStructureFile } from '../types';

/**
 * Control to query for initial state update
 */
interface ControlToQuery {
  uuid: string;
  name: string;
  type: string;
}

/**
 * Response data structure for commands
 */
interface LoxoneResponse {
  LL?: {
    code?: string;
    Code?: string;
    value?: any;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

class LoxoneClient extends EventEmitter implements ILoxoneClient {
  private config: Config;
  private logger: Logger;

  // Connection state
  private ws: WebSocket | null;
  private isConnected: boolean;
  private isAuthenticated: boolean;

  // Authentication and crypto session (RSA key exchange, AES encryption, JWT)
  private auth: LoxoneAuthService;
  private structureManager: LoxoneStructureManager;
  private messageParser: LoxoneMessageParser;

  // Keepalive
  private keepaliveInterval: NodeJS.Timeout | null;

  // Reconnection
  private reconnectAttempts: number;
  private reconnectTimeout: NodeJS.Timeout | null;
  private maxReconnectDelay: number;

  // HTTPS agent for API calls (ignore self-signed certs)
  private httpsAgent: https.Agent;

  constructor(config: Config, logger: Logger) {
    super();
    this.config = config;
    this.logger = logger;

    // Connection state
    this.ws = null;
    this.isConnected = false;
    this.isAuthenticated = false;

    // HTTPS agent
    this.httpsAgent = new https.Agent({ rejectUnauthorized: false });

    // Authentication and crypto session
    this.auth = new LoxoneAuthService(config, logger);

    // Structure file + state index (wired after httpsAgent is ready)
    const dataDir = path.join(__dirname, '../../data');
    this.structureManager = new LoxoneStructureManager(
      logger,
      this._sendCommand.bind(this),
      this._httpRequest.bind(this),
      dataDir
    );

    // Binary message parser (wired to structure manager for lookups)
    this.messageParser = new LoxoneMessageParser(
      logger,
      this.structureManager.getControlByStateUuid.bind(this.structureManager),
      this.structureManager.updateStateValue.bind(this.structureManager)
    );

    // Re-emit parser events as own events
    this.messageParser.on('text_message', (data) => this.emit('text_message', data));
    this.messageParser.on('value_states', (states) => this.emit('value_states', states));
    this.messageParser.on('text_states', (states) => this.emit('text_states', states));

    // Keepalive
    this.keepaliveInterval = null;

    // Reconnection
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;
    this.maxReconnectDelay = CONSTANTS.RECONNECT.MAX_BACKOFF_MS;
  }

  /**
   * Get Loxone Miniserver base URL
   *
   * @returns Base URL
   */
  private _getBaseUrl(): string {
    const ip = this.config.get('loxoneIp');
    const port = this.config.get('loxoneHttpPort') || 80;
    // Use HTTP for standard port 80, HTTPS for 443 or custom ports
    const protocol = port === 80 ? 'http' : 'https';
    return `${protocol}://${ip}:${port}`;
  }

  /**
   * Get Loxone WebSocket URL
   *
   * @returns WebSocket URL
   */
  private _getWebSocketUrl(): string {
    const ip = this.config.get('loxoneIp');
    const port = this.config.get('loxoneHttpPort') || 80;
    // Use WS for standard port 80, WSS for 443 or custom ports
    const protocol = port === 80 ? 'ws' : 'wss';
    return `${protocol}://${ip}:${port}/ws/rfc6455`;
  }

  /**
   * Calculate exponential backoff delay for reconnection
   *
   * @returns Delay in milliseconds
   */
  private _getReconnectDelay(): number {
    const delay = Math.min(
      CONSTANTS.LOXONE.RECONNECT_BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );
    this.reconnectAttempts++;
    return delay;
  }

  /**
   * Reset reconnection backoff
   */
  private _resetReconnectBackoff(): void {
    this.reconnectAttempts = 0;
  }

  /**
   * Make HTTP request to Loxone API
   *
   * @param endpoint - API endpoint (e.g., '/jdev/cfg/apiKey')
   * @returns Response data
   */
  private async _httpRequest(endpoint: string): Promise<any> {
    let url = `${this._getBaseUrl()}${endpoint}`;

    // Add JWT token if authenticated
    // Since v11.2, plain text token is supported (we have v16.1)
    if (this.auth.jwtToken) {
      const user = this.config.get('loxoneUser');
      const separator = endpoint.includes('?') ? '&' : '?';
      url += `${separator}autht=${this.auth.jwtToken}&user=${user}`;
      this.logger.debug(`HTTP request with JWT token to: ${endpoint}`, 'LOXONE');
    } else {
      this.logger.debug(`HTTP request without token to: ${endpoint}`, 'LOXONE');
    }

    try {
      const response = await axios.get(url, {
        httpsAgent: this.httpsAgent,
        timeout: CONSTANTS.LOXONE.COMMAND_TIMEOUT_MS
      });

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`HTTP request failed: ${message}`);
    }
  }

  /**
   * Send command via WebSocket
   *
   * @param command - Command to send
   * @param encrypted - Whether to encrypt the command
   * @returns Response data
   */
  private async _sendCommand(command: string, encrypted: boolean = false): Promise<string> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const fullCommand = encrypted
      ? await this._encryptCommand(command)
      : command;

    this.logger.debug(`Sending command: ${command}`, 'LOXONE');

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, CONSTANTS.LOXONE.COMMAND_TIMEOUT_MS);

      // Set up one-time response handler
      const responseHandler = (data: string) => {
        clearTimeout(timeout);
        this.removeListener('text_message', responseHandler);
        resolve(data);
      };

      this.once('text_message', responseHandler);
      this.ws!.send(fullCommand);
    });
  }

  /**
   * Encrypt command using session key
   *
   * @param command - Command to encrypt
   * @returns Encrypted command
   */
  private _encryptCommand(command: string): string {
    return this.auth.encryptCommand(command);
  }

  /**
   * Perform key exchange (RSA-encrypted session key)
   */
  private async _performKeyExchange(): Promise<void> {
    await this.auth.performKeyExchange(this._sendCommand.bind(this));
  }

  /**
   * Authenticate with Loxone Miniserver (delegates to LoxoneAuthService)
   */
  private async _authenticate(): Promise<void> {
    await this.auth.authenticate(this._sendCommand.bind(this));
    this.isAuthenticated = true;
  }

  /**
   * Connect to Loxone Miniserver
   */
  async connect(): Promise<void> {
    try {
      this.logger.info('Connecting to Loxone Miniserver...', 'LOXONE');

      // Check if bidirectional sync is enabled
      if (!this.config.get('bidirectionalSync')) {
        this.logger.info('Bidirectional sync disabled, skipping Loxone connection', 'LOXONE');
        return;
      }

      // Check availability
      await this._checkAvailability();

      // Get public key for encryption
      await this._getPublicKey();

      // Establish WebSocket connection
      await this._connectWebSocket();

      // Perform key exchange
      await this._performKeyExchange();

      // Authenticate
      await this._authenticate();

      // Enable status updates
      await this.enableStatusUpdates();

      // Load structure file (uses cache if version unchanged)
      await this.loadStructureFile();

      // Wait for initial binary status updates to be processed
      // This ensures we receive the initial Text States before triggering state queries
      this.logger.debug('Waiting for initial binary status updates...', 'LOXONE');
      await new Promise(resolve => setTimeout(resolve, CONSTANTS.LOXONE.STATUS_WAIT_MS));

      // Query initial color states
      // Triggers /state commands which generate Text State updates for ColorPickerV2
      await this._queryColorStates();

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;

      this.logger.success('Connected and authenticated to Loxone Miniserver', 'LOXONE');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to connect to Loxone: ${message}`, 'LOXONE');
      this._scheduleReconnect();
    }
  }

  /**
   * Check Miniserver availability
   */
  private async _checkAvailability(): Promise<void> {
    try {
      const data = await this._httpRequest('/jdev/cfg/apiKey');
      this.logger.debug(`Miniserver status: ${JSON.stringify(data)}`, 'LOXONE');

      if (data.LL && data.LL.Code === '200') {
        this.logger.debug('Miniserver is reachable', 'LOXONE');
      } else {
        throw new Error('Miniserver returned non-200 status');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Availability check failed: ${message}`);
    }
  }

  /**
   * Get public key from Miniserver (delegates to LoxoneAuthService)
   */
  private async _getPublicKey(): Promise<void> {
    await this.auth.fetchPublicKey(this._httpRequest.bind(this));
  }

  /**
   * Establish WebSocket connection
   */
  private async _connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this._getWebSocketUrl();
      this.logger.debug(`Connecting to ${wsUrl}`, 'LOXONE');

      this.ws = new WebSocket(wsUrl, {
        protocol: 'remotecontrol',
        rejectUnauthorized: false // Accept self-signed certificates
      });

      this.ws.on('open', () => {
        this.logger.success('WebSocket connected', 'LOXONE');
        this.isConnected = true;
        this._resetReconnectBackoff();
        this._startKeepalive();
        resolve();
      });

      this.ws.on('close', (code, reason) => {
        this.logger.warn(`WebSocket closed: ${code} - ${reason}`, 'LOXONE');
        this._handleDisconnect();
      });

      this.ws.on('error', (error) => {
        this.logger.error(`WebSocket error: ${error.message}`, 'LOXONE');
        reject(error);
      });

      this.ws.on('message', (data) => {
        this._handleMessage(data as Buffer);
      });

      // Timeout if connection takes too long
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('WebSocket connection timeout'));
          this.ws!.close();
        }
      }, CONSTANTS.LOXONE.COMMAND_TIMEOUT_MS);
    });
  }

  /**
   * Handle incoming WebSocket message (delegates to LoxoneMessageParser)
   */
  private _handleMessage(data: Buffer): void {
    this.messageParser.handleRawData(data);
  }

  /**
   * Start keepalive interval
   */
  private _startKeepalive(): void {
    this._stopKeepalive();

    // Send keepalive every 4 minutes (timeout is 5 minutes)
    this.keepaliveInterval = setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.logger.debug('Sending keepalive', 'LOXONE');
        this.ws.send('keepalive');
      }
    }, CONSTANTS.LOXONE.KEEPALIVE_INTERVAL_MS);
  }

  /**
   * Stop keepalive interval
   */
  private _stopKeepalive(): void {
    if (this.keepaliveInterval) {
      clearInterval(this.keepaliveInterval);
      this.keepaliveInterval = null;
    }
  }

  /**
   * Handle disconnection
   */
  private _handleDisconnect(): void {
    this.isConnected = false;
    this.isAuthenticated = false;
    this._stopKeepalive();

    // Emit disconnect event
    this.emit('disconnect');

    // Schedule reconnection
    this._scheduleReconnect();
  }

  /**
   * Schedule reconnection attempt
   */
  private _scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      return; // Already scheduled
    }

    const delay = this._getReconnectDelay();
    this.logger.info(`Reconnecting to Loxone in ${delay / 1000}s...`, 'LOXONE');

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  /**
   * Disconnect from Loxone Miniserver
   */
  disconnect(): void {
    this.logger.info('Disconnecting from Loxone Miniserver', 'LOXONE');

    // Clear reconnection
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Stop keepalive
    this._stopKeepalive();

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.isAuthenticated = false;
    this.auth.reset();
    this.messageParser.reset();
  }

  /**
   * Send control command to Loxone
   *
   * @param uuid - Control UUID
   * @param value - Control value
   */
  async sendCommand(uuid: string, value: string | number): Promise<void> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const command = `jdev/sps/io/${uuid}/${value}`;
      this.logger.debug(`Sending control command: ${command}`, 'LOXONE');

      // Try unencrypted first (works after JWT auth according to docs)
      const response = await this._sendCommand(command, false);
      const data: LoxoneResponse = JSON.parse(response);

      if (!data || !data.LL || data.LL.Code !== '200') {
        throw new Error(`Command failed: ${JSON.stringify(data)}`);
      }

      this.logger.debug(`Command successful: ${uuid} = ${value}`, 'LOXONE');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send command: ${message}`, 'LOXONE');
      throw error;
    }
  }

  /**
   * Enable binary status updates
   */
  async enableStatusUpdates(): Promise<void> {
    try {
      this.logger.debug('Enabling binary status updates...', 'LOXONE');

      const command = 'jdev/sps/enablebinstatusupdate';
      const responseText = await this._sendCommand(command, false); // Unencrypted after JWT auth
      const response: LoxoneResponse = JSON.parse(responseText);

      // Check response code
      if (response && response.LL && (response.LL.code === '200' || response.LL.Code === '200')) {
        this.logger.success('Binary status updates enabled', 'LOXONE');
      } else {
        const code = response?.LL?.code || response?.LL?.Code || 'unknown';
        throw new Error(`Command failed with code ${code}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to enable status updates: ${message}`);
    }
  }

  /**
   * Load structure file (delegates to LoxoneStructureManager)
   */
  async loadStructureFile(): Promise<void> {
    await this.structureManager.load();
  }

  /**
   * Check if structure file has changed and reload if necessary
   */
  async checkAndReloadStructureFile(): Promise<boolean> {
    const reloaded = await this.structureManager.checkAndReload();
    if (reloaded) {
      this.emit('structure_changed', this.structureManager.getStructure());
    }
    return reloaded;
  }

  /**
   * Get the current structure file
   */
  getStructure(): LoxoneStructureFile | null {
    return this.structureManager.getStructure();
  }

  /**
   * Whether the WebSocket connection to the Miniserver is established and authenticated
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Query initial control states by triggering state updates
   * Sends /state command to each SubControl, which triggers a Binary Status Update
   * with the current value.
   */
  private async _queryColorStates(): Promise<void> {
    const structure = this.structureManager.getStructure();
    if (!structure || !structure.controls) {
      return;
    }

    const controlsToQuery: ControlToQuery[] = [];

    // Collect all SubControls (Dimmer, ColorPickerV2, Switch) AND LightControllerV2 for moods
    for (const [_controlUuid, control] of Object.entries(structure.controls)) {
      // Query LightControllerV2 for mood states
      if (control.type === 'LightControllerV2') {
        controlsToQuery.push({
          uuid: control.uuidAction,
          name: control.name,
          type: control.type
        });
      }

      // Query SubControls
      if (control.subControls) {
        for (const [_subUuid, subControl] of Object.entries(control.subControls)) {
          // Query Dimmer, ColorPickerV2, and Switch subControls
          if (['Dimmer', 'ColorPickerV2', 'Switch'].includes(subControl.type)) {
            controlsToQuery.push({
              uuid: subControl.uuidAction, // Use uuidAction, not state UUID!
              name: subControl.name,
              type: subControl.type
            });
          }
        }
      }
    }

    this.logger.debug(`Triggering state updates for ${controlsToQuery.length} controls...`, 'LOXONE');

    // Log expected color state UUIDs for ColorPickerV2
    const colorPickerControls = controlsToQuery.filter(c => c.type === 'ColorPickerV2');
    if (colorPickerControls.length > 0) {
      this.logger.debug(`Expected color state UUIDs for ${colorPickerControls.length} ColorPickerV2 controls:`, 'LOXONE');
      for (const cp of colorPickerControls) {
        // Find the color state UUID from the structure
        const colorStateUuid = this.structureManager.findColorStateUuid(cp.uuid);
        this.logger.debug(`  - ${cp.name}: ${colorStateUuid}`, 'LOXONE');
      }
    }

    // Trigger state update for each control
    for (const controlInfo of controlsToQuery) {
      try {
        // Send /state command - this triggers a Binary Status Update
        const response = await this._sendCommand(`jdev/sps/io/${controlInfo.uuid}/state`, false);
        const data: LoxoneResponse = JSON.parse(response);

        if (data && data.LL && data.LL.Code === '200') {
          this.logger.debug(`State update triggered for ${controlInfo.name} (${controlInfo.type})`, 'LOXONE');
        } else {
          this.logger.warn(`Failed to trigger state update for ${controlInfo.name}: ${JSON.stringify(data)}`, 'LOXONE');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Failed to trigger state update for ${controlInfo.name}: ${message}`, 'LOXONE');
      }
    }

    this.logger.success(`Triggered state updates for ${controlsToQuery.length} controls`, 'LOXONE');
  }

  /**
   * Get control info for a state UUID
   */
  getControlByStateUuid(stateUuid: string): any | null {
    return this.structureManager.getControlByStateUuid(stateUuid);
  }

  /**
   * Get current cached value for a state UUID
   */
  getStateValue(stateUuid: string): number | string | null {
    return this.structureManager.getStateValue(stateUuid);
  }
}

export default LoxoneClient;
