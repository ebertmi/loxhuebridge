/**
 * Loxone Client Service
 * Manages WebSocket connection to Loxone Miniserver
 * Handles authentication, status updates, and control commands
 */

const WebSocket = require('ws');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const {
    generateAesKey,
    generateAesIv,
    generateSalt,
    extractPublicKey,
    rsaEncrypt,
    aesEncrypt,
    aesDecrypt,
    hashPassword,
    hmacSha256
} = require('../utils/loxone-crypto');
const {
    parseMessage,
    MESSAGE_TYPES
} = require('../utils/loxone-binary');
const CONSTANTS = require('../constants');

class LoxoneClient extends EventEmitter {
    constructor(config, logger) {
        super();
        this.config = config;
        this.logger = logger;

        // Connection state
        this.ws = null;
        this.isConnected = false;
        this.isAuthenticated = false;

        // Crypto state
        this.sessionKey = null;
        this.sessionIv = null;
        this.currentSalt = null;

        // Authentication state
        this.token = null;
        this.tokenExpiry = null;

        // Structure file
        this.structure = null;
        this.stateUuidIndex = new Map(); // stateUuid → control info
        this.structureVersion = null; // lastModified timestamp
        this.stateValues = new Map(); // stateUuid → current value

        // Keepalive
        this.keepaliveInterval = null;
        this.lastKeepaliveResponse = null;

        // Reconnection
        this.reconnectAttempts = 0;
        this.reconnectTimeout = null;
        this.maxReconnectDelay = CONSTANTS.RECONNECT.MAX_BACKOFF_MS;

        // Message buffer for incomplete messages
        this.messageBuffer = Buffer.alloc(0);

        // HTTPS agent for API calls (ignore self-signed certs)
        this.httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });
    }

    /**
     * Get Loxone Miniserver base URL
     *
     * @returns {string} Base URL
     */
    _getBaseUrl() {
        const ip = this.config.get('loxoneIp');
        const port = this.config.get('loxoneHttpPort') || 80;
        // Use HTTP for standard port 80, HTTPS for 443 or custom ports
        const protocol = port === 80 ? 'http' : 'https';
        return `${protocol}://${ip}:${port}`;
    }

    /**
     * Get Loxone WebSocket URL
     *
     * @returns {string} WebSocket URL
     */
    _getWebSocketUrl() {
        const ip = this.config.get('loxoneIp');
        const port = this.config.get('loxoneHttpPort') || 80;
        // Use WS for standard port 80, WSS for 443 or custom ports
        const protocol = port === 80 ? 'ws' : 'wss';
        return `${protocol}://${ip}:${port}/ws/rfc6455`;
    }

    /**
     * Calculate exponential backoff delay for reconnection
     *
     * @returns {number} Delay in milliseconds
     */
    _getReconnectDelay() {
        const delay = Math.min(
            5000 * Math.pow(2, this.reconnectAttempts),
            this.maxReconnectDelay
        );
        this.reconnectAttempts++;
        return delay;
    }

    /**
     * Reset reconnection backoff
     */
    _resetReconnectBackoff() {
        this.reconnectAttempts = 0;
    }

    /**
     * Make HTTP request to Loxone API
     *
     * @param {string} endpoint - API endpoint (e.g., '/jdev/cfg/apiKey')
     * @returns {Promise<Object>} Response data
     */
    async _httpRequest(endpoint) {
        let url = `${this._getBaseUrl()}${endpoint}`;

        // Add JWT token if authenticated
        // Since v11.2, plain text token is supported (we have v16.1)
        if (this.jwtToken) {
            const user = this.config.get('loxoneUser');
            const separator = endpoint.includes('?') ? '&' : '?';
            url += `${separator}autht=${this.jwtToken}&user=${user}`;
            this.logger.debug(`HTTP request with JWT token to: ${endpoint}`, 'LOXONE');
        } else {
            this.logger.debug(`HTTP request without token to: ${endpoint}`, 'LOXONE');
        }

        try {
            const response = await axios.get(url, {
                httpsAgent: this.httpsAgent,
                timeout: 10000
            });

            return response.data;
        } catch (error) {
            throw new Error(`HTTP request failed: ${error.message}`);
        }
    }

    /**
     * Send command via WebSocket
     *
     * @param {string} command - Command to send
     * @param {boolean} encrypted - Whether to encrypt the command
     * @returns {Promise<Object>} Response data
     */
    async _sendCommand(command, encrypted = false) {
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
            }, 10000);

            // Set up one-time response handler
            const responseHandler = (data) => {
                clearTimeout(timeout);
                this.removeListener('text_message', responseHandler);
                resolve(data);
            };

            this.once('text_message', responseHandler);
            this.ws.send(fullCommand);
        });
    }

    /**
     * Encrypt command using session key
     *
     * @param {string} command - Command to encrypt
     * @returns {string} Encrypted command
     */
    _encryptCommand(command) {
        if (!this.sessionKey || !this.sessionIv) {
            throw new Error('Session key not initialized');
        }

        // Generate new salt for replay protection
        const prevSalt = this.currentSalt;
        const nextSalt = generateSalt();

        // Build payload with salt
        // First command or salt update
        let payload;
        if (prevSalt) {
            // Use nextSalt format for replay protection
            payload = `nextSalt/${prevSalt}/${nextSalt}/${command}`;
        } else {
            // First command - simple salt format
            payload = `salt/${nextSalt}/${command}`;
        }

        // Update current salt for next command
        this.currentSalt = nextSalt;

        // Encrypt
        const encrypted = aesEncrypt(payload, this.sessionKey, this.sessionIv);

        // URL encode
        const encoded = encodeURIComponent(encrypted);

        return `jdev/sys/enc/${encoded}`;
    }

    /**
     * Perform key exchange (RSA-encrypted session key)
     */
    async _performKeyExchange() {
        try {
            // Generate session key and IV
            this.sessionKey = generateAesKey();
            this.sessionIv = generateAesIv();
            this.currentSalt = generateSalt();

            this.logger.debug('Generated session key and IV', 'LOXONE');

            // Build payload: key:iv
            const payload = `${this.sessionKey}:${this.sessionIv}`;

            // RSA encrypt with public key
            const encrypted = rsaEncrypt(payload, this.publicKey);

            // Send key exchange command
            const command = `jdev/sys/keyexchange/${encrypted}`;
            await this._sendCommand(command, false);

            this.logger.success('Key exchange completed', 'LOXONE');
        } catch (error) {
            throw new Error(`Key exchange failed: ${error.message}`);
        }
    }

    /**
     * Authenticate with Loxone Miniserver
     */
    async _authenticate() {
        try {
            const user = this.config.get('loxoneUser');
            const password = this.config.get('loxonePassword');
            const existingToken = this.config.get('loxoneToken');
            const tokenExpiry = this.config.get('loxoneTokenExpiry');

            if (!user || !password) {
                throw new Error('Loxone credentials not configured');
            }

            // Check if we have a valid existing token
            const now = Math.floor(Date.now() / 1000);
            const loxoneEpoch = 1230768000; // 2009-01-01 00:00:00 UTC
            const currentLoxoneTime = now - loxoneEpoch;

            if (existingToken && tokenExpiry && tokenExpiry > currentLoxoneTime) {
                this.logger.debug('Using existing token', 'LOXONE');
                this.jwtToken = existingToken;
                this.tokenExpiry = tokenExpiry;

                // JWT tokens don't need additional authentication - they are already valid
                this.logger.success('Existing JWT token is valid', 'LOXONE');
            } else {
                this.logger.debug('Requesting new token', 'LOXONE');

                // Get new token (already authenticated)
                await this._getNewToken(user, password);
            }

            // Authenticate WebSocket session with JWT token
            await this._authenticateWebSocketWithJWT();

            this.isAuthenticated = true;
            this.logger.success('Authentication completed', 'LOXONE');
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    /**
     * Authenticate WebSocket session with JWT token
     */
    async _authenticateWebSocketWithJWT() {
        try {
            const user = this.config.get('loxoneUser');

            // Get key for hashing the token
            const getKeyCommand = `jdev/sys/getkey2/${user}`;
            const keyResponse = await this._sendCommand(getKeyCommand, false);
            const keyData = JSON.parse(keyResponse);

            if (!keyData || !keyData.LL || (keyData.LL.code !== '200' && keyData.LL.Code !== '200')) {
                throw new Error('Failed to get key for JWT token hash');
            }

            const serverKeyHex = keyData.LL.value.key;
            const serverKey = Buffer.from(serverKeyHex, 'hex').toString('utf8');

            // Hash JWT token with server key
            this.tokenHash = hmacSha256(this.jwtToken, serverKey);

            // Authenticate WebSocket session with token hash
            const authCommand = `authwithtoken/${this.tokenHash}/${user}`;
            const authResponse = await this._sendCommand(authCommand, false);
            const authData = JSON.parse(authResponse);

            if (!authData || !authData.LL || (authData.LL.code !== '200' && authData.LL.Code !== '200')) {
                throw new Error('WebSocket authentication with token failed');
            }

            this.logger.success('WebSocket session authenticated with JWT token', 'LOXONE');
        } catch (error) {
            throw new Error(`JWT WebSocket authentication failed: ${error.message}`);
        }
    }

    /**
     * Get new JWT token
     *
     * @param {string} user - Username
     * @param {string} password - Password
     */
    async _getNewToken(user, password) {
        try {
            // Step 1: Get key and salt from server
            const getKeyCommand = `jdev/sys/getkey2/${user}`;
            const keyResponse = await this._sendCommand(getKeyCommand, false);
            const keyData = JSON.parse(keyResponse);

            if (!keyData || !keyData.LL || (keyData.LL.code !== '200' && keyData.LL.Code !== '200')) {
                throw new Error('Failed to get key from server');
            }

            const serverKeyHex = keyData.LL.value.key;
            const userSalt = keyData.LL.value.salt;
            const hashAlg = keyData.LL.value.hashAlg || 'SHA256';

            // Decode server key from hex
            const serverKey = Buffer.from(serverKeyHex, 'hex').toString('utf8');

            this.logger.debug(`Got server key (hex: ${serverKeyHex.substring(0, 20)}...), salt, and hash algorithm (${hashAlg})`, 'LOXONE');

            // Step 2: Hash password with user salt
            const pwHash = hashPassword(password, userSalt, hashAlg);

            // Step 3: Create HMAC with credentials
            const credentialsHash = hmacSha256(`${user}:${pwHash}`, serverKey);

            // Step 4: Request JWT token (must be encrypted)
            const uuid = this._generateClientUuid();
            const info = encodeURIComponent('loxHueBridge');
            const permission = 4; // App permission (long-lived)

            const tokenCommand = `jdev/sys/getjwt/${credentialsHash}/${user}/${permission}/${uuid}/${info}`;

            this.logger.debug('Requesting JWT token...', 'LOXONE');
            const tokenResponse = await this._sendCommand(tokenCommand, true); // MUST be encrypted!
            const tokenData = JSON.parse(tokenResponse);

            if (!tokenData || !tokenData.LL || (tokenData.LL.code !== '200' && tokenData.LL.Code !== '200')) {
                throw new Error(`Token request failed: ${JSON.stringify(tokenData)}`);
            }

            this.token = tokenData.LL.value.token;
            this.tokenExpiry = tokenData.LL.value.validUntil;
            this.tokenRights = tokenData.LL.value.tokenRights;

            this.logger.success('JWT token acquired', 'LOXONE');

            // Save token to config
            this.config.set('loxoneToken', this.token);
            this.config.set('loxoneTokenExpiry', this.tokenExpiry);
            this.config.save();
        } catch (error) {
            throw new Error(`Failed to get token: ${error.message}`);
        }
    }

    /**
     * Authenticate with existing token
     */
    async _authenticateWithToken() {
        try {
            const user = this.config.get('loxoneUser');

            // Get key for hashing token
            const getKeyCommand = `jdev/sys/getkey2/${user}`;
            const keyResponse = await this._sendCommand(getKeyCommand, false);
            const keyData = JSON.parse(keyResponse);

            if (!keyData || !keyData.LL || (keyData.LL.code !== '200' && keyData.LL.Code !== '200')) {
                throw new Error('Failed to get key for token auth');
            }

            const serverKeyHex = keyData.LL.value.key;
            const serverKey = Buffer.from(serverKeyHex, 'hex').toString('utf8');

            // Hash token with server key
            const tokenHash = hmacSha256(this.token, serverKey);

            // Authenticate
            const authCommand = `jdev/sys/authwithtoken/${tokenHash}/${user}`;
            const authResponse = await this._sendCommand(authCommand, false);
            const authData = JSON.parse(authResponse);

            if (!authData || !authData.LL || (authData.LL.code !== '200' && authData.LL.Code !== '200')) {
                // Token might be expired or invalid, clear it
                this.config.set('loxoneToken', null);
                this.config.set('loxoneTokenExpiry', null);
                this.config.save();
                throw new Error('Token authentication failed');
            }

            this.logger.success('Authenticated with token', 'LOXONE');
        } catch (error) {
            throw new Error(`Token authentication failed: ${error.message}`);
        }
    }

    /**
     * Generate client UUID for token
     *
     * @returns {string} UUID in Loxone format
     */
    _generateClientUuid() {
        const crypto = require('crypto');
        const bytes = crypto.randomBytes(14); // 14 bytes for non-ffff parts

        // Format: 098802e1-02b4-603c-ffff-eee000d80cfd
        // Total: 8-4-4-4-12 hex chars = 4-2-2-2-6 bytes
        return [
            bytes.slice(0, 4).toString('hex'),   // 8 hex chars (4 bytes)
            bytes.slice(4, 6).toString('hex'),   // 4 hex chars (2 bytes)
            bytes.slice(6, 8).toString('hex'),   // 4 hex chars (2 bytes)
            'ffff',                               // 4 hex chars (fixed)
            bytes.slice(8, 14).toString('hex')   // 12 hex chars (6 bytes)
        ].join('-');
    }

    /**
     * Connect to Loxone Miniserver
     */
    async connect() {
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
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Query initial color states
            // Triggers /state commands which generate Text State updates for ColorPickerV2
            await this._queryColorStates();

            // Reset reconnect attempts on successful connection
            this.reconnectAttempts = 0;

            this.logger.success('Connected and authenticated to Loxone Miniserver', 'LOXONE');
        } catch (error) {
            this.logger.error(`Failed to connect to Loxone: ${error.message}`, 'LOXONE');
            this._scheduleReconnect();
        }
    }

    /**
     * Check Miniserver availability
     */
    async _checkAvailability() {
        try {
            const data = await this._httpRequest('/jdev/cfg/apiKey');
            this.logger.debug(`Miniserver status: ${JSON.stringify(data)}`, 'LOXONE');

            if (data.LL && data.LL.Code === '200') {
                this.logger.debug('Miniserver is reachable', 'LOXONE');
            } else {
                throw new Error('Miniserver returned non-200 status');
            }
        } catch (error) {
            throw new Error(`Availability check failed: ${error.message}`);
        }
    }

    /**
     * Get public key from Miniserver
     */
    async _getPublicKey() {
        try {
            const certPem = await this._httpRequest('/jdev/sys/getcertificate');
            this.logger.debug(`Raw certificate response type: ${typeof certPem}`, 'LOXONE');
            this.logger.debug(`Raw certificate response: ${JSON.stringify(certPem).substring(0, 200)}...`, 'LOXONE');

            // Check if response is wrapped in JSON
            const certData = typeof certPem === 'object' && certPem.LL && certPem.LL.value
                ? certPem.LL.value
                : certPem;

            this.logger.debug(`Certificate data to parse: ${typeof certData === 'string' ? certData.substring(0, 100) : certData}`, 'LOXONE');
            this.publicKey = extractPublicKey(certData);
            this.logger.debug('Public key retrieved', 'LOXONE');
        } catch (error) {
            throw new Error(`Failed to get public key: ${error.message}`);
        }
    }

    /**
     * Establish WebSocket connection
     */
    async _connectWebSocket() {
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
                this._handleMessage(data);
            });

            // Timeout if connection takes too long
            setTimeout(() => {
                if (!this.isConnected) {
                    reject(new Error('WebSocket connection timeout'));
                    this.ws.close();
                }
            }, 10000);
        });
    }

    /**
     * Handle incoming WebSocket message
     *
     * @param {Buffer} data - Raw message data
     */
    _handleMessage(data) {
        try {
            // Append to buffer
            this.messageBuffer = Buffer.concat([this.messageBuffer, data]);

            // Try to parse complete messages
            while (this.messageBuffer.length >= 8) {
                // Check if we have a complete message
                const headerLength = this.messageBuffer.readUInt32LE(4);
                const totalLength = 8 + headerLength;

                if (this.messageBuffer.length < totalLength) {
                    // Wait for more data
                    break;
                }

                // Extract complete message
                const messageData = this.messageBuffer.slice(0, totalLength);
                this.messageBuffer = this.messageBuffer.slice(totalLength);

                // Parse and handle message
                const message = parseMessage(messageData);
                this._processMessage(message);
            }
        } catch (error) {
            this.logger.error(`Failed to handle message: ${error.message}`, 'LOXONE');
        }
    }

    /**
     * Process parsed message
     *
     * @param {Object} message - Parsed message
     */
    _processMessage(message) {
        switch (message.type) {
            case 'text':
                this.logger.debug(`Text message: ${message.data}`, 'LOXONE');
                this.emit('text_message', message.data);
                break;

            case 'value_states':
                this.logger.debug(`Value states: ${message.data.length} updates`, 'LOXONE');

                // Store state values
                message.data.forEach(state => {
                    this.stateValues.set(state.uuid, state.value);
                });

                // Process and enrich state updates with control info
                const enrichedUpdates = message.data.map(state => {
                    const controlInfo = this.getControlByStateUuid(state.uuid);
                    return {
                        ...state,
                        control: controlInfo
                    };
                }).filter(state => state.control !== null); // Only emit states we know about

                if (enrichedUpdates.length > 0) {
                    this.emit('value_states', enrichedUpdates);
                }
                break;

            case 'text_states':
                this.logger.debug(`Text states: ${message.data.length} updates`, 'LOXONE');

                // Store text states (contains color values for ColorPickerV2)
                message.data.forEach(state => {
                    this.stateValues.set(state.uuid, state.text);

                    // Log ALL text state updates for debugging (including UUID)
                    this.logger.debug(`Text state: UUID=${state.uuid}, text="${state.text}"`, 'LOXONE');

                    const controlInfo = this.getControlByStateUuid(state.uuid);
                    if (controlInfo) {
                        this.logger.debug(`  → Control: ${controlInfo.controlName} (${controlInfo.stateName})`, 'LOXONE');
                    } else {
                        this.logger.debug(`  → UUID not found in state index`, 'LOXONE');
                    }
                });

                this.emit('text_states', message.data);
                break;

            case 'keepalive':
                this.lastKeepaliveResponse = Date.now();
                this.logger.debug('Keepalive response received', 'LOXONE');
                break;

            case 'out_of_service':
                this.logger.warn('Miniserver is out of service', 'LOXONE');
                break;

            default:
                this.logger.debug(`Unknown message type: ${message.type}`, 'LOXONE');
        }
    }

    /**
     * Start keepalive interval
     */
    _startKeepalive() {
        this._stopKeepalive();

        // Send keepalive every 4 minutes (timeout is 5 minutes)
        this.keepaliveInterval = setInterval(() => {
            if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.logger.debug('Sending keepalive', 'LOXONE');
                this.ws.send('keepalive');
            }
        }, 4 * 60 * 1000);
    }

    /**
     * Stop keepalive interval
     */
    _stopKeepalive() {
        if (this.keepaliveInterval) {
            clearInterval(this.keepaliveInterval);
            this.keepaliveInterval = null;
        }
    }

    /**
     * Handle disconnection
     */
    _handleDisconnect() {
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
    _scheduleReconnect() {
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
    disconnect() {
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
    }

    /**
     * Send control command to Loxone
     *
     * @param {string} uuid - Control UUID
     * @param {string|number} value - Control value
     */
    async sendCommand(uuid, value) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Not authenticated');
            }

            const command = `jdev/sps/io/${uuid}/${value}`;
            this.logger.debug(`Sending control command: ${command}`, 'LOXONE');

            // Try unencrypted first (works after JWT auth according to docs)
            const response = await this._sendCommand(command, false);
            const data = JSON.parse(response);

            if (!data || !data.LL || data.LL.Code !== '200') {
                throw new Error(`Command failed: ${JSON.stringify(data)}`);
            }

            this.logger.debug(`Command successful: ${uuid} = ${value}`, 'LOXONE');
        } catch (error) {
            this.logger.error(`Failed to send command: ${error.message}`, 'LOXONE');
            throw error;
        }
    }

    /**
     * Enable binary status updates
     */
    async enableStatusUpdates() {
        try {
            this.logger.debug('Enabling binary status updates...', 'LOXONE');

            const command = 'jdev/sps/enablebinstatusupdate';
            const responseText = await this._sendCommand(command, false); // Unencrypted after JWT auth
            const response = JSON.parse(responseText);

            // Check response code
            if (response && response.LL && (response.LL.code === '200' || response.LL.Code === '200')) {
                this.logger.success('Binary status updates enabled', 'LOXONE');
            } else {
                const code = response?.LL?.code || response?.LL?.Code || 'unknown';
                throw new Error(`Command failed with code ${code}`);
            }
        } catch (error) {
            throw new Error(`Failed to enable status updates: ${error.message}`);
        }
    }

    /**
     * Load structure file (LoxAPP3.json) with caching and version checking
     */
    async loadStructureFile() {
        try {
            const cachePath = path.join(__dirname, '../../data/loxone-structure.json');

            // Check if cache exists
            if (fs.existsSync(cachePath)) {
                try {
                    const cachedData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

                    // Get current version from Miniserver
                    const currentVersion = await this._getStructureVersion();

                    // Compare versions
                    if (cachedData.lastModified === currentVersion) {
                        this.logger.info('Using cached structure file (up to date)', 'LOXONE');
                        this.structure = cachedData;
                        this.structureVersion = currentVersion;
                        this._buildStateUuidIndex();
                        this.logger.success(`State UUID index built (${this.stateUuidIndex.size} states)`, 'LOXONE');
                        return;
                    } else {
                        this.logger.info(`Structure file outdated (cached: ${cachedData.lastModified}, current: ${currentVersion})`, 'LOXONE');
                    }
                } catch (cacheError) {
                    this.logger.warn(`Failed to load cached structure file: ${cacheError.message}`, 'LOXONE');
                }
            }

            // Load fresh structure file from Miniserver
            this.logger.debug('Loading structure file from Miniserver...', 'LOXONE');
            const data = await this._httpRequest('/data/LoxAPP3.json');

            if (!data) {
                throw new Error('Structure file is empty');
            }

            // Persist to disk
            try {
                fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
                this.logger.debug('Structure file cached to disk', 'LOXONE');
            } catch (writeError) {
                this.logger.warn(`Failed to cache structure file: ${writeError.message}`, 'LOXONE');
            }

            this.structure = data;
            this.structureVersion = data.lastModified;
            this.logger.success(`Structure file loaded (${data.msInfo.projectName})`, 'LOXONE');

            // Build state UUID index
            this._buildStateUuidIndex();

            this.logger.success(`State UUID index built (${this.stateUuidIndex.size} states)`, 'LOXONE');
        } catch (error) {
            throw new Error(`Failed to load structure file: ${error.message}`);
        }
    }

    /**
     * Get current structure file version from Miniserver
     */
    async _getStructureVersion() {
        try {
            const responseText = await this._sendCommand('jdev/sps/LoxAPPversion3', false);
            const response = JSON.parse(responseText);

            if (response && response.LL && response.LL.value) {
                return response.LL.value;
            }

            throw new Error('Invalid version response');
        } catch (error) {
            this.logger.warn(`Failed to get structure version: ${error.message}`, 'LOXONE');
            return null;
        }
    }

    /**
     * Check if structure file has changed and reload if necessary
     * Called on reconnect or when receiving structure change events
     */
    async checkAndReloadStructureFile() {
        try {
            const currentVersion = await this._getStructureVersion();

            if (!currentVersion) {
                this.logger.warn('Could not check structure file version', 'LOXONE');
                return false;
            }

            if (this.structureVersion !== currentVersion) {
                this.logger.info(`Structure file changed (${this.structureVersion} → ${currentVersion}), reloading...`, 'LOXONE');
                await this.loadStructureFile();

                // Emit event for other services (e.g., BidirectionalSyncManager)
                this.emit('structure_changed', this.structure);

                return true;
            }

            this.logger.debug('Structure file up to date', 'LOXONE');
            return false;
        } catch (error) {
            this.logger.error(`Failed to check structure file version: ${error.message}`, 'LOXONE');
            return false;
        }
    }

    /**
     * Build reverse index: stateUuid → control info
     */
    _buildStateUuidIndex() {
        this.stateUuidIndex.clear();

        if (!this.structure || !this.structure.controls) {
            return;
        }

        // Iterate through all controls
        for (const [controlUuid, control] of Object.entries(this.structure.controls)) {
            // Process main control states
            if (control.states) {
                for (const [stateName, stateUuid] of Object.entries(control.states)) {
                    this.stateUuidIndex.set(stateUuid, {
                        controlUuid,
                        controlName: control.name,
                        controlType: control.type,
                        stateName,
                        isSubControl: false
                    });
                }
            }

            // Process subcontrols (e.g., individual lights in LightControllerV2)
            if (control.subControls) {
                for (const [subControlUuid, subControl] of Object.entries(control.subControls)) {
                    if (subControl.states) {
                        for (const [stateName, stateUuid] of Object.entries(subControl.states)) {
                            this.stateUuidIndex.set(stateUuid, {
                                controlUuid: subControlUuid,
                                controlName: subControl.name,
                                controlType: subControl.type,
                                parentControlUuid: controlUuid,
                                parentControlName: control.name,
                                stateName,
                                isSubControl: true
                            });
                        }
                    }
                }
            }
        }

        this.logger.debug(`Indexed ${this.stateUuidIndex.size} state UUIDs`, 'LOXONE');
    }

    /**
     * Query initial control states by triggering state updates
     * Sends /state command to each SubControl, which triggers a Binary Status Update
     * with the current value.
     */
    async _queryColorStates() {
        if (!this.structure || !this.structure.controls) {
            return;
        }

        const controlsToQuery = [];

        // Collect all SubControls (Dimmer, ColorPickerV2, Switch) AND LightControllerV2 for moods
        for (const [controlUuid, control] of Object.entries(this.structure.controls)) {
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
                for (const [subUuid, subControl] of Object.entries(control.subControls)) {
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
                const colorStateUuid = this._findColorStateUuid(cp.uuid);
                this.logger.debug(`  - ${cp.name}: ${colorStateUuid}`, 'LOXONE');
            }
        }

        // Trigger state update for each control
        for (const controlInfo of controlsToQuery) {
            try {
                // Send /state command - this triggers a Binary Status Update
                const response = await this._sendCommand(`jdev/sps/io/${controlInfo.uuid}/state`, false);
                const data = JSON.parse(response);

                if (data && data.LL && data.LL.Code === '200') {
                    this.logger.debug(`State update triggered for ${controlInfo.name} (${controlInfo.type})`, 'LOXONE');
                } else {
                    this.logger.warn(`Failed to trigger state update for ${controlInfo.name}: ${JSON.stringify(data)}`, 'LOXONE');
                }
            } catch (error) {
                this.logger.warn(`Failed to trigger state update for ${controlInfo.name}: ${error.message}`, 'LOXONE');
            }
        }

        this.logger.success(`Triggered state updates for ${controlsToQuery.length} controls`, 'LOXONE');
    }

    /**
     * Find color state UUID for a ColorPickerV2 control
     */
    _findColorStateUuid(uuidAction) {
        if (!this.structure || !this.structure.controls) {
            return null;
        }

        for (const control of Object.values(this.structure.controls)) {
            if (control.subControls) {
                for (const [subUuid, subControl] of Object.entries(control.subControls)) {
                    if (subControl.uuidAction === uuidAction && subControl.type === 'ColorPickerV2') {
                        return subControl.states?.color || null;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Get control info for a state UUID
     *
     * @param {string} stateUuid - State UUID
     * @returns {Object|null} Control info or null if not found
     */
    getControlByStateUuid(stateUuid) {
        return this.stateUuidIndex.get(stateUuid) || null;
    }

    /**
     * Get current value for a state UUID
     *
     * @param {string} stateUuid - State UUID
     * @returns {number|null} Current value or null if not available
     */
    getStateValue(stateUuid) {
        return this.stateValues.has(stateUuid) ? this.stateValues.get(stateUuid) : null;
    }
}

module.exports = LoxoneClient;
