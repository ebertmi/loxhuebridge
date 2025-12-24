/**
 * Basic Test Script for Refactored Modules
 * Tests that all modules can be loaded without errors
 */

console.log('Testing refactored modules...\n');

const tests = [];
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
        failed++;
    }
}

// Test Constants
test('Load constants', () => {
    const CONSTANTS = require('./src/constants');
    if (!CONSTANTS.LOG) throw new Error('Missing LOG constants');
    if (!CONSTANTS.COLOR) throw new Error('Missing COLOR constants');
    if (!CONSTANTS.RATE_LIMIT) throw new Error('Missing RATE_LIMIT constants');
});

// Test Utils
test('Load color utils', () => {
    const color = require('./src/utils/color');
    if (typeof color.rgbToXy !== 'function') throw new Error('Missing rgbToXy');
    if (typeof color.kelvinToMirek !== 'function') throw new Error('Missing kelvinToMirek');
});

test('Test color conversion', () => {
    const { rgbToXy, kelvinToMirek } = require('./src/utils/color');
    const xy = rgbToXy(100, 0, 0);
    if (!xy.x || !xy.y) throw new Error('Invalid XY result');
    const mirek = kelvinToMirek(6500);
    if (mirek < 100 || mirek > 1000) throw new Error('Invalid mirek result');
});

test('Load logger utils', () => {
    const Logger = require('./src/utils/logger');
    const logger = new Logger({ debug: false });
    if (typeof logger.info !== 'function') throw new Error('Missing info method');
    logger.info('Test log', 'TEST');
    const logs = logger.getLogs();
    if (logs.length === 0) throw new Error('Log not recorded');
});

test('Load XML generator', () => {
    const xml = require('./src/utils/xml-generator');
    if (typeof xml.generateOutputsXML !== 'function') throw new Error('Missing generateOutputsXML');
    if (typeof xml.generateInputsXML !== 'function') throw new Error('Missing generateInputsXML');
});

// Test Config
test('Load config module', () => {
    const Config = require('./src/config');
    const Logger = require('./src/utils/logger');
    const logger = new Logger({ debug: false });
    const config = new Config(logger, './test-data');
    if (typeof config.get !== 'function') throw new Error('Missing get method');
});

test('Load validation module', () => {
    const validation = require('./src/config/validation');
    if (typeof validation.isValidDeviceName !== 'function') throw new Error('Missing isValidDeviceName');
    if (!validation.isValidDeviceName('light1')) throw new Error('Valid name rejected');
    if (validation.isValidDeviceName('light@#$')) throw new Error('Invalid name accepted');
});

// Test Services
test('Load rate limiter', () => {
    const RateLimiter = require('./src/services/rate-limiter');
    const Logger = require('./src/utils/logger');
    const logger = new Logger({ debug: false });
    const limiter = new RateLimiter(logger);
    if (typeof limiter.enqueue !== 'function') throw new Error('Missing enqueue method');
});

test('Load Loxone UDP service', () => {
    const LoxoneUDP = require('./src/services/loxone-udp');
    const Config = require('./src/config');
    const Logger = require('./src/utils/logger');
    const logger = new Logger({ debug: false });
    const config = new Config(logger, './test-data');
    const udp = new LoxoneUDP(config, logger);
    if (typeof udp.send !== 'function') throw new Error('Missing send method');
});

test('Load Hue client', () => {
    const HueClient = require('./src/services/hue-client');
    const Config = require('./src/config');
    const Logger = require('./src/utils/logger');
    const RateLimiter = require('./src/services/rate-limiter');
    const logger = new Logger({ debug: false });
    const config = new Config(logger, './test-data');
    const limiter = new RateLimiter(logger);
    const hueClient = new HueClient(config, logger, limiter);
    if (typeof hueClient.getTargets !== 'function') throw new Error('Missing getTargets method');
});

test('Load status manager', () => {
    const StatusManager = require('./src/services/status-manager');
    const Config = require('./src/config');
    const Logger = require('./src/utils/logger');
    const LoxoneUDP = require('./src/services/loxone-udp');
    const logger = new Logger({ debug: false });
    const config = new Config(logger, './test-data');
    const udp = new LoxoneUDP(config, logger);
    const statusManager = new StatusManager(udp, logger);
    if (typeof statusManager.update !== 'function') throw new Error('Missing update method');
});

// Test Middleware
test('Load error handler middleware', () => {
    const errorHandler = require('./src/middleware/error-handler');
    if (typeof errorHandler.errorHandler !== 'function') throw new Error('Missing errorHandler');
    if (typeof errorHandler.asyncHandler !== 'function') throw new Error('Missing asyncHandler');
});

test('Load validation middleware', () => {
    const validation = require('./src/middleware/validation');
    if (typeof validation.validateLightCommand !== 'function') throw new Error('Missing validateLightCommand');
    if (typeof validation.validateMapping !== 'function') throw new Error('Missing validateMapping');
});

test('Load redirect middleware', () => {
    const redirect = require('./src/middleware/redirect');
    if (typeof redirect.redirectIfNotConfigured !== 'function') throw new Error('Missing redirectIfNotConfigured');
});

// Test Routes
test('Load setup routes', () => {
    const createSetupRoutes = require('./src/routes/setup');
    if (typeof createSetupRoutes !== 'function') throw new Error('Not a factory function');
});

test('Load API routes', () => {
    const createApiRoutes = require('./src/routes/api');
    if (typeof createApiRoutes !== 'function') throw new Error('Not a factory function');
});

test('Load lights routes', () => {
    const createLightsRoutes = require('./src/routes/lights');
    if (typeof createLightsRoutes !== 'function') throw new Error('Not a factory function');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests Passed: ${passed}`);
console.log(`Tests Failed: ${failed}`);
console.log('='.repeat(50));

if (failed > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
} else {
    console.log('\n✅ All tests passed!');
    console.log('\nThe refactored modules are ready to use.');
    console.log('Run with: node server-refactored.js');
    process.exit(0);
}
