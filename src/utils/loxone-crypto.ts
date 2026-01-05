/**
 * Loxone Cryptography Helpers
 * Handles RSA and AES encryption/decryption for Loxone WebSocket communication
 */

import crypto from 'crypto';
import NodeRSA from 'node-rsa';

/**
 * Generate a random AES key (32 bytes for AES-256)
 *
 * @returns Hex-encoded 32-byte key
 */
export function generateAesKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a random AES IV (16 bytes)
 *
 * @returns Hex-encoded 16-byte IV
 */
export function generateAesIv(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate a random salt for replay protection
 *
 * @param bytes - Number of random bytes (default: 2)
 * @returns Hex-encoded random salt
 */
export function generateSalt(bytes: number = 2): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Extract public key from PEM certificate
 *
 * @param certPem - PEM-encoded certificate (may contain multiple certificates)
 * @returns PEM-encoded public key
 */
export function extractPublicKey(certPem: string): string {
  // Extract only the first certificate if there are multiple (certificate chain)
  const firstCertMatch = certPem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);

  if (!firstCertMatch) {
    throw new Error('No valid certificate found in response');
  }

  const firstCert = firstCertMatch[0];

  // Create X509Certificate object (Node.js 15.6.0+)
  if (crypto.X509Certificate) {
    const x509 = new crypto.X509Certificate(firstCert);
    return x509.publicKey.export({ type: 'spki', format: 'pem' }) as string;
  } else {
    // Fallback for older Node.js versions
    // This is a simplified extraction and may not work for all certificates
    console.warn('Using fallback public key extraction - upgrade Node.js for better support');
    return firstCert;
  }
}

/**
 * RSA encrypt session key
 *
 * According to Loxone spec:
 * - Mode: ECB
 * - Padding: PKCS1
 * - Encoding: Base64 (NoWrap)
 *
 * @param payload - Payload to encrypt (e.g., "key:iv")
 * @param publicKeyPem - PEM-encoded public key
 * @returns Base64-encoded encrypted data
 */
export function rsaEncrypt(payload: string, publicKeyPem: string): string {
  try {
    const key = new NodeRSA(publicKeyPem);

    // Configure RSA options
    key.setOptions({
      encryptionScheme: 'pkcs1' // PKCS1 padding
    });

    // Encrypt and return base64 (without wrapping)
    const encrypted = key.encrypt(payload, 'base64');

    return encrypted;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`RSA encryption failed: ${message}`);
  }
}

/**
 * AES encrypt data
 *
 * According to Loxone spec:
 * - Mode: CBC
 * - Padding: ZeroBytePadding
 * - Encoding: Base64 (NoWrap)
 * - IV: 16 bytes
 * - Block: 16 bytes
 * - Key: 32 bytes (AES-256)
 *
 * @param plaintext - Data to encrypt
 * @param keyHex - Hex-encoded 32-byte AES key
 * @param ivHex - Hex-encoded 16-byte IV
 * @returns Base64-encoded encrypted data
 */
export function aesEncrypt(plaintext: string, keyHex: string, ivHex: string): string {
  try {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');

    if (key.length !== 32) {
      throw new Error(`Invalid AES key length: expected 32 bytes, got ${key.length}`);
    }
    if (iv.length !== 16) {
      throw new Error(`Invalid IV length: expected 16 bytes, got ${iv.length}`);
    }

    // Apply zero-byte padding manually (16-byte blocks)
    const blockSize = 16;
    const plaintextBuffer = Buffer.from(plaintext, 'utf8');
    const paddingLength = blockSize - (plaintextBuffer.length % blockSize);
    const paddedPlaintext = Buffer.concat([
      plaintextBuffer,
      Buffer.alloc(paddingLength, 0)
    ]);

    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    cipher.setAutoPadding(false); // We handle padding manually

    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(paddedPlaintext),
      cipher.final()
    ]);

    // Return base64 without line wrapping
    return encrypted.toString('base64');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`AES encryption failed: ${message}`);
  }
}

/**
 * AES decrypt data
 *
 * @param ciphertext - Base64-encoded encrypted data
 * @param keyHex - Hex-encoded 32-byte AES key
 * @param ivHex - Hex-encoded 16-byte IV
 * @returns Decrypted plaintext
 */
export function aesDecrypt(ciphertext: string, keyHex: string, ivHex: string): string {
  try {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(ciphertext, 'base64');

    if (key.length !== 32) {
      throw new Error(`Invalid AES key length: expected 32 bytes, got ${key.length}`);
    }
    if (iv.length !== 16) {
      throw new Error(`Invalid IV length: expected 16 bytes, got ${iv.length}`);
    }

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(false); // We handle padding manually

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    // Remove zero-byte padding
    let endIndex = decrypted.length;
    while (endIndex > 0 && decrypted[endIndex - 1] === 0) {
      endIndex--;
    }

    return decrypted.slice(0, endIndex).toString('utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`AES decryption failed: ${message}`);
  }
}

/**
 * Hash password with salt using specified algorithm
 *
 * @param password - Password to hash
 * @param salt - Salt to use
 * @param algorithm - Hash algorithm ('SHA1' or 'SHA256')
 * @returns Uppercase hex-encoded hash
 */
export function hashPassword(password: string, salt: string, algorithm: string = 'SHA256'): string {
  const alg = algorithm.toLowerCase().replace('-', '');
  const hash = crypto.createHash(alg);
  hash.update(`${password}:${salt}`);
  return hash.digest('hex').toUpperCase();
}

/**
 * Create HMAC-SHA256 hash
 *
 * @param data - Data to hash
 * @param key - HMAC key
 * @returns Hex-encoded HMAC (NOT uppercased per spec)
 */
export function hmacSha256(data: string, key: string): string {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(data);
  return hmac.digest('hex');
}
