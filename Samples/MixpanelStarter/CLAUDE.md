# CLAUDE.md - MixpanelStarter Sample App

This file provides guidance to Claude Code when working with the MixpanelStarter sample application.

## Project Overview

**Purpose**: Modern, production-ready React Native sample app demonstrating Mixpanel SDK integration with TypeScript, Context API, and best practices.

**Target Audience**: Developers learning to integrate Mixpanel into their React Native apps.

**Positioning**: Bridges the gap between SimpleMixpanel (too basic) and MixpanelDemo (too complex), demonstrating 80% of common use cases.

## Quick Reference

### Tech Stack
- **React Native**: 0.82.1
- **React**: 19.1.1
- **TypeScript**: Strict mode enabled
- **Navigation**: React Navigation 7.x with bottom tabs
- **State Management**: Context API pattern
- **Testing**: Jest with React Native Testing Library

### Key Dependencies
- `mixpanel-react-native` - Main SDK (file:../..)
- `@react-native-async-storage/async-storage` - Required for Mixpanel
- `@react-navigation/native` + `@react-navigation/bottom-tabs` - Navigation
- `react-native-dotenv` - Environment variables

## Commands

### Development
```bash
# Install dependencies
npm install
cd ios && pod install && cd ..

# Run app
npm run ios        # iOS simulator
npm run android    # Android emulator
npm start          # Start Metro bundler

# Testing
npm test           # Run Jest tests
npm test -- --coverage  # With coverage
npx tsc --noEmit   # TypeScript compilation check

# Linting
npm run lint       # Run ESLint
```

### Environment Setup
```bash
# Create environment file
cp .env.example .env
# Edit .env and set: MIXPANEL_TOKEN=your_token_here
```

### Troubleshooting Commands
```bash
# Clear Metro cache
npm start -- --reset-cache

# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Clean Android build
cd android && ./gradlew clean && cd ..

# Reinstall dependencies
rm -rf node_modules && npm install
```

## Architecture & Code Patterns

### Core Architecture Pattern: Context API + Custom Hook

```typescript
// Provider wraps app root (src/App.tsx)
<MixpanelProvider token={token} trackAutomaticEvents={true}>
  <NavigationContainer>
    {/* app content */}
  </NavigationContainer>
</MixpanelProvider>

// Hook usage in any component
const { mixpanel, isInitialized, track, identify } = useMixpanel();
```

**Why Context API?**
- Simple, no boilerplate
- Built into React (widely understood)
- Sufficient for Mixpanel's simple state needs
- Avoids prop drilling

### File Naming Conventions
- **Components**: PascalCase (ActionButton.tsx, InfoCard.tsx)
- **Screens**: PascalCase with "Screen" suffix (OnboardingScreen.tsx)
- **Contexts**: PascalCase with "Context" suffix (MixpanelContext.tsx)
- **Types**: kebab-case with .types.ts suffix (mixpanel.types.ts)
- **Constants**: kebab-case (tracking.ts)

### Import Order Pattern
```typescript
// 1. External libraries (React, React Native)
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';

// 2. Navigation
import {NavigationContainer} from '@react-navigation/native';

// 3. Internal contexts/hooks
import {useMixpanel} from '../contexts/MixpanelContext';

// 4. Components
import {ActionButton} from '../components/ActionButton';

// 5. Constants/types
import {Events, Properties} from '../constants/tracking';
```

### Event Tracking Pattern
```typescript
// Always use constants (prevents typos, enables autocomplete)
import {Events, Properties} from '../constants/tracking';

// Check initialization before tracking
if (isInitialized) {
  track(Events.SCREEN_VIEWED, {
    [Properties.SCREEN_NAME]: 'Home',
    [Properties.TIMESTAMP]: new Date().toISOString(),
  });
}

// Track on mount with useEffect
useEffect(() => {
  if (isInitialized) {
    track(Events.SCREEN_VIEWED, {...});
  }
}, [isInitialized, track]);
```

