/**
 * Test Script for Loxone Phase 1 Implementation
 * Tests binary parsing, crypto helpers, and LoxoneClient skeleton
 */

console.log('Testing Loxone Phase 1 Implementation...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        if (error.stack) {
            console.error(`   Stack: ${error.stack.split('\n')[1]}`);
        }
        failed++;
    }
}

// ============================================================================
// Binary Parsing Tests
// ============================================================================

console.log('--- Binary Parsing Tests ---\n');

test('Load loxone-binary module', () => {
    const binary = require('../src/utils/loxone-binary');
    if (!binary.parseMessageHeader) throw new Error('Missing parseMessageHeader');
    if (!binary.parseValueStates) throw new Error('Missing parseValueStates');
    if (!binary.parseMessage) throw new Error('Missing parseMessage');
});

test('Parse message header', () => {
    const { parseMessageHeader } = require('../src/utils/loxone-binary');

    // Create test header: marker=0x03, identifier=2, info=0, reserved=0, length=44
    const buffer = Buffer.alloc(8);
    buffer.writeUInt8(0x03, 0);
    buffer.writeUInt8(2, 1);
    buffer.writeUInt8(0, 2);
    buffer.writeUInt8(0, 3);
    buffer.writeUInt32LE(44, 4);

    const header = parseMessageHeader(buffer);
    if (header.marker !== 0x03) throw new Error('Invalid marker');
    if (header.identifier !== 2) throw new Error('Invalid identifier');
    if (header.length !== 44) throw new Error('Invalid length');
});

test('Parse value states', () => {
    const { parseValueStates } = require('../src/utils/loxone-binary');

    // Create test payload: 1 state with UUID and value
    const buffer = Buffer.alloc(44);
    const uuid = '12345678-1234-1234-1234-123456789012';
    buffer.write(uuid, 0, 'utf8');
    buffer.writeDoubleLE(75.5, 36);

    const states = parseValueStates(buffer);
    if (states.length !== 1) throw new Error('Expected 1 state');
    if (states[0].uuid !== uuid) throw new Error('UUID mismatch');
    if (Math.abs(states[0].value - 75.5) > 0.001) throw new Error('Value mismatch');
});

test('Parse complete message (keepalive)', () => {
    const { parseMessage } = require('../src/utils/loxone-binary');

    // Create keepalive message: marker=0x03, identifier=6, length=0
    const buffer = Buffer.alloc(8);
    buffer.writeUInt8(0x03, 0);
    buffer.writeUInt8(6, 1);
    buffer.writeUInt32LE(0, 4);

    const message = parseMessage(buffer);
    if (message.type !== 'keepalive') throw new Error('Expected keepalive type');
});

test('Parse complete message (value states)', () => {
    const { parseMessage } = require('../src/utils/loxone-binary');

    // Create value states message with 1 state
    const buffer = Buffer.alloc(8 + 44);
    buffer.writeUInt8(0x03, 0);
    buffer.writeUInt8(2, 1);
    buffer.writeUInt32LE(44, 4);

    const uuid = '12345678-1234-1234-1234-123456789012';
    buffer.write(uuid, 8, 'utf8');
    buffer.writeDoubleLE(50.0, 8 + 36);

    const message = parseMessage(buffer);
    if (message.type !== 'value_states') throw new Error('Expected value_states type');
    if (message.data.length !== 1) throw new Error('Expected 1 state');
    if (message.data[0].value !== 50.0) throw new Error('Value mismatch');
});

// ============================================================================
// Crypto Tests
// ============================================================================

console.log('\n--- Crypto Tests ---\n');

test('Load loxone-crypto module', () => {
    const crypto = require('../src/utils/loxone-crypto');
    if (!crypto.generateAesKey) throw new Error('Missing generateAesKey');
    if (!crypto.generateAesIv) throw new Error('Missing generateAesIv');
    if (!crypto.aesEncrypt) throw new Error('Missing aesEncrypt');
    if (!crypto.aesDecrypt) throw new Error('Missing aesDecrypt');
});

test('Generate AES key', () => {
    const { generateAesKey } = require('../src/utils/loxone-crypto');
    const key = generateAesKey();
    if (key.length !== 64) throw new Error('Key should be 64 hex chars (32 bytes)');
    if (!/^[0-9a-f]+$/i.test(key)) throw new Error('Key should be hex');
});

