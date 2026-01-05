/**
 * Test Script for Loxone Phase 2 Implementation
 * Tests authentication logic, structure file parsing, and state indexing
 */

console.log('Testing Loxone Phase 2 Implementation...\n');

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
// Client UUID Generation
// ============================================================================

console.log('--- Client UUID Generation ---\n');

test('Generate client UUID', () => {
    const LoxoneClient = require('../src/services/loxone-client');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);
    const client = new LoxoneClient(config, logger);

    const uuid = client._generateClientUuid();

    // Format: 098802e1-02b4-603c-ffff-eee000d80cfd
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-ffff-[0-9a-f]{12}$/;
    if (!uuidPattern.test(uuid)) {
        throw new Error(`Invalid UUID format: ${uuid}`);
    }
});

// ============================================================================
// Structure File Parsing
// ============================================================================

console.log('\n--- Structure File Parsing ---\n');

test('Parse mock structure file', () => {
    const LoxoneClient = require('../src/services/loxone-client');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);
    const client = new LoxoneClient(config, logger);

    // Create mock structure file
    const mockStructure = {
        msInfo: {
            serialNr: '504F94TESTXX',
            projectName: 'Test Project'
        },
        controls: {
            'control-uuid-1': {
                name: 'Test Light',
                type: 'Dimmer',
                states: {
                    position: 'state-uuid-1'
                }
            },
            'control-uuid-2': {
                name: 'Test Light Controller',
                type: 'LightControllerV2',
                states: {
                    activeMoods: 'state-uuid-2'
                },
                subControls: {
                    'control-uuid-2/AI1': {
                        name: 'Kitchen Light',
                        type: 'ColorPickerV2',
                        states: {
                            color: 'state-uuid-3',
                            position: 'state-uuid-4'
                        }
                    }
                }
            }
        }
    };

    client.structure = mockStructure;
    client._buildStateUuidIndex();

    if (client.stateUuidIndex.size !== 4) {
        throw new Error(`Expected 4 indexed states, got ${client.stateUuidIndex.size}`);
    }
});

test('Index main control states', () => {
    const LoxoneClient = require('../src/services/loxone-client');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);
    const client = new LoxoneClient(config, logger);

    const mockStructure = {
        msInfo: { projectName: 'Test' },
        controls: {
            'dimmer-uuid': {
                name: 'Bedroom Dimmer',
                type: 'Dimmer',
                states: {
                    position: 'position-state-uuid'
                }
            }
        }
    };

    client.structure = mockStructure;
    client._buildStateUuidIndex();

    const controlInfo = client.getControlByStateUuid('position-state-uuid');
    if (!controlInfo) throw new Error('Control info not found');
    if (controlInfo.controlName !== 'Bedroom Dimmer') {
        throw new Error('Incorrect control name');
    }
    if (controlInfo.controlType !== 'Dimmer') {
        throw new Error('Incorrect control type');
    }
    if (controlInfo.stateName !== 'position') {
        throw new Error('Incorrect state name');
    }
    if (controlInfo.isSubControl !== false) {
        throw new Error('Should not be marked as subcontrol');
    }
});

test('Index subcontrol states', () => {
    const LoxoneClient = require('../src/services/loxone-client');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);
    const client = new LoxoneClient(config, logger);

    const mockStructure = {
        msInfo: { projectName: 'Test' },
        controls: {
            'light-controller-uuid': {
                name: 'Living Room Controller',
                type: 'LightControllerV2',
                subControls: {
                    'light-controller-uuid/AI1': {
                        name: 'Main Light',
                        type: 'ColorPickerV2',
                        states: {
                            color: 'color-state-uuid'
                        }
                    }
                }
            }
        }
    };

    client.structure = mockStructure;
    client._buildStateUuidIndex();

    const controlInfo = client.getControlByStateUuid('color-state-uuid');
    if (!controlInfo) throw new Error('Control info not found');
    if (controlInfo.controlName !== 'Main Light') {
        throw new Error('Incorrect control name');
    }
    if (controlInfo.parentControlName !== 'Living Room Controller') {
        throw new Error('Incorrect parent control name');
    }
    if (controlInfo.isSubControl !== true) {
        throw new Error('Should be marked as subcontrol');
    }
});

test('Get control by state UUID (not found)', () => {
    const LoxoneClient = require('../src/services/loxone-client');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);
    const client = new LoxoneClient(config, logger);

    client.structure = { msInfo: {}, controls: {} };
    client._buildStateUuidIndex();

    const controlInfo = client.getControlByStateUuid('nonexistent-uuid');
    if (controlInfo !== null) {
        throw new Error('Should return null for unknown UUID');
    }
});

