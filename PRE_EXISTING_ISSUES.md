# Pre-Existing Error Handling Issues

This document captures error handling issues identified during the PR #353 security review that should be addressed in a follow-up PR.

**Identified by:** silent-failure-hunter agent
**Date:** 2026-01-14
**Context:** These issues pre-date PR #353 and are not introduced by the current changes.

---

## Summary

The Mixpanel React Native SDK has several patterns where errors are silently swallowed, making debugging difficult and potentially causing data loss without user awareness.

| Issue | File | Severity | Impact |
|-------|------|----------|--------|
| Silent fallback to in-memory storage | mixpanel-storage.js:13-18 | HIGH | Data loss on app restart |
| Storage operations fail silently | mixpanel-storage.js:25-48 | HIGH | Data not persisted |
| Error logging suppressed when disabled | mixpanel-logger.js:30-33 | MEDIUM | Invisible failures in production |
| Storage error logs lack context | mixpanel-storage.js:28-46 | MEDIUM | Debugging impossible |
| JSON.parse without try-catch | mixpanel-persistent.js | MEDIUM | Crash on corrupt data |

---

## Issue 1: Silent Fallback to In-Memory Storage

**File:** `javascript/mixpanel-storage.js` lines 6-19
**Severity:** HIGH

### Current Code

```javascript
constructor(storage) {
  if (!storage) {
    try {
      const storageModule = require("@react-native-async-storage/async-storage");
      // ...
    } catch {  // <-- Catches ALL errors, no error variable
      console.error(
        "[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null..."
      );
      console.error("[Mixpanel] Falling back to in-memory storage");
      this.storage = new InMemoryStorage();  // Silent fallback!
    }
  }
}
```

### Problem

- The catch block catches **all errors** without capturing the error object
- Syntax errors, memory allocation errors, or any runtime exception during `require()` are masked
- Users lose all persistent data (device IDs, super properties, opt-out status) without clear indication
- Analytics data becomes unreliable - events appear from "new users" on each app restart

### Recommended Fix

```javascript
constructor(storage) {
  if (!storage) {
    try {
      const storageModule = require("@react-native-async-storage/async-storage");
      if (storageModule.default) {
        this.storage = storageModule.default;
      } else {
        this.storage = storageModule;
      }
    } catch (error) {
      console.error(
        "[@RNC/AsyncStorage]: Failed to load AsyncStorage module:",
        error.message
      );
      console.error(
        "[Mixpanel] Falling back to in-memory storage. Data will not persist across app restarts."
      );
      this.storage = new InMemoryStorage();
      this._isInMemoryFallback = true;  // Allow detection
    }
  }
}
```

---

## Issue 2: Storage Operations Fail Silently

**File:** `javascript/mixpanel-storage.js` lines 25-48
**Severity:** HIGH

### Current Code

```javascript
async getItem(key) {
  try {
    return await this.storage.getItem(key);
  } catch {  // No error captured!
    MixpanelLogger.error("error getting item from storage");
    return null;  // Silent failure - caller has no idea this failed
  }
}

async setItem(key, value) {
  try {
    await this.storage.setItem(key, value);
  } catch {  // No error captured!
    MixpanelLogger.error("error setting item in storage");
    // No return, no throw - caller thinks it succeeded!
  }
}
```

### Problem

- `getItem` returning `null` is indistinguishable from "key doesn't exist"
- `setItem` failures mean data isn't persisted but caller assumes success
- No error details are captured or logged
- Device IDs may regenerate unexpectedly
- User opt-out preferences may not persist

### Impact on Current Code

In `mixpanel-persistent.js` lines 59-76:
```javascript
const storageToken = await this.storageAdapter.getItem(getDeviceIdKey(token));
// ...
if (!this._identity[token].deviceId) {
  this._identity[token].deviceId = uuidv4();
  await this.storageAdapter.setItem(/* ... */);  // Could fail silently!
}
```

If `setItem` fails silently, a new UUID will be generated on every app restart but never persisted.

### Recommended Fix

Option A: Return result objects
```javascript
async getItem(key) {
  try {
    return { success: true, value: await this.storage.getItem(key) };
  } catch (error) {
    MixpanelLogger.error(null, `Error getting '${key}' from storage:`, error.message);
    return { success: false, value: null, error };
  }
}
```

