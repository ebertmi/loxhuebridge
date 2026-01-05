/**
 * Test Script for Loxone Phase 3 Implementation
 * Tests BidirectionalSyncManager, loop prevention, and EventStream integration
 */

console.log('Testing Loxone Phase 3 Implementation...\n');

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

// Mock dependencies
class MockHueClient {
    async updateLight(uuid, resourceType, payload, name) {
        this.lastUpdate = { uuid, resourceType, payload, name };
    }
}

class MockLoxoneClient {
    constructor() {
        this.commands = [];
    }
    async sendCommand(uuid, value) {
        this.commands.push({ uuid, value });
    }
    on(event, handler) {
        this.eventHandlers = this.eventHandlers || {};
        this.eventHandlers[event] = handler;
    }
    emit(event, data) {
        if (this.eventHandlers && this.eventHandlers[event]) {
            this.eventHandlers[event](data);
        }
    }
    removeAllListeners() {
        this.eventHandlers = {};
    }
}

class MockLoxoneUdp {}

class MockConfig {
    constructor() {
        this.data = {
            bidirectionalDebounceMs: 2000
        };
        this.mapping = [];
    }
    get(key) {
        return this.data[key];
    }
    getMapping() {
        return this.mapping;
    }
}

class MockLogger {
    info() {}
    debug() {}
    success() {}
    warn() {}
    error() {}
}

// ============================================================================
// BidirectionalSyncManager Tests
// ============================================================================

console.log('--- BidirectionalSyncManager Tests ---\n');

test('Load BidirectionalSyncManager module', () => {
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');
    if (typeof BidirectionalSyncManager !== 'function') {
        throw new Error('BidirectionalSyncManager should be a class');
    }
});

test('Instantiate BidirectionalSyncManager', () => {
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');

    const config = new MockConfig();
    const logger = new MockLogger();
    const hueClient = new MockHueClient();
    const loxoneClient = new MockLoxoneClient();
    const loxoneUdp = new MockLoxoneUdp();

    const syncManager = new BidirectionalSyncManager(config, logger, hueClient, loxoneClient, loxoneUdp);

    if (!syncManager) throw new Error('Failed to create BidirectionalSyncManager');
    if (typeof syncManager.start !== 'function') throw new Error('Missing start method');
    if (typeof syncManager.stop !== 'function') throw new Error('Missing stop method');
});

test('Change source tracking', () => {
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');

    const config = new MockConfig();
    const logger = new MockLogger();
    const syncManager = new BidirectionalSyncManager(
        config, logger, new MockHueClient(), new MockLoxoneClient(), new MockLoxoneUdp()
    );

    syncManager.markChangeSource('device-123', 'hue');

    if (syncManager.changeSource.size !== 1) {
        throw new Error('Change source not tracked');
    }

    const entry = syncManager.changeSource.get('device-123');
    if (entry.source !== 'hue') {
        throw new Error('Wrong source tracked');
    }
});

test('Echo detection (within debounce window)', () => {
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');

    const config = new MockConfig();
    const logger = new MockLogger();
    const syncManager = new BidirectionalSyncManager(
        config, logger, new MockHueClient(), new MockLoxoneClient(), new MockLoxoneUdp()
    );

    // Mark a change from Hue
    syncManager.markChangeSource('device-123', 'hue');

    // Try to detect echo immediately (should be detected)
    const isEcho = syncManager._isEcho('device-123', 'hue');

    if (!isEcho) {
        throw new Error('Echo should be detected within debounce window');
    }

    if (syncManager.stats.loopsPrevented !== 1) {
        throw new Error('Loop prevention stat not incremented');
    }
});

test('No echo detection (different source)', () => {
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');

    const config = new MockConfig();
    const logger = new MockLogger();
    const syncManager = new BidirectionalSyncManager(
        config, logger, new MockHueClient(), new MockLoxoneClient(), new MockLoxoneUdp()
    );

    // Mark a change from Hue
    syncManager.markChangeSource('device-123', 'hue');

    // Check for echo from Loxone (should NOT be detected)
    const isEcho = syncManager._isEcho('device-123', 'loxone');

    if (isEcho) {
        throw new Error('Echo should not be detected for different source');
    }
});

test('No echo detection (outside debounce window)', async () => {
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');

    const config = new MockConfig();
    config.data.bidirectionalDebounceMs = 50; // Very short for testing
    const logger = new MockLogger();
    const syncManager = new BidirectionalSyncManager(
        config, logger, new MockHueClient(), new MockLoxoneClient(), new MockLoxoneUdp()
    );

    // Mark a change from Hue
    syncManager.markChangeSource('device-123', 'hue');

    // Wait longer than debounce window
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check for echo (should NOT be detected - too old)
    const isEcho = syncManager._isEcho('device-123', 'hue');

    if (isEcho) {
        throw new Error('Echo should not be detected outside debounce window');
    }
});

