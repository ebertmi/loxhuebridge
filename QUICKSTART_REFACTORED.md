# Quick Start: loxHueBridge (Refactored)

## TL;DR

The codebase has been refactored from one 478-line file into 17 well-organized modules. Everything still works the same, but the code is now easier to understand, test, and maintain.

**The refactored version is now the default!** The legacy monolithic version is preserved as `server.legacy.js` for reference.

---

## Run It Now

### 1. Install Dependencies (if not done)
```bash
npm install
```

### 2. Start Application
```bash
npm start
# or: node server.js
```

That's it! The application works exactly the same as before.

---

## Verify It Works

### Run Tests
```bash
node test-refactored.js
```

Expected output:
```
✅ All tests passed!
```

### Check API
```bash
# Start server
node server-refactored.js

# In another terminal, test endpoints
curl http://localhost:8555/api/health
curl http://localhost:8555/api/settings
```

---

## Available Scripts

The package.json includes these scripts:

```bash
npm start          # Start the application (refactored version)
npm test           # Run test suite
npm run legacy     # Run legacy monolithic version (backup)
```

---

## For Docker Users

**No changes needed!** The Dockerfile already uses `node server.js` which now points to the refactored version.

Simply rebuild as normal:
```bash
docker-compose build
docker-compose up
```

---

## What Changed?

### File Structure
```
Before:
server.js (everything in one file)

After:
src/
├── server.js          # Main app (much cleaner!)
├── constants.js       # All configuration values
├── config/            # Configuration management
├── utils/             # Utility functions
├── services/          # Business logic
├── middleware/        # Express middleware
└── routes/            # API endpoints
```

### Benefits
- ✅ **Easier to read**: Find what you need quickly
- ✅ **Easier to test**: Each module is testable
- ✅ **Easier to maintain**: Change one thing without breaking others
- ✅ **More secure**: Input validation added
- ✅ **Better errors**: Proper error handling

### What Stayed the Same
- ✅ Same API endpoints
- ✅ Same configuration files
- ✅ Same behavior
- ✅ Same performance
- ✅ **100% backward compatible**

---

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### "Port already in use"
```bash
# Stop old server first
# Or use different port
HTTP_PORT=8556 node server.js
```

### Compare with legacy version
```bash
# Terminal 1 - Legacy version
HTTP_PORT=8555 node server.legacy.js

# Terminal 2 - Refactored version (default)
HTTP_PORT=8556 node server.js

# Both should work identically
```

---

## Need More Info?

- **Architecture Guide**: `docs/REFACTORING.md`
- **Full Summary**: `docs/REFACTORING_SUMMARY.md`
- **Code Review**: `docs/review.md`

---

## Feedback

Found an issue? The refactored version should work exactly like the original.

If something doesn't work:
1. Check if it works with legacy: `npm run legacy`
2. If legacy works but refactored doesn't, please report!
3. Include error messages and steps to reproduce

---

**Enjoy the cleaner codebase! 🎉**
