/**
 * Test Script for Loxone Phase 4 Implementation
 * Tests Config enhancements, mapping validation, and color conversion
 */

console.log('Testing Loxone Phase 4 Implementation...\n');

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
// Config Service Tests
// ============================================================================

console.log('--- Config Service (Loxone Fields) ---\n');

test('Config has default Loxone fields', () => {
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');
    const fs = require('fs');
    const path = require('path');

    const logger = new Logger({ debug: false });
    const testDataDir = path.join(__dirname, '../data-test-phase4');

    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true });
    }

    const config = new Config(logger, testDataDir);

    if (config.get('loxoneUser') !== null) throw new Error('loxoneUser should default to null');
    if (config.get('loxonePassword') !== null) throw new Error('loxonePassword should default to null');
    if (config.get('loxoneToken') !== null) throw new Error('loxoneToken should default to null');
    if (config.get('loxoneTokenExpiry') !== null) throw new Error('loxoneTokenExpiry should default to null');
    if (config.get('bidirectionalSync') !== false) throw new Error('bidirectionalSync should default to false');
    if (config.get('bidirectionalDebounceMs') !== 2000) throw new Error('bidirectionalDebounceMs should default to 2000');

    // Cleanup
    fs.rmSync(testDataDir, { recursive: true });
});

test('Config saves and loads Loxone fields', () => {
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');
    const fs = require('fs');
    const path = require('path');

    const logger = new Logger({ debug: false });
    const testDataDir = path.join(__dirname, '../data-test-phase4-2');

    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true });
    }

    const config = new Config(logger, testDataDir);

    // Update config with Loxone fields
    config.update({
        bridgeIp: '192.168.1.1',
        appKey: 'test-key',
        loxoneIp: '192.168.1.50',
        loxonePort: 80,
        loxoneUser: 'admin',
        loxonePassword: 'secret',
        loxoneToken: 'test-token-123',
        loxoneTokenExpiry: 1234567890,
        bidirectionalSync: true,
        bidirectionalDebounceMs: 3000,
        debug: false
    });

    // Load fresh config from saved file
    const config2 = new Config(logger, testDataDir);

    if (config2.get('loxoneUser') !== 'admin') throw new Error('loxoneUser not saved/loaded');
    if (config2.get('loxonePassword') !== 'secret') throw new Error('loxonePassword not saved/loaded');
    if (config2.get('loxoneToken') !== 'test-token-123') throw new Error('loxoneToken not saved/loaded');
    if (config2.get('loxoneTokenExpiry') !== 1234567890) throw new Error('loxoneTokenExpiry not saved/loaded');
    if (config2.get('bidirectionalSync') !== true) throw new Error('bidirectionalSync not saved/loaded');
    if (config2.get('bidirectionalDebounceMs') !== 3000) throw new Error('bidirectionalDebounceMs not saved/loaded');

    // Cleanup
    fs.rmSync(testDataDir, { recursive: true });
});

test('Config validates Loxone fields correctly', () => {
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');
    const fs = require('fs');
    const path = require('path');

    const logger = new Logger({ debug: false });
    const testDataDir = path.join(__dirname, '../data-test-phase4-3');

    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true });
    }

    const config = new Config(logger, testDataDir);

    // Valid config with all new fields
    const validConfig = {
        bridgeIp: '192.168.1.1',
        appKey: 'key',
        loxoneIp: '192.168.1.50',
        loxonePort: 80,
        loxoneUser: 'admin',
        loxonePassword: 'pass',
        loxoneToken: 'token',
        loxoneTokenExpiry: 123456,
        bidirectionalSync: true,
        bidirectionalDebounceMs: 2000,
        debug: false
    };

    if (!config._isValidConfig(validConfig)) {
        throw new Error('Valid config with Loxone fields rejected');
    }

    // Invalid: bidirectionalSync not boolean
    const invalidConfig1 = { ...validConfig, bidirectionalSync: 'yes' };
    if (config._isValidConfig(invalidConfig1)) {
        throw new Error('Invalid bidirectionalSync accepted');
    }

    // Invalid: bidirectionalDebounceMs not number
    const invalidConfig2 = { ...validConfig, bidirectionalDebounceMs: 'fast' };
    if (config._isValidConfig(invalidConfig2)) {
        throw new Error('Invalid bidirectionalDebounceMs accepted');
    }

    // Cleanup
    fs.rmSync(testDataDir, { recursive: true });
});

