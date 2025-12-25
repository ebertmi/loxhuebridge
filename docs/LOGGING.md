# Logging System Documentation

## Overview

loxHueBridge uses **Winston** for structured, production-grade logging with both human-readable console output and machine-parsable JSON file logs.

---

## Architecture

### Dual Output Format

The logging system provides two output formats simultaneously:

1. **Console Output** - Human-readable with emojis and colors
2. **File Output** - Structured JSON for parsing and analysis

### Log Levels

```
error   → Critical errors (❌)
warn    → Warnings (⚠️)
success → Successful operations (✅) [custom level]
info    → General information (ℹ️)
debug   → Detailed debugging (🐛) [only when debug=true]
```

---

## Features

### ✅ Console Output with Emojis
- Visual indicators for quick scanning
- Colorized output for better readability
- Timestamp with milliseconds
- Category-based organization

### ✅ Structured JSON File Logs
- `logs/error.log` - Errors only
- `logs/combined.log` - All log levels
- Machine-readable format
- Easy parsing with tools like `jq`

### ✅ Automatic Log Rotation
- Max file size: 5MB
- Max files kept: 5
- Old files automatically deleted
- Prevents disk space issues

### ✅ Metadata Support
- Add structured data to any log entry
- Preserved in JSON format
- Stack traces automatically captured
- Custom fields supported

### ✅ In-Memory Buffer
- 100 most recent logs kept in memory
- O(1) circular buffer performance
- Powers `/api/logs` endpoint
- No database required

---

## Usage Examples

### Basic Logging

```javascript
const Logger = require('./src/utils/logger');
const logger = new Logger({ debug: true });

// Info
logger.info('Server started on port 8555', 'SYSTEM');

// Success
logger.success('Connected to Hue Bridge', 'HUE');

// Warning
logger.warn('Rate limit approaching', 'API');

// Error
logger.error('Connection failed', 'HUE');

// Debug (only visible when debug=true)
logger.debug('Processing event data', 'EVENT');
```

### With Metadata

```javascript
logger.success('Light updated successfully', 'LIGHT', {
    deviceId: 'light-abc123',
    brightness: 75,
    color: { x: 0.3, y: 0.4 },
    transitionTime: 400
});
```

**Console Output:**
```
✅ [15:04:03.427] [LIGHT] Light updated successfully {"deviceId":"light-abc123","brightness":75,...}
```

**File Output (JSON):**
```json
{
  "level": "success",
  "message": "Light updated successfully",
  "category": "LIGHT",
  "deviceId": "light-abc123",
  "brightness": 75,
  "color": { "x": 0.3, "y": 0.4 },
  "transitionTime": 400,
  "timestamp": "2025-12-25T14:04:03.427Z"
}
```

### Error Handling with Stack Traces

```javascript
try {
    await updateHueLight(lightId, payload);
} catch (error) {
    logger.error('Failed to update light', 'LIGHT', {
        deviceId: lightId,
        error: error.message,
        stack: error.stack,
        payload: payload
    });
}
```

### Hue-Specific Errors

```javascript
// Special handler for Hue API errors
logger.hueError(error, 'HUE');

// Automatically handles:
// - Rate limiting (429)
// - Network errors
// - API errors with status codes
// - Includes stack traces
```

---

## Log Categories

Standard categories used throughout the codebase:

| Category | Usage |
|----------|-------|
| `SYSTEM` | Application lifecycle, startup, shutdown |
| `HUE` | Hue Bridge communication, API calls |
| `LIGHT` | Light control operations |
| `EVENT` | Event stream processing |
| `BUTTON` | Button and sensor events |
| `UDP` | Loxone UDP communication |
| `API` | HTTP API requests/responses |

---

## Configuration

### Debug Mode

```javascript
// Enable debug mode
const logger = new Logger({ debug: true });

// Toggle at runtime
logger.setDebugMode(true);
logger.setDebugMode(false);
```

### Environment Variables

```bash
# Enable debug logging
DEBUG=true npm start

# Production (info level and above)
npm start
```

---

## Viewing Logs

### Real-time Console

```bash
# Development with auto-restart
npm run dev:watch

# Production with PM2
npm run pm2:logs
```

### File Logs

```bash
# View all logs (formatted)
cat logs/combined.log | jq .

# View errors only
cat logs/error.log | jq .

# Follow logs in real-time
tail -f logs/combined.log | jq .

# Search for specific category
cat logs/combined.log | jq 'select(.category=="HUE")'

# Filter by log level
cat logs/combined.log | jq 'select(.level=="error")'

# Get last 10 errors
cat logs/error.log | tail -10 | jq .
```

### API Endpoint

```bash
# Get last 100 logs from memory
curl http://localhost:8555/api/logs

# Returns JSON array:
[
  {
    "time": "15:04:03.427",
    "level": "SUCCESS",
    "msg": "Connected to Hue Bridge",
    "cat": "HUE"
  },
  ...
]
```

