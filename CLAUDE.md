# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Base Rules
* Never commit changes w/o explicit approval
* Never add created markdown files for anlysis or summaries w/o explicit approval

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

# Run legacy monolithic version
npm run legacy
```

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