### User Identification Pattern
```typescript
// Complete signup flow (OnboardingScreen.tsx:52-90)
const previousId = await mixpanel.getDistinctId();
identify(userId);                    // Set new identity
await alias(userId, previousId);     // Link anonymous events
mixpanel.getPeople().set({...});     // Set profile
mixpanel.getPeople().setOnce({...}); // Set immutable properties
track(Events.USER_SIGNED_UP, {...}); // Track event
```

### Privacy-Compliant Logout Pattern
```typescript
// SettingsScreen.tsx demonstrates GDPR-compliant logout
track('User Logged Out', {...});  // Track before clearing
await flush();                     // Ensure events sent
reset();                           // Clear all data
```

## Project Structure

```
MixpanelStarter/
├── src/
│   ├── contexts/
│   │   └── MixpanelContext.tsx          # Context provider + useMixpanel hook
│   ├── screens/                         # 3 tab screens
│   │   ├── OnboardingScreen.tsx         # User identification flow
│   │   ├── HomeScreen.tsx               # Event tracking patterns
│   │   └── SettingsScreen.tsx           # Privacy controls
│   ├── components/                      # Reusable components
│   │   ├── ErrorBoundary.tsx            # Error boundary wrapper
│   │   ├── ActionButton.tsx             # Button with loading states
│   │   └── InfoCard.tsx                 # Key-value display card
│   ├── types/
│   │   └── mixpanel.types.ts            # TypeScript interfaces
│   ├── constants/
│   │   └── tracking.ts                  # Event names & properties
│   ├── @types/
│   │   └── env.d.ts                     # Environment variable types
│   └── App.tsx                          # Navigation setup
├── __tests__/
│   └── MixpanelContext.test.tsx         # Context tests
├── ios/                                 # iOS native code
├── android/                             # Android native code
├── .env.example                         # Environment template
├── README.md                            # User-facing documentation
└── INTEGRATION_GUIDE.md                 # Step-by-step integration guide
```

### File Responsibilities

**MixpanelContext.tsx** (src/contexts/)
- Initializes Mixpanel SDK on mount
- Sets default super properties (app version, platform, environment)
- Provides convenience wrapper methods (track, identify, alias, reset, flush)
- Manages loading/error states
- Exports useMixpanel hook

**OnboardingScreen.tsx** (src/screens/)
- Demonstrates: identify(), alias(), getPeople().set(), setOnce()
- Shows anonymous-to-identified user flow
- Displays current distinct ID
- Guest mode vs signup comparison

**HomeScreen.tsx** (src/screens/)
- Demonstrates: track(), timeEvent(), registerSuperProperties()
- Event tracking with rich properties
- Timed events (video start/complete)
- Dynamic super properties (dark mode, notifications)
- Displays current super properties

**SettingsScreen.tsx** (src/screens/)
- Demonstrates: optIn/OutTracking(), reset(), flush(), hasOptedOutTracking()
- GDPR compliance controls
- Data management (reset all data)
- Manual flush for testing
- SDK information display

**tracking.ts** (src/constants/)
- Centralized event names (Events object)
- Property names (Properties object)
- Super property keys (SuperProperties object)
- All constants are `as const` for type safety

## Key Concepts Demonstrated

### 1. Initialization Lifecycle
```typescript
// Context handles initialization automatically
useEffect(() => {
  const initMixpanel = async () => {
    const instance = new Mixpanel(token, trackAutomaticEvents, useNative);
    await instance.init();
    instance.registerSuperProperties({...});
    setMixpanel(instance);
    setIsInitialized(true);
  };
  initMixpanel();
}, [token]);
```

### 2. Loading State Management
```typescript
// Components can check initialization state
const { isInitialized, isLoading, error } = useMixpanel();

// Disable buttons until ready
<ActionButton
  disabled={!isInitialized}
  onPress={handleAction}
/>
```