// ============================================================================
// Real Structure File Test (if available)
// ============================================================================

console.log('\n--- Real Structure File Test ---\n');

test('Load and parse example loxapp3-ebert.json', () => {
    const fs = require('fs');
    const path = require('path');
    const LoxoneClient = require('../src/services/loxone-client');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const structureFile = path.join(__dirname, '../docs/loxapp3-ebert.json');

    if (!fs.existsSync(structureFile)) {
        console.log('   ⚠️  Structure file not found, skipping test');
        passed++; // Count as passed since file is optional
        return;
    }

    const logger = new Logger({ debug: false });
    const config = new Config(logger);
    const client = new LoxoneClient(config, logger);

    const structureData = JSON.parse(fs.readFileSync(structureFile, 'utf8'));

    client.structure = structureData;
    client._buildStateUuidIndex();

    if (client.stateUuidIndex.size === 0) {
        throw new Error('No states were indexed');
    }

    console.log(`   📊 Indexed ${client.stateUuidIndex.size} state UUIDs`);

    // Try to find a specific control from the example file
    // Looking for a dimmer or color picker state
    let foundDimmer = false;
    let foundColorPicker = false;

    for (const [uuid, info] of client.stateUuidIndex.entries()) {
        if (info.controlType === 'Dimmer' && info.stateName === 'position') {
            foundDimmer = true;
            console.log(`   ✓ Found Dimmer: ${info.controlName} (${info.stateName})`);
        }
        if (info.controlType === 'ColorPickerV2' && info.stateName === 'color') {
            foundColorPicker = true;
            console.log(`   ✓ Found ColorPicker: ${info.controlName} (${info.stateName})`);
            break; // Just show one example
        }
    }

    if (!foundDimmer && !foundColorPicker) {
        console.log('   ⚠️  No familiar control types found (Dimmer, ColorPickerV2)');
    }
});

// ============================================================================
// Value State Enrichment
// ============================================================================

console.log('\n--- Value State Enrichment ---\n');

test('Enrich value states with control info', () => {
    const LoxoneClient = require('../src/services/loxone-client');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);
    const client = new LoxoneClient(config, logger);

    // Setup mock structure
    const mockStructure = {
        msInfo: { projectName: 'Test' },
        controls: {
            'dimmer-1': {
                name: 'Kitchen Dimmer',
                type: 'Dimmer',
                states: {
                    position: 'pos-state-uuid'
                }
            }
        }
    };

    client.structure = mockStructure;
    client._buildStateUuidIndex();

    // Mock value state update
    const valueStates = [
        { uuid: 'pos-state-uuid', value: 75.5 },
        { uuid: 'unknown-uuid', value: 50.0 }
    ];

    // Simulate enrichment (same logic as in _processMessage)
    const enrichedUpdates = valueStates.map(state => {
        const controlInfo = client.getControlByStateUuid(state.uuid);
        return {
            ...state,
            control: controlInfo
        };
    }).filter(state => state.control !== null);

    if (enrichedUpdates.length !== 1) {
        throw new Error(`Expected 1 enriched update, got ${enrichedUpdates.length}`);
    }

    if (enrichedUpdates[0].control.controlName !== 'Kitchen Dimmer') {
        throw new Error('Control name not enriched correctly');
    }

    if (enrichedUpdates[0].value !== 75.5) {
        throw new Error('Value not preserved');
    }
});

// ============================================================================
// Command Encryption Test
// ============================================================================

console.log('\n--- Command Encryption ---\n');

test('Encrypt command payload', () => {
    const LoxoneClient = require('../src/services/loxone-client');
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');
    const { generateAesKey, generateAesIv, generateSalt } = require('../src/utils/loxone-crypto');

    const logger = new Logger({ debug: false });
    const config = new Config(logger);
    const client = new LoxoneClient(config, logger);

    // Setup encryption keys
    client.sessionKey = generateAesKey();
    client.sessionIv = generateAesIv();
    client.currentSalt = generateSalt();

    const testCommand = 'jdev/sps/io/test-uuid/50';
    const encryptedCommand = client._encryptCommand(testCommand);

    if (!encryptedCommand.startsWith('jdev/sys/enc/')) {
        throw new Error('Encrypted command should start with jdev/sys/enc/');
    }

    // Check that it's URL encoded base64
    const encryptedPart = encryptedCommand.replace('jdev/sys/enc/', '');
    if (!encryptedPart || encryptedPart.length < 20) {
        throw new Error('Encrypted payload seems too short');
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
    console.log('\n🎉 All Phase 2 tests passed!\n');
    process.exit(0);
}
