# Mixpanel React Native SDK - Copilot Instructions

## Repository Overview
This is the official Mixpanel React Native SDK, a wrapper around native iOS and Android SDKs for analytics tracking. It supports React Native apps, Expo, and React Native for Web (via JavaScript mode).

**Type:** React Native library (npm package)  
**Languages:** JavaScript (main), Swift (iOS native), Java (Android native)  
**Version:** 3.1.2  
**Minimum React Native:** 0.6+

## Quick Reference - Build & Test Commands

### Primary Commands (Always Run in This Order)
```bash
# 1. Install dependencies (ALWAYS run first after checkout)
npm install

# 2. Run tests
npm test
```

### Validation Results
- All 106 tests should pass across 6 test suites
- Jest is the test framework with react-native preset

## Project Architecture

### Key Entry Points
| File | Purpose |
|------|---------|
| `index.js` | Main SDK entry - exports `Mixpanel`, `People`, `MixpanelGroup` classes |
| `index.d.ts` | TypeScript type definitions |
| `package.json` | NPM package config, dependencies, Jest configuration |

### Native Platform Code
| Directory | Purpose |
|-----------|---------|
| `ios/` | Swift native bridge (`MixpanelReactNative.swift`) |
| `android/` | Java native bridge (`android/src/main/java/com/mixpanel/reactnative/`) |

### JavaScript Mode (Expo/Web Support)
| File | Purpose |
|------|---------|
| `javascript/mixpanel-main.js` | Main JavaScript implementation |
| `javascript/mixpanel-core.js` | Queue processing and event handling |
| `javascript/mixpanel-persistent.js` | Storage and identity persistence |
| `javascript/mixpanel-network.js` | API request handling |
| `javascript/mixpanel-config.js` | Configuration management |
| `javascript/mixpanel-queue.js` | Event queue management |
| `javascript/mixpanel-storage.js` | AsyncStorage adapter |
| `javascript/mixpanel-logger.js` | Logging utilities |
| `javascript/mixpanel-utils.js` | Helper utilities |
| `javascript/mixpanel-constants.js` | Constants (MixpanelType enum) |

### Test Files
| File | Tests |
|------|-------|
| `__tests__/index.test.js` | Native bridge integration tests |
| `__tests__/main.test.js` | JavaScript mode MixpanelMain tests |
| `__tests__/core.test.js` | Queue and core processing tests |
| `__tests__/persistent.test.js` | Persistence layer tests |
| `__tests__/queue.test.js` | Queue management tests |
| `__tests__/network.test.js` | Network request tests |
| `__tests__/jest_setup.js` | Mock setup for react-native and dependencies |

## Configuration Files

| File | Purpose |
|------|---------|
| `MixpanelReactNative.podspec` | iOS CocoaPods spec (Swift 5.0, iOS 11.0+) |
| `android/build.gradle` | Android config (compileSdk 34, minSdk 21, Gradle 8.1.0) |
| `react-native.config.js` | React Native auto-linking configuration |

## CI/CD Workflows

### `.github/workflows/node.js.yml` (Primary CI)
- Runs on: push/PR to master
- Jobs: `test_main_code`, `test_android`, `test_ios`
- Node version: 18.x
- Steps: `npm install` → `npm test`

### Test Requirements
- Tests use mocked react-native modules (`__tests__/jest_setup.js`)
- AsyncStorage, uuid, and react-native-get-random-values are mocked

## Development Guidelines

### Making Code Changes
1. JavaScript/TypeScript changes: Modify files in root or `javascript/` directory
2. iOS changes: Modify `.swift` files in `ios/` directory
3. Android changes: Modify `.java` files in `android/src/main/java/`
4. After changes: Always run `npm test` to verify

### Adding Tests
- Place tests in `__tests__/` directory with `.test.js` suffix
- Use existing mock setup from `jest_setup.js`
- Follow patterns in existing test files

### Type Definitions
- Update `index.d.ts` when adding/modifying public API methods
- Ensure TypeScript types match runtime behavior

## Dependencies

### Runtime Dependencies
- `@react-native-async-storage/async-storage` - Persistence (JavaScript mode)
- `react-native-get-random-values` - UUID polyfill
- `uuid@3.3.2` - UUID generation

### Native SDK Dependencies
- iOS: `Mixpanel-swift@5.1.0`
- Android: `mixpanel-android@8.2.0`

## Sample Apps
Located in `Samples/` directory:
- `MixpanelExample` - Core integration patterns (used in CI)
- `MixpanelExpo` - Expo project example with full API reference
- `MixpanelStarter` - Production-ready architecture with TypeScript

## Generating Documentation
```bash
./generate_docs.sh  # Uses jsdoc, outputs to docs/
```

## Important Notes

1. **Trust these instructions first** - Only perform additional searches if information here is incomplete or incorrect
2. **npm install is required** before running tests
3. **All 106 tests must pass** before submitting changes
4. **Mocks are essential** - Tests rely on mocked react-native modules; do not remove mocks from `jest_setup.js`
5. **Two modes of operation**: Native mode (iOS/Android) and JavaScript mode (Expo/Web)
6. **API surface**: Changes to `index.js` require corresponding updates to `index.d.ts`
