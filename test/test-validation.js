/**
 * Test Enhanced Parameter Validation
 * Demonstrates validation with logging and support for names with spaces
 */

const {
    isValidDeviceName,
    isValidLoxoneName,
    isValidControlValue,
    isValidIpAddress,
    isValidPort
} = require('../src/config/validation');

console.log('\n📋 Testing Enhanced Parameter Validation\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test device names
console.log('1️⃣  Device Name Validation:\n');

const deviceNameTests = [
    { name: 'living_room', valid: true, description: 'Underscore' },
    { name: 'kitchen-light', valid: true, description: 'Hyphen' },
    { name: 'bedroom.lamp', valid: true, description: 'Dot' },
    { name: 'Living Room', valid: true, description: 'With space' },
    { name: 'Master Bedroom Light', valid: true, description: 'Multiple spaces' },
    { name: 'Dining_Room Light', valid: true, description: 'Mixed: underscore + space' },
    { name: 'Office-Light 1', valid: true, description: 'Mixed: hyphen + space + number' },
    { name: ' LeadingSpace', valid: false, description: 'Leading space (invalid)' },
    { name: 'TrailingSpace ', valid: false, description: 'Trailing space (invalid)' },
    { name: 'Double  Space', valid: false, description: 'Multiple consecutive spaces (invalid)' },
    { name: 'Invalid@Char', valid: false, description: 'Special character @ (invalid)' },
    { name: 'Test<script>', valid: false, description: 'HTML injection attempt (invalid)' },
    { name: '', valid: false, description: 'Empty string (invalid)' },
    { name: 'a'.repeat(101), valid: false, description: 'Too long (>100 chars, invalid)' }
];

deviceNameTests.forEach(test => {
    const result = isValidDeviceName(test.name);
    const status = result === test.valid ? '✅' : '❌';
    const displayName = test.name.length > 30 ? test.name.substring(0, 30) + '...' : test.name;
    console.log(`${status} "${displayName}" - ${test.description}`);

    if (result !== test.valid) {
        console.log(`   ⚠️  Expected: ${test.valid}, Got: ${result}`);
    }
});

// Test Loxone names
console.log('\n2️⃣  Loxone Name Validation:\n');

const loxoneNameTests = [
    { name: 'Kitchen Light', valid: true },
    { name: 'bedroom_lamp_1', valid: true },
    { name: 'Office.Ceiling', valid: true },
    { name: 'Main Floor Hallway', valid: true },
    { name: ' Invalid', valid: false },
    { name: 'Invalid ', valid: false }
];

loxoneNameTests.forEach(test => {
    const result = isValidLoxoneName(test.name);
    const status = result === test.valid ? '✅' : '❌';
    console.log(`${status} "${test.name}" - ${result ? 'Valid' : 'Invalid'}`);
});

// Test control values
console.log('\n3️⃣  Control Value Validation:\n');

const valueTests = [
    { value: '0', valid: true, description: 'Off' },
    { value: '1', valid: true, description: 'On' },
    { value: '50', valid: true, description: '50% brightness' },
    { value: '100', valid: true, description: '100% brightness' },
    { value: '75_128_255', valid: true, description: 'RGB format (brightness_green_red)' },
    { value: '200000000', valid: true, description: 'Color temperature format' },
    { value: '-1', valid: false, description: 'Negative (invalid)' },
    { value: '101', valid: false, description: '>100 simple value (invalid)' },
    { value: 'abc', valid: false, description: 'Non-numeric (invalid)' }
];

valueTests.forEach(test => {
    const result = isValidControlValue(test.value);
    const status = result === test.valid ? '✅' : '❌';
    console.log(`${status} "${test.value}" - ${test.description}`);
});

// Test IP addresses
console.log('\n4️⃣  IP Address Validation:\n');

const ipTests = [
    { ip: '192.168.1.1', valid: true },
    { ip: '10.0.0.1', valid: true },
    { ip: '255.255.255.255', valid: true },
    { ip: '192.168.1.256', valid: false, description: 'Invalid octet >255' },
    { ip: '192.168.1', valid: false, description: 'Missing octet' },
    { ip: '192.168.1.1.1', valid: false, description: 'Too many octets' },
    { ip: 'not.an.ip.address', valid: false, description: 'Non-numeric' }
];

ipTests.forEach(test => {
    const result = isValidIpAddress(test.ip);
    const status = result === test.valid ? '✅' : '❌';
    const desc = test.description ? ` - ${test.description}` : '';
    console.log(`${status} "${test.ip}"${desc}`);
});

// Test ports
console.log('\n5️⃣  Port Validation:\n');

const portTests = [
    { port: 80, valid: true },
    { port: 8555, valid: true },
    { port: 7000, valid: true },
    { port: 65535, valid: true, description: 'Max valid port' },
    { port: 0, valid: false, description: 'Port 0 (invalid)' },
    { port: 65536, valid: false, description: 'Port >65535 (invalid)' },
    { port: -1, valid: false, description: 'Negative port (invalid)' }
];

portTests.forEach(test => {
    const result = isValidPort(test.port);
    const status = result === test.valid ? '✅' : '❌';
    const desc = test.description ? ` - ${test.description}` : '';
    console.log(`${status} ${test.port}${desc}`);
});

console.log('\n6️⃣  Security Protection Examples:\n');

const securityTests = [
    { name: '../../../etc/passwd', description: 'Path traversal attempt' },
    { name: '<script>alert("xss")</script>', description: 'XSS attempt' },
    { name: 'test; rm -rf /', description: 'Command injection attempt' },
    { name: 'test\0null', description: 'Null byte injection' },
    { name: 'test\r\ninjection', description: 'CRLF injection' }
];

console.log('All of these are BLOCKED by validation:');
securityTests.forEach(test => {
    const result = isValidDeviceName(test.name);
    const status = result ? '❌ FAILED TO BLOCK' : '✅ BLOCKED';
    console.log(`${status} ${test.description}`);
});

console.log('\n7️⃣  Valid Real-World Examples:\n');

const realWorldExamples = [
    'Living Room Ceiling',
    'Kitchen Counter Light',
    'Master Bedroom Lamp',
    'Office Desk 1',
    'Hallway Motion Sensor',
    'Bathroom Mirror Light',
    'Garage Door Sensor',
    'Front Porch Light',
    'Dining Room Chandelier'
];

console.log('Names with spaces (all valid):');
realWorldExamples.forEach(name => {
    const result = isValidDeviceName(name);
    const status = result ? '✅' : '❌';
    console.log(`${status} "${name}"`);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('💡 Key Features:\n');
console.log('1. Names can contain spaces (e.g., "Living Room Light")');
console.log('2. No leading/trailing spaces allowed');
console.log('3. No multiple consecutive spaces');
console.log('4. Supports alphanumeric, spaces, hyphens, underscores, dots');
console.log('5. Protection against injection attacks');
console.log('6. Validation failures are logged with details');
console.log('7. Maximum length: 100 characters\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
