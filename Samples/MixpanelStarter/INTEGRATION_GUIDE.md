# Integration Guide: Adding Mixpanel to Your React Native App

This guide provides step-by-step instructions for integrating Mixpanel into your React Native application using the patterns demonstrated in MixpanelStarter.

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] React Native app (0.70+) with TypeScript
- [ ] Mixpanel project token ([create one](https://mixpanel.com/register))
- [ ] `@react-native-async-storage/async-storage` installed (required dependency)

## 8-Step Integration Process

### Step 1: Install Dependencies

```bash
npm install mixpanel-react-native @react-native-async-storage/async-storage
```

For iOS, install pods:

```bash
cd ios && pod install && cd ..
```

### Step 2: Set Up Environment Variables (Optional but Recommended)

Install dotenv support:

```bash
npm install react-native-dotenv --save-dev
```

Configure `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
```

Create `.env`:

```bash
MIXPANEL_TOKEN=your_token_here
```

Create type definitions in `src/@types/env.d.ts`:

```typescript
declare module '@env' {
  export const MIXPANEL_TOKEN: string;
}
```

### Step 3: Define Event Constants

Create `src/constants/tracking.ts`:

```typescript
// Event Names
export const Events = {
  // Screen Views
  SCREEN_VIEWED: 'Screen Viewed',

  // User Actions
  USER_SIGNED_UP: 'User Signed Up',
  USER_LOGGED_IN: 'User Logged In',
  USER_LOGGED_OUT: 'User Logged Out',

  // Add your app-specific events here
} as const;

// Property Names
export const Properties = {
  SCREEN_NAME: 'screen_name',
  USER_ID: 'user_id',
  TIMESTAMP: 'timestamp',

  // Add your app-specific properties here
} as const;

// Super Property Keys
export const SuperProperties = {
  APP_VERSION: 'App Version',
  PLATFORM: 'Platform',
  ENVIRONMENT: 'Environment',
} as const;
```

**Why?** Constants prevent typos, enable autocomplete, and make refactoring easier.

### Step 4: Create Type Definitions

Create `src/types/mixpanel.types.ts`:

```typescript
import {Mixpanel} from 'mixpanel-react-native';

export interface MixpanelContextValue {
  mixpanel: Mixpanel | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;

  // Convenience methods
  track: (eventName: string, properties?: Record<string, any>) => void;
  identify: (distinctId: string) => void;
  alias: (alias: string, distinctId?: string) => void;
  reset: () => void;
  flush: () => Promise<void>;
}
```

### Step 5: Create Mixpanel Context

Create `src/contexts/MixpanelContext.tsx`:

```typescript
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {Mixpanel} from 'mixpanel-react-native';
import {Platform} from 'react-native';
import {MixpanelContextValue} from '../types/mixpanel.types';
import {SuperProperties} from '../constants/tracking';

const MixpanelContext = createContext<MixpanelContextValue | undefined>(
  undefined,
);

interface MixpanelProviderProps {
  children: ReactNode;
  token: string;
  trackAutomaticEvents?: boolean;
  useNative?: boolean;
}

export const MixpanelProvider: React.FC<MixpanelProviderProps> = ({
  children,
  token,
  trackAutomaticEvents = true,
  useNative = true,
}) => {
  const [mixpanel, setMixpanel] = useState<Mixpanel | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initMixpanel = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const instance = new Mixpanel(token, trackAutomaticEvents, useNative);
        await instance.init();

        // Set default super properties
        instance.registerSuperProperties({
          [SuperProperties.APP_VERSION]: '1.0.0', // Replace with actual version
          [SuperProperties.PLATFORM]: Platform.OS,
          [SuperProperties.ENVIRONMENT]: __DEV__ ? 'development' : 'production',
        });

        if (__DEV__) {
          instance.setLoggingEnabled(true);
        }

        setMixpanel(instance);
        setIsInitialized(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to initialize Mixpanel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initMixpanel();
  }, [token, trackAutomaticEvents, useNative]);

  // Convenience wrapper methods
  const track = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      if (!mixpanel || !isInitialized) {
        console.warn('Mixpanel not initialized. Event:', eventName);
        return;
      }
      mixpanel.track(eventName, properties);
    },
    [mixpanel, isInitialized],
  );

  const identify = useCallback(
    (distinctId: string) => {
      if (!mixpanel || !isInitialized) return;
      mixpanel.identify(distinctId);
    },
    [mixpanel, isInitialized],
  );

  const alias = useCallback(
    (aliasValue: string, distinctId?: string) => {
      if (!mixpanel || !isInitialized) return;
      mixpanel.alias(aliasValue, distinctId);
    },
    [mixpanel, isInitialized],
  );

  const reset = useCallback(() => {
    if (!mixpanel || !isInitialized) return;
    mixpanel.reset();
  }, [mixpanel, isInitialized]);

  const flush = useCallback(async () => {
    if (!mixpanel || !isInitialized) return;
    await mixpanel.flush();
  }, [mixpanel, isInitialized]);

  const value: MixpanelContextValue = {
    mixpanel,
    isInitialized,
    isLoading,
    error,
    track,
    identify,
    alias,
    reset,
    flush,
  };

  return (
    <MixpanelContext.Provider value={value}>
      {children}
    </MixpanelContext.Provider>
  );
};

export const useMixpanel = (): MixpanelContextValue => {
  const context = useContext(MixpanelContext);
  if (context === undefined) {
    throw new Error('useMixpanel must be used within a MixpanelProvider');
  }
  return context;
};
```

### Step 6: Wrap Your App Root

In your root `App.tsx`:

```typescript
import {MixpanelProvider} from './src/contexts/MixpanelContext';
import {MIXPANEL_TOKEN} from '@env';

function App() {
  return (
    <MixpanelProvider token={MIXPANEL_TOKEN} trackAutomaticEvents={true}>
      {/* Your app content */}
    </MixpanelProvider>
  );
}
```

### Step 7: Use in Components

Track events in any component:

```typescript
import {useMixpanel} from '../contexts/MixpanelContext';
import {Events, Properties} from '../constants/tracking';

function MyScreen() {
  const {track, isInitialized} = useMixpanel();

  useEffect(() => {
    if (isInitialized) {
      track(Events.SCREEN_VIEWED, {
        [Properties.SCREEN_NAME]: 'MyScreen',
        [Properties.TIMESTAMP]: new Date().toISOString(),
      });
    }
  }, [isInitialized, track]);

  const handleButtonClick = () => {
    track('Button Clicked', {
      button_name: 'Submit',
      screen: 'MyScreen',
    });
  };

  return (
    // Your UI
  );
}
```

### Step 8: Test Your Integration

1. **Enable Logging** (in development):
   ```typescript
   // Already enabled in context if __DEV__ is true
   ```

2. **Check Console**: Look for `[Mixpanel]` logs showing events being tracked

3. **Verify in Dashboard**:
   - Go to Mixpanel dashboard
   - Navigate to "Events" or "Live View"
   - Confirm events are arriving

4. **Test Key Flows**:
   ```typescript
   // Test user identification
   identify('user123');

   // Test event tracking
   track('Test Event', {test: true});

   // Test manual flush
   await flush();
   ```

## Testing Validation Checklist

- [ ] Events appear in Mixpanel dashboard
- [ ] `getDistinctId()` returns a valid ID
- [ ] Console shows `[Mixpanel]` logs in development
- [ ] User profiles appear after `identify()` + `getPeople().set()`
- [ ] Super properties are included in all events

## Best Practices

### Event Naming Conventions

```typescript
// ✅ Good: Noun + Verb (Past Tense)
'Product Viewed'
'Purchase Completed'
'Video Started'

// ❌ Bad: Vague or inconsistent
'click'
'ProductView'
'video_start'
```

### Property Naming Conventions

```typescript
// ✅ Good: snake_case, descriptive
{
  product_id: 'prod-123',
  product_name: 'Sample Product',
  product_price: 29.99,
}

// ❌ Bad: Inconsistent casing
{
  ProductID: 'prod-123',
  'product name': 'Sample Product',
  price: 29.99,
}
```

### Code Organization

```
your-app/
├── src/
│   ├── contexts/
│   │   └── MixpanelContext.tsx    # Keep in contexts/
│   ├── constants/
│   │   └── tracking.ts            # Centralize event definitions
│   └── screens/
│       └── MyScreen.tsx           # Import useMixpanel() as needed
```

### When to Track

**✅ Track:**
- User actions (button clicks, form submissions)
- Navigation (screen views, tab switches)
- Key conversions (signup, purchase, subscription)
- Feature usage (search, filter, share)

**❌ Don't Track:**
- Every render or state change
- Internal errors (use error monitoring instead)
- PII without consent (email, phone without user permission)

## Common Pitfalls

### 1. Tracking Before Initialization

```typescript
// ❌ Bad
track('Event'); // Might not be initialized yet

// ✅ Good
if (isInitialized) {
  track('Event');
}
```

### 2. Forgetting to Alias

```typescript
// ❌ Bad: User's anonymous events are lost
identify(userId);

// ✅ Good: Preserve event history
const previousId = await mixpanel.getDistinctId();
identify(userId);
alias(userId, previousId);
```

### 3. Not Flushing Before Logout

```typescript
// ❌ Bad: Queued events are lost
reset();

// ✅ Good: Send events before clearing
track('User Logged Out');
await flush();
reset();
```

### 4. Hardcoding Event Names

```typescript
// ❌ Bad: Typos cause tracking issues
track('Screen Viewd'); // Typo!

// ✅ Good: Use constants
track(Events.SCREEN_VIEWED);
```

### 5. Over-Tracking

```typescript
// ❌ Bad: Too noisy
onChange={(text) => track('Input Changed', {text})}

// ✅ Good: Track meaningful actions
onSubmit={() => track('Form Submitted', {form: 'login'})}
```

## Essential Methods Reference

| Method | Purpose | Example |
|--------|---------|---------|
| `track()` | Send an event | `track('Button Clicked', {button: 'Submit'})` |
| `identify()` | Set user ID | `identify('user123')` |
| `alias()` | Link IDs | `alias('user123', 'anon-456')` |
| `getPeople().set()` | Set profile property | `getPeople().set({plan: 'premium'})` |
| `registerSuperProperties()` | Set global property | `registerSuperProperties({theme: 'dark'})` |
| `reset()` | Clear all data | `reset()` // Call on logout |
| `flush()` | Send queued events | `await flush()` // Before logout |
| `optInTracking()` | Enable tracking | `await optInTracking()` |
| `optOutTracking()` | Disable tracking | `await optOutTracking()` |
| `getDistinctId()` | Get current ID | `const id = await getDistinctId()` |

## Advanced Patterns

### User Identification Flow

```typescript
const handleLogin = async (email: string, password: string) => {
  // 1. Authenticate user (your auth logic)
  const user = await authenticate(email, password);

  // 2. Get previous anonymous ID
  const previousId = await mixpanel.getDistinctId();

  // 3. Identify with user ID
  identify(user.id);

  // 4. Link anonymous events to this user
  alias(user.id, previousId);

  // 5. Set user profile
  mixpanel.getPeople().set({
    $email: user.email,
    $name: user.name,
    plan: user.plan,
  });

  // 6. Track login event
  track(Events.USER_LOGGED_IN, {
    method: 'email',
    timestamp: new Date().toISOString(),
  });
};
```

### GDPR-Compliant Logout

```typescript
const handleLogout = async () => {
  // 1. Track logout event
  track(Events.USER_LOGGED_OUT, {
    timestamp: new Date().toISOString(),
  });

  // 2. Flush queued events
  await flush();

  // 3. Clear all Mixpanel data
  reset();

  // 4. Your app logout logic
  await signOut();
};
```

### Timed Events

```typescript
const handleVideoStart = () => {
  // Start timer
  mixpanel.timeEvent('Video Completed');

  track('Video Started', {
    video_id: 'intro-123',
    video_title: 'Introduction',
  });
};

const handleVideoEnd = () => {
  // Duration is automatically calculated
  track('Video Completed', {
    video_id: 'intro-123',
    video_title: 'Introduction',
  });
};
```

## Troubleshooting

### Events Not Showing Up

1. Check token: `console.log(MIXPANEL_TOKEN)`
2. Verify initialization: `console.log(isInitialized)`
3. Check opt-out status: `const hasOptedOut = await mixpanel.hasOptedOutTracking()`
4. Enable logging: Already enabled if `__DEV__` is true
5. Manual flush: `await flush()`

### TypeScript Errors

```bash
# Clear Metro cache
npm start -- --reset-cache

# Reinstall pods (iOS)
cd ios && pod install && cd ..
```

### Build Issues

```bash
# iOS
cd ios && xcodebuild clean && cd ..

# Android
cd android && ./gradlew clean && cd ..
```

## Next Steps

1. ✅ Complete the 8-step integration
2. ✅ Validate with the testing checklist
3. 📊 Define your tracking plan (which events, which properties)
4. 🎨 Customize super properties for your app
5. 🧪 Test in development before production
6. 📈 Monitor your Mixpanel dashboard

## Resources

- [Mixpanel React Native SDK Docs](https://docs.mixpanel.com/docs/tracking/advanced/react-native)
- [Mixpanel Best Practices](https://docs.mixpanel.com/docs/tracking/how-tos/events-and-properties)
- [MixpanelStarter Sample Code](./src)

---

**Questions?** Check the [README](./README.md) or [Mixpanel Community](https://community.mixpanel.com/).
