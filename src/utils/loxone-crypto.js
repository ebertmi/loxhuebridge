/**
 * Loxone Cryptography Helpers
 * Handles RSA and AES encryption/decryption for Loxone WebSocket communication
 */

const crypto = require('crypto');
const NodeRSA = require('node-rsa');

/**
 * Generate a random AES key (32 bytes for AES-256)
 *
 * @returns {string} Hex-encoded 32-byte key
 */
function generateAesKey() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a random AES IV (16 bytes)
 *
 * @returns {string} Hex-encoded 16-byte IV
 */
function generateAesIv() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate a random salt for replay protection
 *
 * @param {number} bytes - Number of random bytes (default: 2)
 * @returns {string} Hex-encoded random salt
 */
function generateSalt(bytes = 2) {
    return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Extract public key from PEM certificate
 *
 * @param {string} certPem - PEM-encoded certificate (may contain multiple certificates)
 * @returns {string} PEM-encoded public key
 */
function extractPublicKey(certPem) {
    // Extract only the first certificate if there are multiple (certificate chain)
    const firstCertMatch = certPem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);

    if (!firstCertMatch) {
        throw new Error('No valid certificate found in response');
    }

    const firstCert = firstCertMatch[0];

    // Create X509Certificate object (Node.js 15.6.0+)
    if (crypto.X509Certificate) {
        const x509 = new crypto.X509Certificate(firstCert);
        return x509.publicKey.export({ type: 'spki', format: 'pem' });
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
 * @param {string} payload - Payload to encrypt (e.g., "key:iv")
 * @param {string} publicKeyPem - PEM-encoded public key
 * @returns {string} Base64-encoded encrypted data
 */
function rsaEncrypt(payload, publicKeyPem) {
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
        throw new Error(`RSA encryption failed: ${error.message}`);
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
 * @param {string} plaintext - Data to encrypt
 * @param {string} keyHex - Hex-encoded 32-byte AES key
 * @param {string} ivHex - Hex-encoded 16-byte IV
 * @returns {string} Base64-encoded encrypted data
 */
function aesEncrypt(plaintext, keyHex, ivHex) {
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
        throw new Error(`AES encryption failed: ${error.message}`);
    }
}

/**
 * AES decrypt data
 *
 * @param {string} ciphertext - Base64-encoded encrypted data
 * @param {string} keyHex - Hex-encoded 32-byte AES key
 * @param {string} ivHex - Hex-encoded 16-byte IV
 * @returns {string} Decrypted plaintext
 */
function aesDecrypt(ciphertext, keyHex, ivHex) {
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
        throw new Error(`AES decryption failed: ${error.message}`);
    }
}

/**
 * Hash password with salt using specified algorithm
 *
 * @param {string} password - Password to hash
 * @param {string} salt - Salt to use
 * @param {string} algorithm - Hash algorithm ('SHA1' or 'SHA256')
 * @returns {string} Uppercase hex-encoded hash
 */
function hashPassword(password, salt, algorithm = 'SHA256') {
    const alg = algorithm.toLowerCase().replace('-', '');
    const hash = crypto.createHash(alg);
    hash.update(`${password}:${salt}`);
    return hash.digest('hex').toUpperCase();
}

/**
 * Create HMAC-SHA256 hash
 *
 * @param {string} data - Data to hash
 * @param {string} key - HMAC key
 * @returns {string} Hex-encoded HMAC (NOT uppercased per spec)
 */
function hmacSha256(data, key) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(data);
    return hmac.digest('hex');
}

module.exports = {
    generateAesKey,
    generateAesIv,
    generateSalt,
    extractPublicKey,
    rsaEncrypt,
    aesEncrypt,
    aesDecrypt,
    hashPassword,
    hmacSha256
};