test('Config handles backward compatibility', () => {
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');
    const fs = require('fs');
    const path = require('path');

    const logger = new Logger({ debug: false });
    const testDataDir = path.join(__dirname, '../data-test-phase4-4');

    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true });
    }

    // Create config directory
    fs.mkdirSync(testDataDir, { recursive: true });

    // Write old-style config without Loxone fields
    const oldConfig = {
        bridgeIp: '192.168.1.1',
        appKey: 'test-key',
        loxoneIp: '192.168.1.50',
        loxonePort: 61263,
        debug: false,
        transitionTime: 400
    };

    fs.writeFileSync(
        path.join(testDataDir, 'config.json'),
        JSON.stringify(oldConfig, null, 4)
    );

    // Load config - should add missing fields
    const config = new Config(logger, testDataDir);

    if (config.get('loxoneUser') !== null) throw new Error('Missing loxoneUser not defaulted');
    if (config.get('bidirectionalSync') !== false) throw new Error('Missing bidirectionalSync not defaulted');
    if (config.get('bidirectionalDebounceMs') !== 2000) throw new Error('Missing bidirectionalDebounceMs not defaulted');

    // Cleanup
    fs.rmSync(testDataDir, { recursive: true });
});

// ============================================================================
// Mapping Validation Tests
// ============================================================================

console.log('\n--- Mapping Validation (Bidirectional Fields) ---\n');

test('Mapping accepts bidirectional fields', () => {
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');
    const fs = require('fs');
    const path = require('path');

    const logger = new Logger({ debug: false });
    const testDataDir = path.join(__dirname, '../data-test-phase4-5');

    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true });
    }

    const config = new Config(logger, testDataDir);

    const mapping = [
        {
            loxone_name: 'test_light',
            hue_uuid: 'hue-123',
            hue_name: 'Test Light',
            hue_type: 'light',
            sync_lox: true,
            loxone_control_uuid: 'lox-control-456',
            loxone_state_uuid: 'lox-state-789',
            loxone_dimmer_uuid: 'lox-dimmer-012',
            bidirectional: true
        }
    ];

    const validated = config._validateMapping(mapping);

    if (validated.length !== 1) throw new Error('Valid mapping rejected');
    if (validated[0].loxone_control_uuid !== 'lox-control-456') throw new Error('loxone_control_uuid not preserved');
    if (validated[0].bidirectional !== true) throw new Error('bidirectional not preserved');

    // Cleanup
    fs.rmSync(testDataDir, { recursive: true });
});

test('Mapping rejects invalid bidirectional fields', () => {
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');
    const fs = require('fs');
    const path = require('path');

    const logger = new Logger({ debug: false });
    const testDataDir = path.join(__dirname, '../data-test-phase4-6');

    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true });
    }

    const config = new Config(logger, testDataDir);

    // Invalid: bidirectional not boolean
    const mapping1 = [
        {
            loxone_name: 'test_light',
            hue_uuid: 'hue-123',
            hue_name: 'Test Light',
            hue_type: 'light',
            bidirectional: 'yes'
        }
    ];

    const validated1 = config._validateMapping(mapping1);
    if (validated1.length !== 0) throw new Error('Invalid bidirectional type accepted');

    // Invalid: loxone_control_uuid not string
    const mapping2 = [
        {
            loxone_name: 'test_light',
            hue_uuid: 'hue-123',
            hue_name: 'Test Light',
            hue_type: 'light',
            loxone_control_uuid: 12345
        }
    ];

    const validated2 = config._validateMapping(mapping2);
    if (validated2.length !== 0) throw new Error('Invalid loxone_control_uuid type accepted');

    // Cleanup
    fs.rmSync(testDataDir, { recursive: true });
});

test('Mapping handles optional bidirectional fields', () => {
    const Logger = require('../src/utils/logger');
    const Config = require('../src/config');
    const fs = require('fs');
    const path = require('path');

    const logger = new Logger({ debug: false });
    const testDataDir = path.join(__dirname, '../data-test-phase4-7');

    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true });
    }

    const config = new Config(logger, testDataDir);

    // Old-style mapping without bidirectional fields
    const mapping = [
        {
            loxone_name: 'test_light',
            hue_uuid: 'hue-123',
            hue_name: 'Test Light',
            hue_type: 'light',
            sync_lox: true
        }
    ];

    const validated = config._validateMapping(mapping);

    if (validated.length !== 1) throw new Error('Old-style mapping rejected');

    // Cleanup
    fs.rmSync(testDataDir, { recursive: true });
});

// ============================================================================
// Color Conversion Tests
// ============================================================================

console.log('\n--- Color Conversion (Reverse Functions) ---\n');

test('rgbToHsv converts RGB to HSV correctly', () => {
    const { rgbToHsv } = require('../src/utils/color');

    // Red
    const red = rgbToHsv(255, 0, 0);
    if (red.h !== 0 || red.s !== 100 || red.v !== 100) {
        throw new Error(`Red conversion failed: got h=${red.h}, s=${red.s}, v=${red.v}`);
    }

    // Green
    const green = rgbToHsv(0, 255, 0);
    if (green.h !== 120 || green.s !== 100 || green.v !== 100) {
        throw new Error(`Green conversion failed: got h=${green.h}, s=${green.s}, v=${green.v}`);
    }

    // Blue
    const blue = rgbToHsv(0, 0, 255);
    if (blue.h !== 240 || blue.s !== 100 || blue.v !== 100) {
        throw new Error(`Blue conversion failed: got h=${blue.h}, s=${blue.s}, v=${blue.v}`);
    }

    // White (no saturation)
    const white = rgbToHsv(255, 255, 255);
    if (white.s !== 0 || white.v !== 100) {
        throw new Error(`White conversion failed: got s=${white.s}, v=${white.v}`);
    }

    // Black (no value)
    const black = rgbToHsv(0, 0, 0);
    if (black.v !== 0) {
        throw new Error(`Black conversion failed: got v=${black.v}`);
    }
});

