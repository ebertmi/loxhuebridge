# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

---

## Available Scripts

### Basic Commands

```bash
npm start              # Start application (production mode)
npm run dev            # Start with DEBUG mode enabled
npm test               # Run test suite
npm run legacy         # Run legacy monolithic version
```

### Development with Auto-Restart

```bash
npm run dev:watch      # Start with auto-restart on file changes (PM2)
```

### PM2 Process Management

```bash
npm run pm2:start      # Start with PM2 (production)
npm run pm2:dev        # Start with PM2 (development, watch mode)
npm run pm2:stop       # Stop PM2 process
npm run pm2:restart    # Restart PM2 process
npm run pm2:logs       # View PM2 logs
npm run pm2:status     # Check PM2 status
```

---

## Development Modes

### 1. Simple Development (No Auto-Restart)

Best for: Quick testing, debugging single changes

```bash
npm run dev
```

Features:
- ✅ DEBUG mode enabled
- ✅ Verbose logging
- ✅ Quick startup
- ❌ Manual restart required

### 2. Watch Mode (Auto-Restart)

Best for: Active development, frequent changes

```bash
npm run dev:watch
```

Features:
- ✅ DEBUG mode enabled
- ✅ Auto-restart on file changes
- ✅ Watches all source files
- ✅ PM2 dev mode (logs to console)
- ✅ Press `Ctrl+C` to stop

Files watched:
- `src/**/*.js`
- `server.js`
- `package.json`

Files ignored:
- `node_modules/`
- `data/`
- `docs/`
- `logs/`

### 3. PM2 Production Mode

Best for: Production deployment, server environments

```bash
npm run pm2:start
```

Features:
- ✅ Process management
- ✅ Auto-restart on crashes
- ✅ Log rotation
- ✅ Cluster mode support
- ✅ Memory monitoring

---

## Environment Variables

### Development

Set in `ecosystem.config.js`:
```javascript
env_development: {
  NODE_ENV: 'development',
  DEBUG: 'true',
  HTTP_PORT: 8555
}
```

### Production

```javascript
env_production: {
  NODE_ENV: 'production',
  DEBUG: 'false'
}
```

### Override in Terminal

```bash
# Custom port
HTTP_PORT=8556 npm run dev

# Force debug in production
DEBUG=true npm start

# Multiple variables
HTTP_PORT=9000 DEBUG=true npm run dev
```

---

## PM2 Ecosystem Config

Located at: `ecosystem.config.js`

### Key Settings

```javascript
{
  name: 'loxhuebridge',
  script: './server.js',

  // Auto-restart settings
  autorestart: true,
  max_restarts: 10,
  min_uptime: '10s',

  // Memory limit
  max_memory_restart: '200M',

  // Logging
  error_file: './logs/error.log',
  out_file: './logs/out.log'
}
```

### Customize for Your Needs

Edit `ecosystem.config.js` to adjust:
- Memory limits
- Restart behavior
- Log locations
- Instance count (for clustering)

---

## Debugging

### Enable Debug Logs

All debug-enabled modes show:
- 🐛 Detailed event processing
- 🐛 UDP messages sent/received
- 🐛 Hue API requests/responses
- 🐛 Command queue operations

Example output:
```
🐛 [15:30:45.123] [LIGHT] OUT -> Hue (kitchen): {"on":{"on":true}}
🐛 [15:30:45.150] [UDP] UDP OUT: hue.kitchen.on 1
🐛 [15:30:45.200] [BUTTON] Event: switch1 Btn=short_release
```

### Debug Specific Components

Edit `src/utils/logger.js` to add custom debug filters if needed.

---

## PM2 Advanced Usage

### View Logs

```bash
# All logs
npm run pm2:logs

# Last 100 lines
pm2 logs loxhuebridge --lines 100

# Follow logs (tail -f style)
pm2 logs loxhuebridge --lines 0
```

### Monitor Performance

```bash
# Real-time monitoring
pm2 monit

# Status
npm run pm2:status
```

### Restart on Changes

```bash
# Start with watch mode
npm run pm2:dev

# Or manually enable watch
pm2 start ecosystem.config.js --watch
```

### Cluster Mode (Advanced)

Edit `ecosystem.config.js`:
```javascript
{
  instances: 4,        // Number of instances
  exec_mode: 'cluster' // Enable cluster mode
}
```

**Note:** Cluster mode not recommended for this app due to UDP socket sharing issues.

---

## Testing During Development

### Run Tests

```bash
npm test
```

### Watch Tests (Manual)