### 3. Error Handling
```typescript
// Context catches initialization errors
try {
  await instance.init();
} catch (err) {
  setError(err instanceof Error ? err : new Error(String(err)));
  console.error('Failed to initialize Mixpanel:', error);
}

// ErrorBoundary catches React errors
<ErrorBoundary>
  <MixpanelProvider>
    {/* app */}
  </MixpanelProvider>
</ErrorBoundary>
```

### 4. TypeScript Strict Mode
- All files compile without errors
- Proper typing for all props and state
- Event/property names are type-safe constants
- No `any` types except in Record<string, any> for event properties

### 5. Educational Components
Every screen includes an InfoCard titled "What's Happening?" that explains:
- Which SDK methods are being used
- Why you'd use this pattern
- What data is being sent

## Common Modifications

### Adding a New Event

1. **Define constant** (src/constants/tracking.ts):
```typescript
export const Events = {
  // ... existing events
  FEATURE_USED: 'Feature Used',
};
```

2. **Track in component**:
```typescript
const handleFeatureUse = () => {
  track(Events.FEATURE_USED, {
    feature_name: 'search',
    timestamp: new Date().toISOString(),
  });
};
```

### Adding a New Screen

1. **Create screen file** (src/screens/NewScreen.tsx):
```typescript
import {useMixpanel} from '../contexts/MixpanelContext';
import {Events, Properties} from '../constants/tracking';

export const NewScreen = () => {
  const {track, isInitialized} = useMixpanel();

  useEffect(() => {
    if (isInitialized) {
      track(Events.SCREEN_VIEWED, {
        [Properties.SCREEN_NAME]: 'NewScreen',
      });
    }
  }, [isInitialized, track]);

  // ... component logic
};
```

2. **Add to navigation** (src/App.tsx):
```typescript
<Tab.Screen
  name="New"
  component={NewScreen}
  options={{
    tabBarLabel: 'New',
    tabBarIcon: ({color}) => <Text style={{fontSize: 20, color}}>🎯</Text>,
  }}
/>
```

### Changing Mixpanel Configuration

**In MixpanelProvider** (src/contexts/MixpanelContext.tsx):
```typescript
// Change automatic event tracking
trackAutomaticEvents={false}

// Change native/JS mode
useNative={false}  // Forces JavaScript implementation

// Modify default super properties
instance.registerSuperProperties({
  [SuperProperties.APP_VERSION]: '2.0.0',  // Update version
  'Custom Property': 'value',               // Add custom property
});
```

## Testing Guidelines

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- --watch         # Watch mode
```

### Test Structure
- **Unit tests**: Components and contexts in isolation
- **Mock Mixpanel SDK**: Already configured in MixpanelContext.test.tsx
- **Test initialization**: Verify loading → initialized state transition
- **Test error handling**: Provider catches and exposes errors

### Writing New Tests
```typescript
// Mock Mixpanel SDK
jest.mock('mixpanel-react-native', () => ({
  Mixpanel: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    track: jest.fn(),
    // ... other methods
  })),
}));