test('xyToRgb converts XY to RGB correctly', () => {
    const { xyToRgb } = require('../src/utils/color');

    // Red-ish XY coordinates
    const rgb = xyToRgb(0.6484, 0.3309, 1.0);

    if (typeof rgb.r !== 'number' || typeof rgb.g !== 'number' || typeof rgb.b !== 'number') {
        throw new Error('xyToRgb should return RGB object with numbers');
    }

    if (rgb.r < 0 || rgb.r > 255 || rgb.g < 0 || rgb.g > 255 || rgb.b < 0 || rgb.b > 255) {
        throw new Error('RGB values should be in 0-255 range');
    }
});

test('xyToLoxoneHsv produces valid Loxone HSV string', () => {
    const { xyToLoxoneHsv } = require('../src/utils/color');

    // Red-ish color with 75% brightness
    const hsv = xyToLoxoneHsv(0.6484, 0.3309, 75);

    // Should match pattern: hsv(hue,sat,val)
    const pattern = /^hsv\(\d+,\d+,\d+\)$/;
    if (!pattern.test(hsv)) {
        throw new Error(`Invalid HSV format: ${hsv}`);
    }

    // Extract values
    const match = hsv.match(/hsv\((\d+),(\d+),(\d+)\)/);
    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const v = parseInt(match[3]);

    // Validate ranges
    if (h < 0 || h > 360) throw new Error(`Hue out of range: ${h}`);
    if (s < 0 || s > 100) throw new Error(`Saturation out of range: ${s}`);
    if (v !== 75) throw new Error(`Value should be 75, got ${v}`);
});

test('mirekToLoxoneTemp produces valid Loxone temp string', () => {
    const { mirekToLoxoneTemp } = require('../src/utils/color');

    // Warm white: 500 mirek (2000K) at 80% brightness
    const temp1 = mirekToLoxoneTemp(500, 80);

    // Should match pattern: temp(kelvin,val)
    const pattern = /^temp\(\d+,\d+\)$/;
    if (!pattern.test(temp1)) {
        throw new Error(`Invalid temp format: ${temp1}`);
    }

    // Extract values
    const match1 = temp1.match(/temp\((\d+),(\d+)\)/);
    const k1 = parseInt(match1[1]);
    const v1 = parseInt(match1[2]);

    if (k1 !== 2000) throw new Error(`Expected 2000K, got ${k1}K`);
    if (v1 !== 80) throw new Error(`Expected 80% brightness, got ${v1}%`);

    // Cool white: 153 mirek (6536K) at 50% brightness
    const temp2 = mirekToLoxoneTemp(153, 50);
    const match2 = temp2.match(/temp\((\d+),(\d+)\)/);
    const k2 = parseInt(match2[1]);
    const v2 = parseInt(match2[2]);

    if (k2 !== 6536) throw new Error(`Expected 6536K, got ${k2}K`);
    if (v2 !== 50) throw new Error(`Expected 50% brightness, got ${v2}%`);
});

test('hueBrightnessToLoxoneDimmer converts correctly', () => {
    const { hueBrightnessToLoxoneDimmer } = require('../src/utils/color');

    if (hueBrightnessToLoxoneDimmer(0) !== 0) throw new Error('0% conversion failed');
    if (hueBrightnessToLoxoneDimmer(50) !== 50) throw new Error('50% conversion failed');
    if (hueBrightnessToLoxoneDimmer(100) !== 100) throw new Error('100% conversion failed');
    if (hueBrightnessToLoxoneDimmer(75.5) !== 76) throw new Error('Rounding failed'); // Should round

    // Clamping
    if (hueBrightnessToLoxoneDimmer(-10) !== 0) throw new Error('Negative clamping failed');
    if (hueBrightnessToLoxoneDimmer(150) !== 100) throw new Error('Overflow clamping failed');
});

test('Color conversion round-trip consistency', () => {
    const { xyToRgb, rgbToHsv, xyToLoxoneHsv } = require('../src/utils/color');

    // Test that the pipeline is consistent
    const x = 0.3127;
    const y = 0.3290;
    const brightness = 85;

    const rgb = xyToRgb(x, y, 1.0);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const loxHsv = xyToLoxoneHsv(x, y, brightness);

    // Extract brightness from Loxone HSV string
    const match = loxHsv.match(/hsv\(\d+,\d+,(\d+)\)/);
    const extractedBrightness = parseInt(match[1]);

    if (extractedBrightness !== brightness) {
        throw new Error('Brightness not preserved through conversion');
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
    console.log('\n🎉 All Phase 4 tests passed!\n');
    process.exit(0);
}