In one terminal:
```bash
npm run dev:watch
```

In another terminal:
```bash
# Run tests whenever you make changes
npm test
```

### Test Specific Endpoints

```bash
# Health check
curl http://localhost:8555/api/health

# Settings
curl http://localhost:8555/api/settings

# Status
curl http://localhost:8555/api/status
```

---

## File Structure for Development

```
loxhuebridge/
├── server.js              # Entry point
├── ecosystem.config.js    # PM2 configuration
│
├── src/                   # Source code (edit these)
│   ├── server.js         # Main application
│   ├── constants.js      # Configuration values
│   ├── config/           # Configuration management
│   ├── utils/            # Utility functions
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   └── routes/           # API endpoints
│
├── logs/                  # PM2 logs (auto-generated)
│   ├── error.log         # Error logs
│   └── out.log           # Output logs
│
├── data/                  # Runtime data
│   ├── config.json       # User configuration
│   └── mapping.json      # Device mappings
│
└── test-refactored.js     # Test suite
```

---

## Common Development Tasks

### Add a New API Endpoint

1. Edit `src/routes/api.js` (or create new route file)
2. Add your route handler
3. Test with `npm run dev`
4. Run tests with `npm test`

### Modify Color Conversion

1. Edit `src/utils/color.js`
2. Add/update conversion functions
3. Test with existing lights
4. Update tests if needed

### Add New Service

1. Create `src/services/your-service.js`
2. Export class with constructor
3. Inject dependencies (config, logger, etc.)
4. Import in `src/server.js`
5. Initialize and use

### Debug a Specific Issue

1. Enable debug mode: `npm run dev`
2. Reproduce the issue
3. Check console logs for 🐛 debug messages
4. Check `logs/error.log` if using PM2
5. Fix and test

---

## Hot Reload (PM2 Watch Mode)

When using `npm run dev:watch`, files are monitored and the app restarts automatically when you:

✅ Edit any `.js` file in `src/`
✅ Edit `server.js`
✅ Edit `package.json`
✅ Edit `ecosystem.config.js`

❌ Changes to these don't trigger restart:
- `data/config.json`
- `data/mapping.json`
- Log files
- Documentation

To restart manually: `npm run pm2:restart`

---

## Production Deployment

### Quick Deploy

```bash
npm run pm2:start
```

### With Startup Script

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save process list
pm2 save

# Generate startup script
pm2 startup

# Follow the instructions shown
```

Now the app will auto-start on system reboot!

### Update Deployment

```bash
# Pull latest code
git pull

# Install dependencies
npm install

# Restart
npm run pm2:restart
```

---

## Troubleshooting

### "Port already in use"

```bash
# Find and kill process on port 8555
lsof -ti:8555 | xargs kill

# Or use different port
HTTP_PORT=8556 npm run dev
```

### PM2 process won't stop

```bash
# Force stop
pm2 delete loxhuebridge

# Or kill all PM2 processes
pm2 kill
```

### Auto-restart not working

```bash
# Check PM2 status
npm run pm2:status

# Restart with watch
pm2 restart loxhuebridge --watch
```

### Logs not appearing

```bash
# Check log files exist
ls -la logs/

# Check PM2 configuration
pm2 show loxhuebridge

# Restart logging
pm2 flush
npm run pm2:restart
```

---

## Tips for Efficient Development

### 1. Use Watch Mode
```bash
npm run dev:watch
```
Code → Save → Auto-restart → Test

### 2. Keep Logs Open
```bash
# Terminal 1
npm run dev:watch

# Terminal 2
npm run pm2:logs
```

### 3. Test Frequently
```bash
npm test
```
Run after each feature/fix.

### 4. Use Debug Mode
```bash
npm run dev
```
See exactly what's happening.

### 5. Monitor Performance
```bash
pm2 monit
```
Check memory/CPU usage.

---

## VS Code Integration

### Recommended Extensions
- ESLint
- Prettier
- Docker
- REST Client

### Debug Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug loxHueBridge",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/server.js",
      "env": {
        "DEBUG": "true"
      }
    }
  ]
}
```

Press `F5` to start debugging!

---

## Summary

**Quick Development:**
```bash
npm run dev              # Simple debug mode
npm run dev:watch        # Auto-restart on changes
```

**Production:**
```bash
npm run pm2:start        # Start with PM2
npm run pm2:logs         # View logs
npm run pm2:status       # Check status
```

**Testing:**
```bash
npm test                 # Run tests
```

Happy coding! 🚀
