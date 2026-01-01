/**
 * Test Retry Logic
 * Demonstrates the exponential backoff retry mechanism
 */

const CONSTANTS = require('../src/constants');

console.log('\n📋 Retry Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Max Attempts:        ${CONSTANTS.RETRY.MAX_ATTEMPTS}`);
console.log(`Initial Backoff:     ${CONSTANTS.RETRY.INITIAL_BACKOFF_MS}ms`);
console.log(`Max Backoff:         ${CONSTANTS.RETRY.MAX_BACKOFF_MS}ms`);
console.log(`Backoff Multiplier:  ${CONSTANTS.RETRY.BACKOFF_MULTIPLIER}x`);
console.log(`\nRetryable HTTP Status Codes:`);
console.log(`  ${CONSTANTS.RETRY.RETRYABLE_STATUS_CODES.join(', ')}`);
console.log(`\nRetryable Network Error Codes:`);
console.log(`  ${CONSTANTS.RETRY.RETRYABLE_ERROR_CODES.join(', ')}`);

console.log('\n\n📊 Exponential Backoff Schedule:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function calculateBackoffDelay(attempt) {
    const delay = CONSTANTS.RETRY.INITIAL_BACKOFF_MS *
                 Math.pow(CONSTANTS.RETRY.BACKOFF_MULTIPLIER, attempt);
    return Math.min(delay, CONSTANTS.RETRY.MAX_BACKOFF_MS);
}

let totalTime = 0;
for (let i = 0; i < CONSTANTS.RETRY.MAX_ATTEMPTS; i++) {
    const delay = i > 0 ? calculateBackoffDelay(i - 1) : 0;
    totalTime += delay;

    if (i === 0) {
        console.log(`Attempt ${i + 1}: Initial request`);
    } else {
        console.log(`Attempt ${i + 1}: After ${delay}ms delay (Total: ${totalTime}ms)`);
    }
}

console.log(`\n⏱️  Maximum total time: ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);

console.log('\n\n🧪 Example Retry Scenarios:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const scenarios = [
    {
        error: 'ETIMEDOUT',
        type: 'Network Error',
        retryable: true
    },
    {
        error: 'HTTP 503',
        type: 'Service Unavailable',
        retryable: true
    },
    {
        error: 'HTTP 500',
        type: 'Internal Server Error',
        retryable: true
    },
    {
        error: 'HTTP 429',
        type: 'Rate Limited',
        retryable: true
    },
    {
        error: 'HTTP 404',
        type: 'Not Found',
        retryable: false
    },
    {
        error: 'HTTP 400',
        type: 'Bad Request',
        retryable: false
    },
    {
        error: 'ECONNRESET',
        type: 'Connection Reset',
        retryable: true
    }
];

scenarios.forEach(scenario => {
    const status = scenario.retryable ? '✅ RETRY' : '❌ FAIL';
    console.log(`${status}  ${scenario.error.padEnd(15)} - ${scenario.type}`);
});

console.log('\n\n💡 How It Works:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`
1. On transient errors (network issues, 5xx), automatically retry
2. Wait progressively longer between attempts (exponential backoff)
3. Give up after ${CONSTANTS.RETRY.MAX_ATTEMPTS} attempts
4. Don't retry on client errors (4xx except 429)
5. Log all retry attempts for visibility

Benefits:
✅ Handles temporary network glitches automatically
✅ Reduces false failures from transient issues
✅ Exponential backoff prevents overwhelming the server
✅ Clear logging for debugging
✅ Configurable retry behavior
`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