Option B: Capture and log error details (minimal change)
```javascript
async getItem(key) {
  try {
    return await this.storage.getItem(key);
  } catch (error) {
    // Always log errors regardless of logging config
    console.error(`[Mixpanel] Error getting '${key}' from storage:`, error.message);
    return null;
  }
}
```

---

## Issue 3: Error Logging Suppressed When Disabled

**File:** `javascript/mixpanel-logger.js` lines 30-33
**Severity:** MEDIUM

### Current Code

```javascript
static error(token, ...args) {
  if (MixpanelLogger._shouldLog(token)) {  // <-- Errors suppressed if logging disabled!
    console.error(...MixpanelLogger._prependPrefix(args));
  }
}
```

### Problem

- When `loggingEnabled` is `false` (typical in production), all storage errors are completely invisible
- Users have no way to know their data isn't being persisted
- Debugging production issues becomes impossible

### Recommended Fix

```javascript
static error(token, ...args) {
  // Errors always log - they indicate problems that need attention
  console.error(...MixpanelLogger._prependPrefix(args));
}
```

---

## Issue 4: Storage Error Logs Lack Context

**File:** `javascript/mixpanel-storage.js` lines 28-29, 37-38, 45-46
**Severity:** MEDIUM

### Current Code

```javascript
catch {
  MixpanelLogger.error("error getting item from storage");  // Which key? What error?
  return null;
}
```

### Problems

1. No token parameter passed to `MixpanelLogger.error()` - will never log even if logging is enabled
2. No key information - which storage operation failed?
3. No error details - what went wrong?

### Recommended Fix

```javascript
catch (error) {
  MixpanelLogger.error(null, `Error getting item '${key}' from storage:`, error.message);
  return null;
}
```

---

## Issue 5: JSON.parse Without Try-Catch

**File:** `javascript/mixpanel-persistent.js` lines 193-195, 222-224, 274-275
**Severity:** MEDIUM

### Current Code

```javascript
async loadSuperProperties(token) {
  const superPropertiesString = await this.storageAdapter.getItem(
    getSuperPropertiesKey(token)
  );
  this._superProperties[token] = superPropertiesString
    ? JSON.parse(superPropertiesString)  // <-- Could throw on corrupt data!
    : {};
}
```

### Problem

If storage becomes corrupted, `JSON.parse` will throw and the entire method will fail. Since there's no try-catch, this error propagates up and may crash initialization.

### Affected Locations

- `loadSuperProperties` (line 194)
- `loadTimeEvents` (line 224)
- `loadQueue` (line 275)

### Recommended Fix

```javascript
async loadSuperProperties(token) {
  const superPropertiesString = await this.storageAdapter.getItem(
    getSuperPropertiesKey(token)
  );
  let parsed = {};
  if (superPropertiesString) {
    try {
      parsed = JSON.parse(superPropertiesString);
    } catch (error) {
      MixpanelLogger.error(token, "Failed to parse super properties, resetting:", error.message);
      // Optionally clear the corrupted data
      await this.storageAdapter.removeItem(getSuperPropertiesKey(token));
    }
  }
  this._superProperties[token] = parsed;
}
```

---

## Implementation Plan

### Phase 1: Critical Fixes (Recommended for next release)
1. Fix Issue #1 - Capture error in storage fallback
2. Fix Issue #2 - Capture errors in storage operations
3. Fix Issue #4 - Add context to error logs

### Phase 2: Reliability Improvements
4. Fix Issue #3 - Always log errors regardless of logging config
5. Fix Issue #5 - Add try-catch around JSON.parse calls

### Phase 3: Observability (Future consideration)
- Add a way to detect when in-memory fallback is in use
- Consider callback/event for storage failures
- Add storage health check method

---

## Testing Recommendations

When implementing these fixes, add tests for:
- [ ] Storage module failing to load
- [ ] Storage getItem throwing an error
- [ ] Storage setItem throwing an error
- [ ] Corrupted JSON in storage
- [ ] Error logging when logging is disabled

---

## References

- PR #353: Security: Update dev dependencies and fix npm packaging
- Original review by: silent-failure-hunter agent