---

## Log Rotation

### Automatic Rotation

Logs automatically rotate when:
- File size exceeds 5MB
- Maximum 5 files are kept
- Oldest files deleted automatically

### File Naming

```
logs/
  ├── combined.log       (current)
  ├── combined.1.log     (previous)
  ├── combined.2.log
  ├── combined.3.log
  ├── combined.4.log     (oldest)
  ├── error.log          (current)
  ├── error.1.log
  └── ...
```

---

## Performance

### Circular Buffer
- O(1) insertion time
- O(n) retrieval (where n = buffer size)
- Fixed memory usage (100 entries max)

### File I/O
- Asynchronous writes (non-blocking)
- Buffered output
- Minimal performance impact

### Console Output
- Synchronous (for debugging)
- Colorized formatting
- Emoji support

---

## Best Practices

### 1. Use Appropriate Log Levels

```javascript
// ✅ Good
logger.error('Connection failed', 'HUE', { error: err.message });
logger.warn('Rate limit at 90%', 'API', { current: 9, max: 10 });
logger.info('Server started', 'SYSTEM');
logger.debug('Processing data', 'EVENT', { eventId: 123 });

// ❌ Bad
logger.error('User logged in'); // Use info instead
logger.debug('Critical error'); // Use error instead
```

### 2. Include Context with Metadata

```javascript
// ✅ Good
logger.error('Light update failed', 'LIGHT', {
    deviceId: light.id,
    deviceName: light.name,
    error: err.message,
    payload: payload
});

// ❌ Bad
logger.error('Light update failed');
```

### 3. Use Categories Consistently

```javascript
// ✅ Good
logger.info('Connecting to bridge', 'HUE');
logger.success('Bridge connected', 'HUE');
logger.error('Bridge unreachable', 'HUE');

// ❌ Bad
logger.info('Connecting to bridge', 'SYSTEM');
logger.success('Bridge connected', 'HUE');
logger.error('Bridge unreachable', 'LIGHT');
```

### 4. Don't Log Sensitive Data

```javascript
// ✅ Good
logger.info('User authenticated', 'AUTH', {
    userId: user.id,
    username: user.name
});

// ❌ Bad
logger.info('User authenticated', 'AUTH', {
    password: user.password,  // Never log passwords!
    apiKey: user.apiKey       // Or API keys!
});
```

---

## Troubleshooting

### Logs Not Appearing

1. Check debug mode:
   ```javascript
   logger.setDebugMode(true);
   ```

2. Verify log level:
   ```javascript
   logger.winston.level = 'debug';
   ```

3. Check file permissions:
   ```bash
   ls -la logs/
   ```

### Log Files Growing Too Large

- Rotation should be automatic (5MB limit)
- Check rotation config in `src/utils/logger.js`
- Manually clean old logs if needed:
  ```bash
  rm logs/*.log.*
  ```

### Performance Issues

- Reduce log verbosity in production
- Disable debug logging
- Consider log level thresholds:
  ```javascript
  const logger = new Logger({
      debug: process.env.NODE_ENV !== 'production'
  });
  ```

---

## Migration from Old Logger

The new Winston-based logger maintains **100% backward compatibility** with the old API:

```javascript
// All existing code continues to work:
logger.info(msg, category);
logger.success(msg, category);
logger.warn(msg, category);
logger.error(msg, category);
logger.debug(msg, category);
logger.hueError(error, category);

// New: metadata parameter (optional)
logger.info(msg, category, { key: value });
```

---

## Testing

```bash
# Run logging demonstration
node test-logging.js

# Verify log files created
ls -lh logs/

# View structured logs
cat logs/combined.log | jq .

# Run full test suite
npm test
```

---

## Benefits

✅ **Better Debugging**
- Structured data for complex troubleshooting
- Stack traces automatically captured
- Metadata preserved in files

✅ **Production Monitoring**
- JSON logs easy to parse and analyze
- Integration with log aggregators (ELK, Splunk, etc.)
- Searchable, filterable logs

✅ **Performance**
- Non-blocking file I/O
- Efficient circular buffer
- Log rotation prevents disk issues

✅ **Developer Experience**
- Emojis for quick visual scanning
- Colorized output
- Consistent, predictable format

✅ **Backward Compatible**
- No code changes required
- Existing API preserved
- Optional metadata parameter

---

## Summary

The Winston-based logging system provides:

- 🎨 **Console**: Human-readable with emojis
- 📄 **Files**: Structured JSON for parsing
- 🔄 **Rotation**: Automatic (5MB, 5 files)
- 📊 **Levels**: error, warn, success, info, debug
- 🏷️ **Categories**: Organized by component
- 🔧 **Metadata**: Structured data support
- 💾 **Buffer**: In-memory for API access
- ⚡ **Performance**: Efficient and non-blocking

**Result**: Production-grade logging that's both developer-friendly and machine-parsable.
