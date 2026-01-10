# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Base Rules
* Never commit changes w/o explicit approval
* Never add created markdown files for anlysis or summaries w/o explicit approval
* If you find test issues, always analyze why the test failed and never change existing test cases without explicit approval

## Project Overview

**loxHueBridge** is a bidirectional bridge between Philips Hue Bridge (V2 API) and Loxone Miniserver. It provides real-time synchronization using Server-Sent Events (SSE) and supports light control, sensor monitoring, and scene management.

## Development Commands

```bash
# Start the application
npm start

# Development mode with debug logging
npm run dev

# Run tests
npm test

# Run specific test file
npm test -- filename.test.ts

# Run legacy monolithic version
npm run legacy
```

## Testing Guidelines

**Framework:** Jest (uses global `describe`, `it`, `expect` - don't import them)

**Workflow:**
1. Write tests first or alongside implementation
2. Run tests frequently during development: `npm test`
3. All tests must pass before proceeding to next phase
4. Never change existing test expectations without approval - fix the implementation instead

**Validated Format Specifications:**
- **Smart Actuator**: `20` + brightness (2-3 digits) + kelvin (5 digits with leading zero)
  - Example: `201002700` = 20 + 10% + 02700K
  - Example: `2010002700` = 20 + 100% + 02700K
- **RGB Numeric**: `R + G*1000 + B*1000000`
  - Example: `255255255` = R:255, G:255, B:255
  - Example: `100050025` = R:25, G:50, B:100

## Architecture

The codebase uses a **modular service-oriented architecture**:

- **Entry Point**: `server.js` → `src/server.js`
- **Configuration**: `src/config/` - Manages JSON config files in `data/` directory
- **Services**:
  - `hue-client.js` - Philips Hue V2 API communication with rate limiting and retry logic
  - `event-stream.js` - SSE connection to Hue Bridge for real-time device updates
  - `loxone-udp.js` - UDP communication to Loxone Miniserver
  - `status-manager.js` - Bidirectional state synchronization
  - `rate-limiter.js` - Queue-based rate limiting (lights: ~8/sec, groups: ~0.9/sec)
- **Routes**: Express routes for setup, API, lights, and scenes
- **Utils**: Color conversion (RGB ↔ XY, Kelvin ↔ Mirek) and logging

## Key Technical Details

### Color Handling
The bridge translates between Loxone's color formats and Hue's XY/Mirek color space:
- **Loxone Smart Actuator**: `201002700` format (mode + value + color temp)
- **Loxone RGB**: `R + G*1000 + B*1000000`
- **Hue API**: XY coordinates (CIE 1931) and Mirek (micro reciprocal degrees)

All conversion logic is in `src/utils/color.js`.

### Rate Limiting
Hue Bridge enforces strict rate limits. The `rate-limiter.js` service queues commands:
- Individual lights: 120ms delay (~8 req/sec)
- Grouped lights: 1100ms delay (~0.9 req/sec)

### Event Stream
Uses Hue V2 SSE API (`/eventstream/clip/v2`) for real-time updates. Implements exponential backoff reconnection with max 60s delay.

### Certificate Pinning
Optional SHA-256 certificate pinning for Hue Bridge HTTPS connections (configured via `HUE_CERT_PINNING_ENABLED` and `HUE_CERT_FINGERPRINT` env vars).

## Configuration Files

Persistent data stored in `data/` directory:
- `config.json` - Bridge IP, API key, Loxone settings
- `mapping.json` - Device mappings between Hue and Loxone

## Docker Deployment

Primary deployment method is Docker with `network_mode: "host"` for UDP broadcast support. See `docker-compose.yml` in README for production setup.
