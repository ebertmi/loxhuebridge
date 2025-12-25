/**
 * Test Logging Improvements
 * Demonstrates Winston-based structured logging
 */

const Logger = require('./src/utils/logger');
const fs = require('fs');
const path = require('path');

console.log('\n📋 Testing Winston-Based Logging System');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Create logger instance
const logger = new Logger({ debug: true });

console.log('1️⃣  Testing Different Log Levels:\n');

// Info
logger.info('Application started successfully', 'SYSTEM');

// Success
logger.success('Connected to Hue Bridge', 'HUE', {
    bridgeIp: '192.168.1.100',
    version: 'v2'
});

// Warning
logger.warn('Rate limit approaching', 'HUE', {
    currentRate: 8.5,
    maxRate: 10
});

// Error
logger.error('Failed to connect to device', 'LIGHT', {
    deviceId: 'light-abc123',
    reason: 'Device offline'
});

// Debug
logger.debug('Processing event data', 'EVENT', {
    eventType: 'button_press',
    deviceName: 'Living Room Switch'
});

console.log('\n2️⃣  Testing Hue Error Handler:\n');

// Simulate rate limit error
const rateLimitError = {
    response: { status: 429, data: { error: 'Too many requests' } }
};
logger.hueError(rateLimitError, 'HUE');

// Simulate server error
const serverError = {
    response: {
        status: 503,
        data: { error: 'Service temporarily unavailable' }
    },
    message: 'Request failed with status code 503',
    stack: 'Error: Request failed...\n    at ...'
};
logger.hueError(serverError, 'HUE');

// Simulate network error
const networkError = {
    message: 'connect ETIMEDOUT',
    code: 'ETIMEDOUT',
    stack: 'Error: connect ETIMEDOUT...\n    at ...'
};
logger.hueError(networkError, 'HUE');

console.log('\n3️⃣  Checking Log Files:\n');

// Check if log files were created
const logFiles = [
    path.join('logs', 'error.log'),
    path.join('logs', 'combined.log')
];

logFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        console.log(`✅ ${file} - ${stats.size} bytes`);

        // Read and parse last few lines
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.trim().split('\n');
        const lastLog = lines[lines.length - 1];

        try {
            const parsed = JSON.parse(lastLog);
            console.log(`   Latest entry: [${parsed.level}] ${parsed.message}`);
            if (parsed.category) {
                console.log(`   Category: ${parsed.category}`);
            }
        } catch (e) {
            // Not JSON formatted
        }
    } else {
        console.log(`❌ ${file} - Not found`);
    }
});

console.log('\n4️⃣  Testing In-Memory Buffer:\n');

const logs = logger.getLogs();
console.log(`Buffer contains ${logs.length} entries`);
console.log('Last 3 entries:');
logs.slice(-3).forEach(log => {
    console.log(`  [${log.time}] [${log.level}] [${log.cat}] ${log.msg}`);
});

console.log('\n5️⃣  Testing Debug Mode Toggle:\n');

logger.setDebugMode(false);
console.log('Debug mode disabled - debug logs will not appear:');
logger.debug('This should not appear', 'TEST');

logger.setDebugMode(true);
console.log('Debug mode re-enabled - debug logs will appear:');
logger.debug('This should appear', 'TEST');

console.log('\n\n📊 Logging Features:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ Console Output:');
console.log('   • Colorized output with emojis');
console.log('   • Human-readable format');
console.log('   • Timestamp with milliseconds');
console.log('   • Category-based organization\n');

console.log('✅ File Logging:');
console.log('   • logs/error.log - Errors only (JSON)');
console.log('   • logs/combined.log - All levels (JSON)');
console.log('   • Structured JSON format for parsing');
console.log('   • Stack traces for errors');
console.log('   • Metadata support\n');

console.log('✅ Features:');
console.log('   • Automatic log rotation (5MB max, 5 files)');
console.log('   • Configurable log levels (debug/info/warn/error)');
console.log('   • In-memory circular buffer for API');
console.log('   • Winston-based backend');
console.log('   • Backward compatible API\n');

console.log('✅ Metadata Support:');
console.log('   • Add structured data to any log');
console.log('   • JSON format for easy parsing');
console.log('   • Stack traces automatically captured');
console.log('   • Custom fields supported\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('💡 Example Log File Entry (JSON):');
console.log(JSON.stringify({
    level: 'error',
    message: 'Failed to update light',
    category: 'LIGHT',
    deviceId: 'light-abc123',
    statusCode: 503,
    timestamp: new Date().toISOString()
}, null, 2));

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