// Test component with context
render(
  <MixpanelProvider token="test-token">
    <YourComponent />
  </MixpanelProvider>
);
```

## TypeScript Configuration

### Strict Mode Enabled
```json
{
  "compilerOptions": {
    "strict": true,  // All strict checks enabled
    "typeRoots": ["./node_modules/@types", "./src/@types"]
  }
}
```

### Type Checking
```bash
npx tsc --noEmit  # Check types without emitting files
```

### Common Type Issues
- **Environment variables**: Defined in src/@types/env.d.ts
- **Mixpanel instance**: Can be null before initialization (check isInitialized)
- **Async methods**: alias() and flush() return Promise<void>

## Debugging

### Enable Logging
Logging is automatically enabled in development (`__DEV__`):
```typescript
if (__DEV__) {
  instance.setLoggingEnabled(true);
}
```

### Console Output
Look for `[Mixpanel]` prefixed logs:
- Event tracking confirmations
- Network requests
- Error messages
- Queue status

### Verify Events
1. **Console**: Check for `[Mixpanel]` logs
2. **Network**: Use React Native Debugger to see network requests
3. **Dashboard**: Events appear in Mixpanel Live View (may take 1-2 minutes)
4. **Distinct ID**: Call `await mixpanel.getDistinctId()` to verify initialization

### Common Issues

**Events not tracked?**
- Check `isInitialized` is true
- Verify token is set correctly
- Check opt-out status: `await hasOptedOutTracking()`
- Manually flush: `await flush()`

**TypeScript errors?**
- Clear Metro cache: `npm start -- --reset-cache`
- Verify all dependencies installed: `npm install`
- Check tsconfig.json is correct

**Build errors?**
- iOS: `cd ios && pod install && cd ..`
- Android: `cd android && ./gradlew clean && cd ..`
- Clear node_modules: `rm -rf node_modules && npm install`

## Best Practices for Modifications

### DO:
✅ Use constants for event/property names
✅ Check `isInitialized` before tracking
✅ Include timestamps in event properties
✅ Add "What's Happening?" explanations for new features
✅ Follow existing file structure and naming conventions
✅ Update TypeScript types when adding new interfaces
✅ Test on both iOS and Android
✅ Keep Context API pattern for Mixpanel access

### DON'T:
❌ Hardcode event names (use constants)
❌ Track before initialization
❌ Use `any` type (use strict TypeScript)
❌ Skip error handling
❌ Track PII without user consent
❌ Over-track (every render/state change)
❌ Mix navigation patterns (stick to bottom tabs)

## Educational Purpose

This sample app is designed to teach, not just demonstrate. When making changes:

1. **Preserve educational value**: Keep "What's Happening?" cards updated
2. **Maintain simplicity**: This bridges simple→complex, don't overcomplicate
3. **Document patterns**: Add comments explaining WHY, not just WHAT
4. **Keep it copy-pasteable**: Developers should be able to copy patterns directly

## Integration with Parent SDK

This sample lives at: `Samples/MixpanelStarter/`

**SDK dependency**: Uses `file:../..` to reference parent mixpanel-react-native package

**When SDK changes**:
```bash
cd Samples/MixpanelStarter
rm -rf node_modules
npm install  # Re-links to parent SDK
```

## Documentation Maintenance

### When to Update Docs

**README.md**: User-facing changes (new features, setup steps, troubleshooting)
**INTEGRATION_GUIDE.md**: Integration patterns, API changes, best practices
**CLAUDE.md**: Architecture changes, new patterns, file structure updates

### Documentation Standards
- Keep examples up-to-date with actual code
- Include both "why" and "how" explanations
- Use code snippets from real files (with file paths)
- Maintain consistent formatting and style

## Version Information

**Created**: 2025
**React Native Version**: 0.82.1
**Mixpanel SDK**: 3.1.2
**Target RN Version**: 0.70+

## AI Assistant Notes

When working with this codebase:

1. **Preserve the educational mission**: This is a learning tool, not just a demo
2. **Maintain Context API pattern**: Don't switch to Redux/MobX/etc
3. **Keep TypeScript strict**: No `any` types, proper inference
4. **Follow existing patterns**: File naming, import order, component structure
5. **Test changes**: Run `npm test` and `npx tsc --noEmit` before completing
6. **Update documentation**: README, INTEGRATION_GUIDE, and CLAUDE.md as needed

## Resources

- **Parent SDK**: `../../` (mixpanel-react-native)
- **Parent CLAUDE.md**: `../../CLAUDE.md`
- **Mixpanel Docs**: https://docs.mixpanel.com/docs/tracking/advanced/react-native
- **React Navigation**: https://reactnavigation.org/

Last updated: 2025-05-11