test('Generate AES IV', () => {
    const { generateAesIv } = require('../src/utils/loxone-crypto');
    const iv = generateAesIv();
    if (iv.length !== 32) throw new Error('IV should be 32 hex chars (16 bytes)');
    if (!/^[0-9a-f]+$/i.test(iv)) throw new Error('IV should be hex');
});

test('Generate salt', () => {
    const { generateSalt } = require('../src/utils/loxone-crypto');
    const salt = generateSalt();
    if (salt.length !== 4) throw new Error('Default salt should be 4 hex chars (2 bytes)');
    if (!/^[0-9a-f]+$/i.test(salt)) throw new Error('Salt should be hex');
});

test('AES encrypt and decrypt', () => {
    const { generateAesKey, generateAesIv, aesEncrypt, aesDecrypt } = require('../src/utils/loxone-crypto');

    const plaintext = 'salt/1234/jdev/sps/enablebinstatusupdate';
    const key = generateAesKey();
    const iv = generateAesIv();

    const encrypted = aesEncrypt(plaintext, key, iv);
    if (!encrypted) throw new Error('Encryption failed');
    if (typeof encrypted !== 'string') throw new Error('Encrypted should be string');

    const decrypted = aesDecrypt(encrypted, key, iv);
    if (decrypted !== plaintext) throw new Error(`Decryption mismatch: "${decrypted}" !== "${plaintext}"`);
});

test('Hash password', () => {
    const { hashPassword } = require('../src/utils/loxone-crypto');

    const hash = hashPassword('testpass', 'testsalt', 'SHA256');
    if (!hash) throw new Error('Hash failed');
    if (hash.length !== 64) throw new Error('SHA256 hash should be 64 hex chars');
    if (!/^[0-9A-F]+$/.test(hash)) throw new Error('Hash should be uppercase hex');
});

test('HMAC-SHA256', () => {
    const { hmacSha256 } = require('../src/utils/loxone-crypto');

    const hmac = hmacSha256('test data', 'test key');
    if (!hmac) throw new Error('HMAC failed');
    if (hmac.length !== 64) throw new Error('HMAC should be 64 hex chars');
    if (!/^[0-9a-f]+$/.test(hmac)) throw new Error('HMAC should be lowercase hex');
});

test('RSA encrypt (basic)', () => {
    const { rsaEncrypt } = require('../src/utils/loxone-crypto');
    const NodeRSA = require('node-rsa');

    // Generate test key pair
    const key = new NodeRSA({ b: 512 }); // Small key for testing
    key.setOptions({ encryptionScheme: 'pkcs1' }); // Match encryption scheme
    const publicKey = key.exportKey('public');

    const plaintext = 'test:data';
    const encrypted = rsaEncrypt(plaintext, publicKey);

    if (!encrypted) throw new Error('RSA encryption failed');
    if (typeof encrypted !== 'string') throw new Error('Encrypted should be base64 string');

    // Decrypt to verify
    const decrypted = key.decrypt(encrypted, 'utf8');
    if (decrypted !== plaintext) throw new Error('RSA decryption mismatch');
});

// ============================================================================
// LoxoneClient Tests
// ============================================================================

console.log('\n--- LoxoneClient Tests ---\n');

test('Load LoxoneClient module', () => {
    const LoxoneClient = require('../src/services/loxone-client');
    if (typeof LoxoneClient !== 'function') throw new Error('LoxoneClient should be a class');
});

test('Instantiate LoxoneClient', () => {
    const LoxoneClient = require('../src/services/loxone-client');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);

    const client = new LoxoneClient(config, logger);
    if (!client) throw new Error('Failed to create LoxoneClient');
    if (typeof client.connect !== 'function') throw new Error('Missing connect method');
    if (typeof client.disconnect !== 'function') throw new Error('Missing disconnect method');
    if (typeof client.sendCommand !== 'function') throw new Error('Missing sendCommand method');
});

test('LoxoneClient initial state', () => {
    const LoxoneClient = require('../src/services/loxone-client');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);

    const client = new LoxoneClient(config, logger);
    if (client.isConnected !== false) throw new Error('Should not be connected initially');
    if (client.isAuthenticated !== false) throw new Error('Should not be authenticated initially');
    if (client.ws !== null) throw new Error('WebSocket should be null initially');
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log(`Tests completed: ${passed + failed}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('='.repeat(60));

if (failed > 0) {
    process.exit(1);
} else {
    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
}
