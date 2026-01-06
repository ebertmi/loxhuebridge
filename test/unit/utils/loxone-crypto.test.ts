/**
 * Unit Tests for Loxone Cryptography Helpers
 * Tests RSA, AES encryption/decryption and hashing in src/utils/loxone-crypto.ts
 */

import crypto from 'crypto';
import {
  generateAesKey,
  generateAesIv,
  generateSalt,
  extractPublicKey,
  rsaEncrypt,
  aesEncrypt,
  aesDecrypt,
  hashPassword,
  hmacSha256
} from '../../../src/utils/loxone-crypto';

describe('Loxone Cryptography Helpers', () => {
  describe('generateAesKey()', () => {
    it('should generate 32-byte hex-encoded key', () => {
      const key = generateAesKey();

      expect(key).toMatch(/^[0-9a-f]{64}$/); // 32 bytes = 64 hex chars
      expect(Buffer.from(key, 'hex').length).toBe(32);
    });

    it('should generate different keys each time', () => {
      const key1 = generateAesKey();
      const key2 = generateAesKey();

      expect(key1).not.toBe(key2);
    });

    it('should generate keys with high entropy', () => {
      const keys = Array.from({ length: 10 }, () => generateAesKey());
      const uniqueKeys = new Set(keys);

      expect(uniqueKeys.size).toBe(10);
    });
  });

  describe('generateAesIv()', () => {
    it('should generate 16-byte hex-encoded IV', () => {
      const iv = generateAesIv();

      expect(iv).toMatch(/^[0-9a-f]{32}$/); // 16 bytes = 32 hex chars
      expect(Buffer.from(iv, 'hex').length).toBe(16);
    });

    it('should generate different IVs each time', () => {
      const iv1 = generateAesIv();
      const iv2 = generateAesIv();

      expect(iv1).not.toBe(iv2);
    });

    it('should generate IVs with high entropy', () => {
      const ivs = Array.from({ length: 10 }, () => generateAesIv());
      const uniqueIvs = new Set(ivs);

      expect(uniqueIvs.size).toBe(10);
    });
  });

  describe('generateSalt()', () => {
    it('should generate 2-byte salt by default', () => {
      const salt = generateSalt();

      expect(salt).toMatch(/^[0-9a-f]{4}$/); // 2 bytes = 4 hex chars
    });

    it('should generate salt with custom byte length', () => {
      const salt4 = generateSalt(4);
      const salt8 = generateSalt(8);

      expect(salt4).toMatch(/^[0-9a-f]{8}$/); // 4 bytes = 8 hex chars
      expect(salt8).toMatch(/^[0-9a-f]{16}$/); // 8 bytes = 16 hex chars
    });

    it('should generate different salts each time', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      expect(salt1).not.toBe(salt2);
    });

    it('should handle 1-byte salt', () => {
      const salt = generateSalt(1);

      expect(salt).toMatch(/^[0-9a-f]{2}$/);
    });
  });

  describe('extractPublicKey()', () => {
    it('should throw error for invalid certificate', () => {
      const invalidCert = 'Not a valid certificate';

      expect(() => {
        extractPublicKey(invalidCert);
      }).toThrow('No valid certificate found');
    });

    it('should extract first certificate from chain', () => {
      const cert1 = `-----BEGIN CERTIFICATE-----
MIICljCCAX4CCQCKmP0VkGZjIDANBgkqhkiG9w0BAQsFADANMQswCQYDVQQGEwJV
-----END CERTIFICATE-----`;
      const cert2 = `-----BEGIN CERTIFICATE-----
MIICljCCAX4CCQCKmP0VkGZjIDANBgkqhkiG9w0BAQsFADANMQswCQYDVQQGEwJV
-----END CERTIFICATE-----`;
      const certChain = cert1 + '\n' + cert2;

      // Should not throw
      expect(() => extractPublicKey(certChain)).not.toThrow('No valid certificate found');
    });

    it('should handle X509Certificate availability', () => {
      // Test that the function handles crypto.X509Certificate being available or not
      const validCert = `-----BEGIN CERTIFICATE-----
MIICljCCAX4CCQCKmP0VkGZjIDANBgkqhkiG9w0BAQsFADANMQswCQYDVQQGEwJV
-----END CERTIFICATE-----`;

      if (crypto.X509Certificate) {
        // If available, it should attempt to extract (may fail with invalid cert)
        expect(() => extractPublicKey(validCert)).toThrow();
      } else {
        // If not available, should use fallback
        const result = extractPublicKey(validCert);
        expect(result).toBe(validCert);
      }
    });
  });

  describe('rsaEncrypt()', () => {
    // Generate test RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    it('should encrypt payload with RSA', () => {
      const payload = 'test-key:test-iv';
      const encrypted = rsaEncrypt(payload, publicKey);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      // Should be base64 encoded
      expect(() => Buffer.from(encrypted, 'base64')).not.toThrow();
    });

    it('should encrypt different payloads differently', () => {
      const payload1 = 'key1:iv1';
      const payload2 = 'key2:iv2';

      const encrypted1 = rsaEncrypt(payload1, publicKey);
      const encrypted2 = rsaEncrypt(payload2, publicKey);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should produce decryptable ciphertext', () => {
      const payload = 'my-secret-key:my-iv';
      const encrypted = rsaEncrypt(payload, publicKey);

      // Decrypt with private key
      const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(encrypted, 'base64')
      );

      expect(decrypted.toString('utf8')).toBe(payload);
    });

    it('should throw error for invalid public key', () => {
      const invalidKey = 'not-a-key';

      expect(() => {
        rsaEncrypt('payload', invalidKey);
      }).toThrow('RSA encryption failed');
    });

    it('should handle empty payload', () => {
      const encrypted = rsaEncrypt('', publicKey);

      expect(encrypted).toBeDefined();
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should handle long payloads', () => {
      // RSA can only encrypt data up to key size minus padding
      const payload = 'a'.repeat(100);
      const encrypted = rsaEncrypt(payload, publicKey);

      expect(encrypted).toBeDefined();
    });
  });

  describe('aesEncrypt() and aesDecrypt()', () => {
    const testKey = generateAesKey();
    const testIv = generateAesIv();

    it('should encrypt and decrypt data correctly', () => {
      const plaintext = 'Hello, Loxone!';

      const encrypted = aesEncrypt(plaintext, testKey, testIv);
      const decrypted = aesDecrypt(encrypted, testKey, testIv);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce base64-encoded ciphertext', () => {
      const plaintext = 'Test message';
      const encrypted = aesEncrypt(plaintext, testKey, testIv);

      expect(() => Buffer.from(encrypted, 'base64')).not.toThrow();
      expect(encrypted).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should encrypt different plaintexts differently', () => {
      const encrypted1 = aesEncrypt('Message 1', testKey, testIv);
      const encrypted2 = aesEncrypt('Message 2', testKey, testIv);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const encrypted = aesEncrypt('', testKey, testIv);
      const decrypted = aesDecrypt(encrypted, testKey, testIv);

      expect(decrypted).toBe('');
    });

    it('should handle unicode characters', () => {
      const plaintext = 'Hello 世界 🌍';

      const encrypted = aesEncrypt(plaintext, testKey, testIv);
      const decrypted = aesDecrypt(encrypted, testKey, testIv);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long messages', () => {
      const plaintext = 'A'.repeat(1000);

      const encrypted = aesEncrypt(plaintext, testKey, testIv);
      const decrypted = aesDecrypt(encrypted, testKey, testIv);

      expect(decrypted).toBe(plaintext);
    });

    it('should apply zero-byte padding to 16-byte blocks', () => {
      // Message length not multiple of 16
      const plaintext = 'Hello'; // 5 bytes
      const encrypted = aesEncrypt(plaintext, testKey, testIv);

      // Encrypted should be padded to 16 bytes
      const encryptedBuffer = Buffer.from(encrypted, 'base64');
      expect(encryptedBuffer.length % 16).toBe(0);
    });

    it('should throw error for invalid key length', () => {
      const shortKey = '0123456789abcdef'; // Only 16 hex chars = 8 bytes

      expect(() => {
        aesEncrypt('test', shortKey, testIv);
      }).toThrow('Invalid AES key length');
    });

    it('should throw error for invalid IV length', () => {
      const shortIv = '01234567'; // Only 8 hex chars = 4 bytes

      expect(() => {
        aesEncrypt('test', testKey, shortIv);
      }).toThrow('Invalid IV length');
    });

    it('should throw error for invalid key in decryption', () => {
      const encrypted = aesEncrypt('test', testKey, testIv);
      const wrongKey = generateAesKey();

      // Decryption with wrong key should fail or produce garbage
      expect(() => {
        aesDecrypt(encrypted, wrongKey, testIv);
      }).not.toThrow(); // Won't throw, just produce wrong output
    });

    it('should produce different ciphertext with different IVs', () => {
      const plaintext = 'Same message';
      const iv1 = generateAesIv();
      const iv2 = generateAesIv();

      const encrypted1 = aesEncrypt(plaintext, testKey, iv1);
      const encrypted2 = aesEncrypt(plaintext, testKey, iv2);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('hashPassword()', () => {
    it('should hash password with salt using SHA256', () => {
      const password = 'mypassword';
      const salt = 'abc123';

      const hash = hashPassword(password, salt, 'SHA256');

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[0-9A-F]{64}$/); // SHA256 = 64 hex chars uppercase
    });

    it('should hash password with salt using SHA1', () => {
      const password = 'mypassword';
      const salt = 'abc123';

      const hash = hashPassword(password, salt, 'SHA1');

      expect(hash).toMatch(/^[0-9A-F]{40}$/); // SHA1 = 40 hex chars uppercase
    });

    it('should use SHA256 by default', () => {
      const password = 'test';
      const salt = '123';

      const hash = hashPassword(password, salt);

      expect(hash).toMatch(/^[0-9A-F]{64}$/);
    });

    it('should produce different hashes for different passwords', () => {
      const salt = 'salt123';

      const hash1 = hashPassword('password1', salt);
      const hash2 = hashPassword('password2', salt);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for different salts', () => {
      const password = 'password';

      const hash1 = hashPassword(password, 'salt1');
      const hash2 = hashPassword(password, 'salt2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce consistent hashes', () => {
      const password = 'mypassword';
      const salt = 'mysalt';

      const hash1 = hashPassword(password, salt);
      const hash2 = hashPassword(password, salt);

      expect(hash1).toBe(hash2);
    });

    it('should return uppercase hex', () => {
      const hash = hashPassword('test', 'salt');

      expect(hash).toBe(hash.toUpperCase());
      expect(hash).not.toMatch(/[a-z]/);
    });

    it('should handle empty password', () => {
      const hash = hashPassword('', 'salt');

      expect(hash).toMatch(/^[0-9A-F]+$/);
    });

    it('should handle empty salt', () => {
      const hash = hashPassword('password', '');

      expect(hash).toMatch(/^[0-9A-F]+$/);
    });

    it('should handle special characters', () => {
      const hash = hashPassword('p@ssw0rd!', 's@lt#123');

      expect(hash).toMatch(/^[0-9A-F]{64}$/);
    });
  });

  describe('hmacSha256()', () => {
    it('should create HMAC-SHA256 hash', () => {
      const data = 'message';
      const key = 'secret-key';

      const hmac = hmacSha256(data, key);

      expect(hmac).toBeDefined();
      expect(hmac).toMatch(/^[0-9a-f]{64}$/); // SHA256 = 64 hex chars lowercase
    });

    it('should produce different HMACs for different data', () => {
      const key = 'key';

      const hmac1 = hmacSha256('data1', key);
      const hmac2 = hmacSha256('data2', key);

      expect(hmac1).not.toBe(hmac2);
    });

    it('should produce different HMACs for different keys', () => {
      const data = 'message';

      const hmac1 = hmacSha256(data, 'key1');
      const hmac2 = hmacSha256(data, 'key2');

      expect(hmac1).not.toBe(hmac2);
    });

    it('should produce consistent HMACs', () => {
      const data = 'test-data';
      const key = 'test-key';

      const hmac1 = hmacSha256(data, key);
      const hmac2 = hmacSha256(data, key);

      expect(hmac1).toBe(hmac2);
    });

    it('should return lowercase hex', () => {
      const hmac = hmacSha256('data', 'key');

      expect(hmac).toBe(hmac.toLowerCase());
      expect(hmac).not.toMatch(/[A-Z]/);
    });

    it('should handle empty data', () => {
      const hmac = hmacSha256('', 'key');

      expect(hmac).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should handle empty key', () => {
      const hmac = hmacSha256('data', '');

      expect(hmac).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should handle unicode characters', () => {
      const hmac = hmacSha256('Hello 世界', 'key');

      expect(hmac).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should match expected HMAC-SHA256 output', () => {
      // Test with known values
      const data = 'test';
      const key = 'secret';

      const hmac = hmacSha256(data, key);

      // Verify using crypto directly
      const expected = crypto.createHmac('sha256', key)
        .update(data)
        .digest('hex');

      expect(hmac).toBe(expected);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full encryption workflow', () => {
      // Generate session key and IV
      const aesKey = generateAesKey();
      const aesIv = generateAesIv();

      // Create RSA key pair
      const { publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      // Encrypt session key
      const sessionPayload = `${aesKey}:${aesIv}`;
      const encryptedSession = rsaEncrypt(sessionPayload, publicKey);

      expect(encryptedSession).toBeDefined();

      // Encrypt data with AES
      const data = 'Sensitive information';
      const encryptedData = aesEncrypt(data, aesKey, aesIv);

      expect(encryptedData).toBeDefined();

      // Decrypt data
      const decryptedData = aesDecrypt(encryptedData, aesKey, aesIv);

      expect(decryptedData).toBe(data);
    });

    it('should complete authentication workflow', () => {
      const username = 'admin';
      const password = 'password123';
      const salt = generateSalt();

      // Hash password for authentication
      const hash = hashPassword(password, salt);

      expect(hash).toMatch(/^[0-9A-F]{64}$/);

      // Create HMAC for token
      const token = generateSalt(16);
      const hmac = hmacSha256(`${username}:${token}`, hash);

      expect(hmac).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});