test('Find mapping by Hue UUID', () => {
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');

    const config = new MockConfig();
    config.mapping = [
        {
            hue_uuid: 'hue-123',
            loxone_control_uuid: 'lox-456',
            bidirectional: true
        }
    ];

    const logger = new MockLogger();
    const syncManager = new BidirectionalSyncManager(
        config, logger, new MockHueClient(), new MockLoxoneClient(), new MockLoxoneUdp()
    );

    const mapping = syncManager._findMappingByHueUuid('hue-123');

    if (!mapping) throw new Error('Mapping not found');
    if (mapping.loxone_control_uuid !== 'lox-456') {
        throw new Error('Wrong mapping returned');
    }
});

test('Find mapping by Loxone state UUID', () => {
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');

    const config = new MockConfig();
    config.mapping = [
        {
            hue_uuid: 'hue-123',
            loxone_state_uuid: 'lox-state-789',
            bidirectional: true
        }
    ];

    const logger = new MockLogger();
    const syncManager = new BidirectionalSyncManager(
        config, logger, new MockHueClient(), new MockLoxoneClient(), new MockLoxoneUdp()
    );

    const mapping = syncManager._findMappingByLoxoneStateUuid('lox-state-789');

    if (!mapping) throw new Error('Mapping not found');
    if (mapping.hue_uuid !== 'hue-123') {
        throw new Error('Wrong mapping returned');
    }
});

test('Statistics tracking', () => {
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');

    const config = new MockConfig();
    const logger = new MockLogger();
    const syncManager = new BidirectionalSyncManager(
        config, logger, new MockHueClient(), new MockLoxoneClient(), new MockLoxoneUdp()
    );

    const stats = syncManager.getStats();

    if (stats.hueToLoxone !== 0) throw new Error('Initial hueToLoxone should be 0');
    if (stats.loxoneToHue !== 0) throw new Error('Initial loxoneToHue should be 0');
    if (stats.loopsPrevented !== 0) throw new Error('Initial loopsPrevented should be 0');
    if (stats.debounceWindow !== 2000) throw new Error('Wrong debounce window');
});

test('Cleanup old entries', () => {
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');

    const config = new MockConfig();
    config.data.bidirectionalDebounceMs = 100;
    const logger = new MockLogger();
    const syncManager = new BidirectionalSyncManager(
        config, logger, new MockHueClient(), new MockLoxoneClient(), new MockLoxoneUdp()
    );

    // Add some entries
    syncManager.markChangeSource('device-1', 'hue');
    syncManager.markChangeSource('device-2', 'loxone');

    if (syncManager.changeSource.size !== 2) {
        throw new Error('Expected 2 entries');
    }

    // Manually set one entry to be very old
    const oldEntry = syncManager.changeSource.get('device-1');
    oldEntry.timestamp = Date.now() - 10000; // 10 seconds ago

    // Run cleanup
    syncManager._cleanupOldEntries();

    // Old entry should be removed
    if (syncManager.changeSource.size !== 1) {
        throw new Error('Old entry should be cleaned up');
    }

    if (!syncManager.changeSource.has('device-2')) {
        throw new Error('Recent entry should remain');
    }
});

// ============================================================================
// EventStream Integration Tests
// ============================================================================

console.log('\n--- EventStream Integration ---\n');

test('EventStream accepts bidirectionalSync parameter', () => {
    const EventStream = require('../src/services/event-stream');
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);

    const syncManager = new BidirectionalSyncManager(
        config, logger, new MockHueClient(), new MockLoxoneClient(), new MockLoxoneUdp()
    );

    const eventStream = new EventStream(
        config,
        logger,
        new MockHueClient(),
        new MockLoxoneUdp(),
        null, // statusManager
        syncManager
    );

    if (eventStream.bidirectionalSync !== syncManager) {
        throw new Error('BidirectionalSync not set correctly');
    }
});

test('EventStream setBidirectionalSync method', () => {
    const EventStream = require('../src/services/event-stream');
    const BidirectionalSyncManager = require('../src/services/bidirectional-sync');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);

    const syncManager = new BidirectionalSyncManager(
        config, logger, new MockHueClient(), new MockLoxoneClient(), new MockLoxoneUdp()
    );

    const eventStream = new EventStream(
        config,
        logger,
        new MockHueClient(),
        new MockLoxoneUdp(),
        null
    );

    if (eventStream.bidirectionalSync !== null) {
        throw new Error('BidirectionalSync should be null initially');
    }

    eventStream.setBidirectionalSync(syncManager);

    if (eventStream.bidirectionalSync !== syncManager) {
        throw new Error('BidirectionalSync not set via method');
    }
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
    console.log('\n🎉 All Phase 3 tests passed!\n');
    process.exit(0);
}
