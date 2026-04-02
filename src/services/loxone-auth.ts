/**
 * Loxone Authentication Service
 * Holds all auth/crypto session state and operations, decoupled from transport.
 * LoxoneClient creates one instance and delegates auth to it.
 */

import crypto from 'crypto';
import {
  generateAesKey,
  generateAesIv,
  generateSalt,
  extractPublicKey,
  rsaEncrypt,
  aesEncrypt,
  hashPassword,
  hmacSha1,
  hmacSha256
} from '../utils/loxone-crypto';
import CONSTANTS from '../constants';
import Config from '../config';
import Logger from '../utils/logger';

/** Minimal shape of a Loxone JSON response envelope */
interface LoxoneResponse {
  LL?: {
    code?: string;
    Code?: string;
    value?: any;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Callback for sending a raw WS/HTTP command and receiving its response */
export type SendCommandFn = (command: string, encrypt?: boolean) => Promise<string>;

/** Callback for making HTTP requests to the Miniserver */
export type HttpRequestFn = (endpoint: string) => Promise<any>;

/**
 * Manages all Loxone authentication and AES encryption state.
 * Transport (WebSocket / HTTP) stays in LoxoneClient.
 */
export class LoxoneAuthService {
  private config: Config;
  private logger: Logger;

  // Public key from Miniserver certificate (RSA)
  publicKey: string | null = null;

  // AES session state (set after key exchange)
  sessionKey: string | null = null;
  sessionIv: string | null = null;
  currentSalt: string | null = null;

  // JWT token state
  jwtToken: string | null = null;
  tokenHash: string | null = null;
  tokenExpiry: number | null = null;

  constructor(config: Config, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /** Clear all session state (call on disconnect/reconnect) */
  reset(): void {
    this.publicKey = null;
    this.sessionKey = null;
    this.sessionIv = null;
    this.currentSalt = null;
    this.jwtToken = null;
    this.tokenHash = null;
    this.tokenExpiry = null;
  }

  /**
   * Fetch the Miniserver's RSA public key via its certificate endpoint.
   */
  async fetchPublicKey(httpRequest: HttpRequestFn): Promise<void> {
    try {
      const certPem = await httpRequest('/jdev/sys/getcertificate');
      this.logger.debug(`Raw certificate response type: ${typeof certPem}`, 'LOXONE');
      this.logger.debug(`Raw certificate response: ${JSON.stringify(certPem).substring(0, 200)}...`, 'LOXONE');

      const certData = typeof certPem === 'object' && certPem.LL && certPem.LL.value
        ? certPem.LL.value
        : certPem;

      this.logger.debug(`Certificate data to parse: ${typeof certData === 'string' ? certData.substring(0, 100) : certData}`, 'LOXONE');
      this.publicKey = extractPublicKey(certData);
      this.logger.debug('Public key retrieved', 'LOXONE');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get public key: ${message}`);
    }
  }

  /**
   * Generate an AES session key/IV, RSA-encrypt them, and send via key exchange command.
   */
  async performKeyExchange(sendCommand: SendCommandFn): Promise<void> {
    try {
      // currentSalt stays null so the first _encryptCommand uses 'salt/{s}/{cmd}' format
      this.sessionKey = generateAesKey();
      this.sessionIv = generateAesIv();
      this.currentSalt = null;

      this.logger.debug('Generated session key and IV', 'LOXONE');

      const payload = `${this.sessionKey}:${this.sessionIv}`;
      const encrypted = rsaEncrypt(payload, this.publicKey!);
      await sendCommand(`jdev/sys/keyexchange/${encrypted}`, false);

      this.logger.success('Key exchange completed', 'LOXONE');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Key exchange failed: ${message}`);
    }
  }

  /**
   * AES-encrypt a Loxone command with replay-protection salt.
   * Returns the full `jdev/sys/enc/...` URL segment.
   */
  encryptCommand(command: string): string {
    if (!this.sessionKey || !this.sessionIv) {
      throw new Error('Session key not initialized');
    }

    const prevSalt = this.currentSalt;
    const nextSalt = generateSalt();

    // First command uses 'salt/{s}/{cmd}'; subsequent ones use 'nextSalt/{prev}/{next}/{cmd}'
    const payload = prevSalt
      ? `nextSalt/${prevSalt}/${nextSalt}/${command}`
      : `salt/${nextSalt}/${command}`;

    this.currentSalt = nextSalt;

    // Miniserver requires a null terminator (undocumented)
    const encrypted = aesEncrypt(payload + '\x00', this.sessionKey, this.sessionIv);
    return `jdev/sys/enc/${encodeURIComponent(encrypted)}`;
  }

  /**
   * Authenticate the connection: reuse a cached JWT token if valid,
   * or acquire a new one, then authenticate the WebSocket session.
   */
  async authenticate(sendCommand: SendCommandFn): Promise<void> {
    try {
      const user = this.config.get('loxoneUser');
      const password = this.config.get('loxonePassword');
      const existingToken = this.config.get('loxoneToken');
      const tokenExpiry = this.config.get('loxoneTokenExpiry');

      if (!user || !password) {
        throw new Error('Loxone credentials not configured');
      }

      const now = Math.floor(Date.now() / 1000);
      const currentLoxoneTime = now - CONSTANTS.LOXONE.EPOCH;

      if (existingToken && tokenExpiry && tokenExpiry > currentLoxoneTime) {
        this.logger.debug('Using existing token', 'LOXONE');
        this.jwtToken = existingToken;
        this.tokenExpiry = tokenExpiry;
        this.logger.success('Existing JWT token is valid', 'LOXONE');
      } else {
        this.logger.debug('Requesting new token', 'LOXONE');
        await this._getNewToken(user, password, sendCommand);
      }

      await this._authenticateWithJWT(user, sendCommand);

      this.logger.success('Authentication completed', 'LOXONE');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Authentication failed: ${message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async _getNewToken(user: string, password: string, sendCommand: SendCommandFn): Promise<void> {
    try {
      const keyResponse = await sendCommand(`jdev/sys/getkey2/${user}`, false);
      const keyData: LoxoneResponse = JSON.parse(keyResponse);

      if (!keyData || !keyData.LL || (keyData.LL.code !== '200' && keyData.LL.Code !== '200')) {
        throw new Error('Failed to get key from server');
      }

      const serverKeyHex = keyData.LL.value.key;
      const userSaltHex = keyData.LL.value.salt;   // raw hex, used as-is
      const hashAlg = keyData.LL.value.hashAlg || 'SHA256';
      const serverKeyBytes = Buffer.from(serverKeyHex, 'hex'); // single decode → 40 bytes

      this.logger.debug(`Got server key, salt, and hash algorithm (${hashAlg})`, 'LOXONE');

      const pwHash = hashPassword(password, userSaltHex, hashAlg);

      const credentialsHash = hashAlg.toUpperCase() === 'SHA1'
        ? hmacSha1(`${user}:${pwHash}`, serverKeyBytes)
        : hmacSha256(`${user}:${pwHash}`, serverKeyBytes);

      const uuid = this._generateClientUuid();
      const info = encodeURIComponent('loxHueBridge');
      const permission = 4; // App permission (long-lived token)

      this.logger.debug('Requesting JWT token...', 'LOXONE');
      const tokenResponse = await sendCommand(
        `jdev/sys/getjwt/${credentialsHash}/${user}/${permission}/${uuid}/${info}`,
        false // getjwt works unencrypted on v17
      );
      const tokenData: LoxoneResponse = JSON.parse(tokenResponse);

      if (!tokenData || !tokenData.LL || (tokenData.LL.code !== '200' && tokenData.LL.Code !== '200')) {
        throw new Error(`Token request failed: ${JSON.stringify(tokenData)}`);
      }

      this.jwtToken = tokenData.LL.value.token;
      this.tokenExpiry = tokenData.LL.value.validUntil;

      this.logger.success('JWT token acquired', 'LOXONE');

      this.config.set('loxoneToken', this.jwtToken);
      this.config.set('loxoneTokenExpiry', this.tokenExpiry);
      this.config.save();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get token: ${message}`);
    }
  }

  private async _authenticateWithJWT(user: string, sendCommand: SendCommandFn): Promise<void> {
    try {
      const keyResponse = await sendCommand(`jdev/sys/getkey2/${user}`, false);
      const keyData: LoxoneResponse = JSON.parse(keyResponse);

      if (!keyData || !keyData.LL || (keyData.LL.code !== '200' && keyData.LL.Code !== '200')) {
        throw new Error('Failed to get key for JWT token hash');
      }

      const serverKeyHex = keyData.LL.value.key;
      const hashAlg = keyData.LL.value.hashAlg || 'SHA256';
      const serverKeyBytes = Buffer.from(serverKeyHex, 'hex');

      this.tokenHash = hashAlg.toUpperCase() === 'SHA1'
        ? hmacSha1(this.jwtToken!, serverKeyBytes)
        : hmacSha256(this.jwtToken!, serverKeyBytes);

      const authResponse = await sendCommand(`authwithtoken/${this.tokenHash}/${user}`, false);
      const authData: LoxoneResponse = JSON.parse(authResponse);

      if (!authData || !authData.LL || (authData.LL.code !== '200' && authData.LL.Code !== '200')) {
        throw new Error('WebSocket authentication with token failed');
      }

      this.logger.success('WebSocket session authenticated with JWT token', 'LOXONE');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`JWT WebSocket authentication failed: ${message}`);
    }
  }

  private _generateClientUuid(): string {
    const bytes = crypto.randomBytes(14);
    return [
      bytes.slice(0, 4).toString('hex'),
      bytes.slice(4, 6).toString('hex'),
      bytes.slice(6, 8).toString('hex'),
      'ffff',
      bytes.slice(8, 14).toString('hex')
    ].join('-');
  }
}
