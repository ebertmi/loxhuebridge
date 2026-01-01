/**
 * Test UDP Logging Improvements
 * Demonstrates enhanced UDP error monitoring and health tracking
 */

const Logger = require('../src/utils/logger');
const Config = require('../src/config');
const LoxoneUDP = require('../src/services/loxone-udp');

console.log('\n📋 Testing Enhanced UDP Logging\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Create logger and config
const logger = new Logger({ debug: true });
const config = new Config(logger, './test-data');

// Configure Loxone IP for testing
config.set('loxoneIp', '192.168.1.50');
config.set('loxonePort', 7000);

// Create UDP service
const udpService = new LoxoneUDP(config, logger);

console.log('1️⃣  Initial Configuration:\n');

const initialHealth = udpService.getHealth();
console.log('Health Status:', JSON.stringify(initialHealth, null, 2));

console.log('\n2️⃣  Statistics Tracking:\n');

const stats = udpService.getStats();
console.log('UDP Statistics:');
console.log(`  • Target: ${stats.target}`);
console.log(`  • Success Count: ${stats.successCount}`);
console.log(`  • Error Count: ${stats.errorCount}`);
console.log(`  • Error Rate: ${stats.errorRatePercent}`);
console.log(`  • Consecutive Successes: ${stats.consecutiveSuccesses}`);
console.log(`  • Consecutive Errors: ${stats.consecutiveErrors}`);
console.log(`  • Health Status: ${stats.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);

console.log('\n3️⃣  New Logging Features:\n');

console.log('✅ Always Log Errors:');
console.log('   • All UDP errors logged in production');
console.log('   • Includes target IP, port, and error details');
console.log('   • Metadata: errorCode, consecutiveErrors, message\n');

console.log('✅ Health State Monitoring:');
console.log('   • Marks connection as unhealthy after 5 consecutive errors');
console.log('   • Automatic recovery detection (3 successful sends)');
console.log('   • Clear notifications for state changes\n');

console.log('✅ Periodic Health Logging:');
console.log('   • Every 5 minutes: health status logged');
console.log('   • Includes success/error counts and rates');
console.log('   • Shows uptime and connection status\n');

console.log('✅ Milestone Logging:');
console.log('   • Every 1000 messages: milestone logged');
console.log('   • Tracks total messages sent');
console.log('   • Shows current error rate\n');

console.log('✅ Error Rate Monitoring:');
console.log('   • Warning when error rate exceeds 10%');
console.log('   • Tracks consecutive errors');
console.log('   • Gradual error count reset on recovery\n');

console.log('✅ Enhanced Statistics:');
console.log('   • consecutiveErrors / consecutiveSuccesses');
console.log('   • lastErrorTime / lastSuccessTime');
console.log('   • isHealthy status flag');
console.log('   • Detailed health check method\n');

console.log('4️⃣  Example Log Scenarios:\n');

console.log('Scenario A: Normal Operation (Debug Mode)');
console.log('  🐛 [time] [LIGHT] UDP sent: hue.living_room.on 1\n');

console.log('Scenario B: First Success (Production)');
console.log('  🐛 [time] [LIGHT] UDP sent: hue.kitchen.bri 75\n');

console.log('Scenario C: Error Detected');
console.log('  ❌ [time] [LIGHT] UDP send error: ECONNREFUSED');
console.log('     {"target":"192.168.1.50:7000","message":"hue.bedroom.on 1",...}\n');

console.log('Scenario D: High Error Rate Warning');
console.log('  ⚠️  [time] [UDP] High UDP error rate: 15.2%');
console.log('     {"errors":15,"total":98,"target":"192.168.1.50:7000"}\n');

console.log('Scenario E: Connection Unhealthy');
console.log('  ❌ [time] [UDP] UDP connection unhealthy: 5 consecutive failures');
console.log('     {"target":"192.168.1.50:7000","lastError":"ETIMEDOUT",...}\n');

console.log('Scenario F: Connection Recovered');
console.log('  ✅ [time] [UDP] UDP connection recovered after 3 successful sends');
console.log('     {"target":"192.168.1.50:7000","totalSuccess":45,...}\n');

console.log('Scenario G: Health Status (5 min intervals)');
console.log('  ℹ️  [time] [UDP] UDP health: healthy');
console.log('     {"target":"192.168.1.50:7000","successCount":1543,...}\n');

console.log('Scenario H: Milestone Reached');
console.log('  ℹ️  [time] [UDP] UDP milestone: 1000 messages sent');
console.log('     {"target":"192.168.1.50:7000","errorRate":"0.23%"}\n');

console.log('5️⃣  Comparison: Before vs After\n');

console.log('BEFORE (v1.x):');
console.log('  ❌ Errors only logged in debug mode');
console.log('  ❌ No visibility in production');
console.log('  ❌ Silent failures');
console.log('  ❌ No health monitoring');
console.log('  ❌ Limited statistics\n');

console.log('AFTER (v2.0.0+):');
console.log('  ✅ All errors always logged');
console.log('  ✅ Production visibility');
console.log('  ✅ Health state tracking');
console.log('  ✅ Automatic recovery detection');
console.log('  ✅ Periodic status updates');
console.log('  ✅ Milestone logging');
console.log('  ✅ Detailed statistics');
console.log('  ✅ Structured metadata\n');

console.log('6️⃣  Health Check API:\n');

console.log('Get current health status:');
console.log('```javascript');
console.log('const health = udpService.getHealth();');
console.log('console.log(health);');
console.log('```\n');

console.log('Returns:');
console.log(JSON.stringify({
    status: 'healthy',
    configured: true,
    target: '192.168.1.50:7000',
    successCount: 1543,
    errorCount: 3,
    errorRate: '0.19%',
    consecutiveErrors: 0,
    timeSinceLastSuccess: '2s',
    lastError: null
}, null, 2));

console.log('\n7️⃣  Statistics API:\n');

console.log('Get detailed statistics:');
console.log('```javascript');
console.log('const stats = udpService.getStats();');
console.log('console.log(stats);');
console.log('```\n');

console.log('Returns:');
console.log(JSON.stringify({
    isHealthy: true,
    successCount: 1543,
    errorCount: 3,
    totalSent: 1546,
    errorRate: 0.0019404388714733542,
    errorRatePercent: '0.19%',
    consecutiveErrors: 0,
    consecutiveSuccesses: 156,
    lastError: null,
    lastErrorTime: 1735138963728,
    lastSuccessTime: 1735139123456,
    target: '192.168.1.50:7000'
}, null, 2));

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('💡 Key Improvements:\n');
console.log('1. Production Visibility - Errors always logged with context');
console.log('2. Health Monitoring - Connection state tracking');
console.log('3. Proactive Alerts - High error rates detected');
console.log('4. Recovery Detection - Automatic notifications');
console.log('5. Periodic Updates - Health status every 5 minutes');
console.log('6. Milestone Tracking - Progress logging');
console.log('7. Detailed Metadata - Structured error information');
console.log('8. API Access - Health and stats available via API\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Clean up
udpService.close();
