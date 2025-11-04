# MixpanelStarter

A modern, production-ready React Native sample application demonstrating [Mixpanel React Native SDK](https://github.com/mixpanel/mixpanel-react-native) integration with TypeScript, Context API, and best practices.

## 🎯 Purpose

This sample app bridges the gap between basic "Hello World" examples and complex production implementations. It demonstrates **80% of common Mixpanel use cases** with clean, maintainable patterns you can copy directly into your app.

### What Makes This Different

- **Modern Architecture**: Context API + TypeScript strict mode
- **Production Patterns**: Error handling, loading states, proper lifecycle management
- **Educational**: Each screen explains what's happening and why
- **Copy-Paste Ready**: Well-commented code you can use immediately

## ✨ Features Demonstrated

This app showcases 8 core Mixpanel SDK capabilities:

| Feature | Description | Screen |
|---------|-------------|--------|
| 🆔 **User Identification** | `identify()`, `alias()`, anonymous-to-identified flow | Onboarding |
| 👤 **User Profiles** | `getPeople().set()`, `setOnce()` for profile properties | Onboarding |
| 📊 **Event Tracking** | `track()` with custom properties and metadata | Home |
| ⏱️ **Timed Events** | `timeEvent()` for automatic duration tracking | Home |
| 🌐 **Super Properties** | `registerSuperProperties()` for global context | Home |
| 🔒 **Privacy Controls** | `optIn/OutTracking()` for GDPR compliance | Settings |
| 🗑️ **Data Management** | `reset()` for logout/data deletion | Settings |
| 🚀 **Manual Flush** | `flush()` to force send queued events | Settings |

## 📱 App Structure

The app has 3 tabs:

1. **Onboarding (User ID Tab)**: Demonstrates user identification lifecycle
2. **Home (Events Tab)**: Shows event tracking and super properties
3. **Settings**: Privacy controls and data management

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- React Native development environment set up ([guide](https://reactnative.dev/docs/environment-setup))
- Mixpanel project token ([get one here](https://mixpanel.com/register))

### Installation

```bash
# 1. Navigate to this directory
cd Samples/MixpanelStarter

# 2. Install dependencies
npm install

# 3. Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# 4. Configure your Mixpanel token
cp .env.example .env
# Edit .env and add your token: MIXPANEL_TOKEN=your_token_here
```

### Running the App

```bash
# iOS
npm run ios

# Android
npm run android
```

**Note**: If you don't set a token in `.env`, the app will use a placeholder token. You'll see events in the console but they won't reach Mixpanel.

## 🏗️ Project Structure

```
MixpanelStarter/
├── src/
│   ├── contexts/
│   │   └── MixpanelContext.tsx      # Context Provider + useMixpanel hook
│   ├── screens/
│   │   ├── OnboardingScreen.tsx     # User identification demos
│   │   ├── HomeScreen.tsx           # Event tracking patterns
│   │   └── SettingsScreen.tsx       # Privacy & data management
│   ├── components/
│   │   ├── ActionButton.tsx         # Reusable button component
│   │   ├── InfoCard.tsx             # Info display card
│   │   └── ErrorBoundary.tsx        # Error handling wrapper
│   ├── types/
│   │   └── mixpanel.types.ts        # TypeScript definitions
│   ├── constants/
│   │   └── tracking.ts              # Event names & properties
│   └── App.tsx                       # Navigation setup
├── __tests__/
│   └── MixpanelContext.test.tsx     # Basic context tests
└── .env.example                      # Environment template
```

## 📖 Key Patterns (Copy These!)

### 1. Context Setup

```typescript
// Wrap your app root with MixpanelProvider
<MixpanelProvider token="YOUR_TOKEN" trackAutomaticEvents={true}>
  <App />
</MixpanelProvider>

// Use in any component
const { mixpanel, isInitialized, track, identify } = useMixpanel();
```

**Why?** Provides app-wide access without prop drilling. Handles initialization and loading states automatically.

### 2. Event Tracking with Constants

```typescript
// Define event names as constants
const Events = {
  PRODUCT_VIEWED: 'Product Viewed',
  VIDEO_COMPLETED: 'Video Completed',
};

// Track events
track(Events.PRODUCT_VIEWED, {
  product_id: 'prod-123',
  product_name: 'Sample Product',
  timestamp: new Date().toISOString(),
});
```

**Why?** Constants prevent typos, enable autocomplete, and make refactoring easier.

### 3. User Identification Flow

```typescript
// Get the current anonymous ID
const previousId = await mixpanel.getDistinctId();

// Identify the user
identify(userId);

// Link previous anonymous events
alias(userId, previousId);

// Set profile properties
mixpanel.getPeople().set({
  $email: userId,
  signup_date: new Date().toISOString(),
});
```

**Why?** Preserves event history when users transition from anonymous to identified.

### 4. Super Properties for Global Context

```typescript
// Set once for all events
mixpanel.registerSuperProperties({
  'App Version': '1.0.0',
  'Dark Mode': darkModeEnabled,
  'Platform': Platform.OS,
});

// These are automatically included in every event
```

**Why?** Eliminates repetitive property passing. Perfect for user preferences and app state.

### 5. GDPR-Compliant Logout

```typescript
// Before logout
track('User Logged Out');
await flush();              // Send pending events
reset();                    // Clear all data
```

**Why?** Ensures data is sent before clearing, and respects user privacy.

## 🎓 Learning Resources

### In-App Learning

Each screen includes a "What's Happening?" card that explains:
- Which SDK methods are being used
- Why you'd use this pattern
- What data is being sent to Mixpanel

### Code Comments

Every key function includes comments explaining:
- **What** it does
- **Why** you'd use this pattern
- **When** to apply it in your app

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file (see `.env.example`):

```bash
MIXPANEL_TOKEN=your_project_token_here
```

### Mixpanel Options

In `src/App.tsx`, you can configure:

```typescript
<MixpanelProvider
  token={token}
  trackAutomaticEvents={true}  // Track app lifecycle events
  useNative={true}             // Use native iOS/Android SDKs
>
```

## 📚 Next Steps

### For Learning

1. Open the app and explore each screen
2. Read the "What's Happening?" cards to understand each pattern
3. Check Mixpanel dashboard to see events arrive
4. Modify the code and observe changes

### For Integration

1. Copy the `contexts/MixpanelContext.tsx` pattern into your app
2. Define your event names in `constants/tracking.ts`
3. Use `useMixpanel()` hook in your components
4. See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for step-by-step instructions

## 🤔 Common Questions

### Q: Which events should I track?

**A:** Focus on user actions that indicate value or progress:
- Key conversions (signup, purchase, subscription)
- Feature usage (search, filter, share)
- Content engagement (view, complete, like)

Avoid tracking:
- Every button click (too noisy)
- Internal state changes (not user-facing)
- PII without consent (privacy violation)

### Q: When should I use super properties vs. event properties?

**A:**
- **Super Properties**: User preferences, app state, device info (changes infrequently, applies to all events)
- **Event Properties**: Action-specific data (product ID, video title, search query)

### Q: How do I test without sending real events?

**A:**
1. Use a test project token from Mixpanel
2. Enable logging: `mixpanel.setLoggingEnabled(true)`
3. Check console for event details
4. Use opt-out during development: `mixpanel.optOutTracking()`

### Q: What's the difference between native and JavaScript mode?

**A:**
- **Native (default)**: Uses iOS Swift SDK and Android Java SDK. Better performance, automatic properties.
- **JavaScript**: Pure JS implementation. Required for Expo and web. More portable but fewer automatic properties.

Set in `MixpanelProvider`: `useNative={true}` or `useNative={false}`

## 🐛 Troubleshooting

### Events not appearing in Mixpanel?

1. Check token is correct: `getDistinctId()` should return a value
2. Verify network connectivity
3. Check opt-out status: `hasOptedOutTracking()`
4. Manually flush: `flush()` to send immediately
5. Enable logging: `setLoggingEnabled(true)`

### TypeScript errors?

```bash
# Clear caches
npm start -- --reset-cache

# Rebuild
cd ios && pod install && cd ..
npm run ios
```

### Build errors?

```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Clean Android build
cd android && ./gradlew clean && cd ..
```

## 📝 Design Decisions

### Why Context API over Redux/MobX?

- **Simplicity**: No boilerplate, minimal concepts
- **Standards**: Built into React, widely understood
- **Sufficient**: Mixpanel state is simple (one instance, few methods)

### Why TypeScript strict mode?

- **Safety**: Catches errors at compile time
- **Documentation**: Types serve as inline docs
- **Refactoring**: IDE support for safe code changes

### Why Bottom Tabs over Stack Navigation?

- **Clarity**: Each tab demonstrates a distinct concept
- **Simplicity**: Fewer navigation concepts to learn
- **Focus**: User isn't distracted by complex flows

## 🤝 Contributing

Found an issue or want to improve this sample?

1. This is a reference implementation, so changes should be broadly applicable
2. Keep patterns simple and well-commented
3. Ensure TypeScript strict mode passes
4. Test on both iOS and Android

## 📄 License

This sample app follows the same license as the [Mixpanel React Native SDK](https://github.com/mixpanel/mixpanel-react-native).

## 🔗 Resources

- [Mixpanel React Native SDK Docs](https://docs.mixpanel.com/docs/tracking/advanced/react-native)
- [Mixpanel Best Practices](https://docs.mixpanel.com/docs/tracking/how-tos/events-and-properties)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation Docs](https://reactnavigation.org/)

---

**Made with ❤️ to help you integrate Mixpanel quickly and correctly.**

Questions? Check out the [Integration Guide](./INTEGRATION_GUIDE.md) or [Mixpanel Community](https://community.mixpanel.com/).
