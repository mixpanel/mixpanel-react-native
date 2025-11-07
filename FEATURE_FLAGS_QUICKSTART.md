# Feature Flags Quick Start Guide (Beta)

> **Beta Version:** `3.2.0-beta.2`
> **Native Mode Only:** This beta release supports iOS and Android native implementations. JavaScript mode (Expo/React Native Web) support coming in future release.

## Installation

Install the beta version:

```bash
npm install mixpanel-react-native@beta
```

For iOS, update native dependencies:

```bash
cd ios && pod install
```

## Basic Setup

### 1. Initialize with Feature Flags Enabled

```javascript
import { Mixpanel } from 'mixpanel-react-native';

const mixpanel = new Mixpanel('YOUR_TOKEN');

// Enable Feature Flags during initialization
await mixpanel.init(
  false,                    // optOutTrackingDefault
  {},                       // superProperties
  'https://api.mixpanel.com', // serverURL
  true,                     // useGzipCompression
  {
    enabled: true,          // Enable Feature Flags
    context: {              // Optional: Add targeting context
      platform: 'mobile',
      app_version: '2.1.0'
    }
  }
);
```

### 2. Check Flag Availability

Before accessing flags, verify they're loaded:

```javascript
if (mixpanel.flags.areFlagsReady()) {
  // Flags are ready to use
  console.log('Feature flags loaded!');
}
```

## Using Feature Flags

### Synchronous API (Recommended for UI)

Use sync methods when flags are ready (e.g., in render methods):

```javascript
// Check if feature is enabled
const showNewUI = mixpanel.flags.isEnabledSync('new-checkout-flow', false);

// Get variant value directly
const buttonColor = mixpanel.flags.getVariantValueSync('button-color', 'blue');

// Get full variant object with metadata
const variant = mixpanel.flags.getVariantSync('pricing-tier', {
  key: 'control',
  value: 'standard'
});

console.log(`Variant: ${variant.key}, Value: ${variant.value}`);
if (variant.experiment_id) {
  console.log(`Part of experiment: ${variant.experiment_id}`);
}
```

### Asynchronous API (Promise Pattern)

Use async methods for event handlers or initialization:

```javascript
// Promise pattern
const variant = await mixpanel.flags.getVariant('checkout-flow', {
  key: 'control',
  value: 'standard'
});

const enabled = await mixpanel.flags.isEnabled('dark-mode', false);

const colorValue = await mixpanel.flags.getVariantValue('theme-color', '#0000FF');
```

### Asynchronous API (Callback Pattern)

Alternative callback style for compatibility:

```javascript
// Callback pattern
mixpanel.flags.getVariant('feature-name', { key: 'control', value: 'off' }, (variant) => {
  console.log(`Feature variant: ${variant.key}`);
});

mixpanel.flags.isEnabled('new-feature', false, (isEnabled) => {
  if (isEnabled) {
    // Show new feature
  }
});
```

## Real-World Examples

### Example 1: Feature Toggle

```javascript
const NewCheckoutButton = () => {
  const [showNewCheckout, setShowNewCheckout] = useState(false);

  useEffect(() => {
    // Load flags on mount
    if (mixpanel.flags.areFlagsReady()) {
      const enabled = mixpanel.flags.isEnabledSync('new-checkout', false);
      setShowNewCheckout(enabled);
    }
  }, []);

  return showNewCheckout ? <NewCheckout /> : <LegacyCheckout />;
};
```

### Example 2: A/B Test with Variants

```javascript
const ProductCard = ({ product }) => {
  // Get button color variant (A/B test)
  const buttonColor = mixpanel.flags.areFlagsReady()
    ? mixpanel.flags.getVariantValueSync('button-color', 'blue')
    : 'blue';

  // Get pricing display variant
  const pricingVariant = mixpanel.flags.areFlagsReady()
    ? mixpanel.flags.getVariantSync('pricing-display', {
        key: 'control',
        value: 'standard'
      })
    : { key: 'control', value: 'standard' };

  return (
    <View>
      <Text>{product.name}</Text>
      {pricingVariant.value === 'bold' ? (
        <Text style={styles.boldPrice}>${product.price}</Text>
      ) : (
        <Text>${product.price}</Text>
      )}
      <Button
        title="Add to Cart"
        color={buttonColor}
        onPress={handleAddToCart}
      />
    </View>
  );
};
```

### Example 3: Gradual Rollout with Fallback

```javascript
const App = () => {
  const [uiVersion, setUiVersion] = useState('v1');

  useEffect(() => {
    const loadFlags = async () => {
      try {
        // Manually trigger flag load
        await mixpanel.flags.loadFlags();

        // Check which UI version to show
        const variant = mixpanel.flags.getVariantSync('ui-redesign', {
          key: 'control',
          value: 'v1'
        });

        setUiVersion(variant.value);

        // Track if user is in experiment
        if (variant.experiment_id) {
          console.log(`User in experiment: ${variant.experiment_id}`);
        }
      } catch (error) {
        console.error('Failed to load flags:', error);
        // Fallback to default
      }
    };

    loadFlags();
  }, []);

  return uiVersion === 'v2' ? <NewUI /> : <LegacyUI />;
};
```

### Example 4: Targeting with Context

```javascript
// Set user context for targeting
await mixpanel.init(
  false,
  {},
  'https://api.mixpanel.com',
  true,
  {
    enabled: true,
    context: {
      user_tier: 'premium',
      device_type: Platform.OS,
      app_version: '2.1.0',
      custom_properties: {
        beta_tester: true,
        region: 'US'
      }
    }
  }
);

// Flags will be evaluated based on context
const hasAccess = mixpanel.flags.isEnabledSync('premium-feature', false);
```

## API Reference

### Methods

| Method | Type | Description |
|--------|------|-------------|
| `areFlagsReady()` | Sync | Returns `true` if flags are loaded |
| `loadFlags()` | Async | Manually fetch flags from server |
| `isEnabledSync(name, fallback)` | Sync | Check if feature is enabled |
| `isEnabled(name, fallback)` | Async | Async version of isEnabledSync |
| `getVariantValueSync(name, fallback)` | Sync | Get variant value only |
| `getVariantValue(name, fallback)` | Async | Async version of getVariantValueSync |
| `getVariantSync(name, fallback)` | Sync | Get full variant object |
| `getVariant(name, fallback)` | Async | Async version of getVariantSync |

### Snake Case Aliases

All methods have snake_case aliases for consistency with mixpanel-js:

```javascript
// These are equivalent
mixpanel.flags.areFlagsReady()
mixpanel.flags.are_flags_ready()

mixpanel.flags.getVariantSync('feature', fallback)
mixpanel.flags.get_variant_sync('feature', fallback)
```

## Automatic Experiment Tracking

When a user is evaluated for a flag that's part of an A/B test, Mixpanel automatically tracks an `$experiment_started` event. No additional code required!

## Important Notes

### Platform Support

- ✅ **iOS**: Full support via native Swift SDK
- ✅ **Android**: Full support via native Android SDK
- ❌ **Expo/React Native Web**: Not supported in this beta (coming soon)

### Fallback Values

Always provide fallback values for graceful degradation:

```javascript
// Good - provides fallback
const color = mixpanel.flags.getVariantValueSync('color', 'blue');

// Bad - could return undefined if flag not found
const color = mixpanel.flags.getVariantValueSync('color');
```

### Performance

- Flags are lazy-loaded on first access
- Sync methods are preferred for UI rendering (no async overhead)
- Check `areFlagsReady()` before using sync methods

### Error Handling

Flags fail gracefully and return fallback values:

```javascript
try {
  await mixpanel.flags.loadFlags();
} catch (error) {
  console.error('Flag loading failed:', error);
  // App continues with fallback values
}
```

## Troubleshooting

### Flags Not Loading

1. Verify Feature Flags are enabled in your Mixpanel project
2. Check initialization includes `featureFlagsOptions: { enabled: true }`
3. Enable logging: `mixpanel.setLoggingEnabled(true)`
4. Verify network connectivity to Mixpanel API

### Native Module Not Found

This beta requires native modules. If you see "Native module not found":

1. Run `cd ios && pod install` (iOS)
2. Rebuild the app completely
3. Verify you're not using Expo Go (use dev client or eject)

### Getting Fallback Values

If flags always return fallbacks:

1. Check `mixpanel.flags.areFlagsReady()` returns `true`
2. Verify flag names match exactly (case-sensitive)
3. Confirm flags are published in Mixpanel dashboard
4. Check context targeting rules

## Feedback & Issues

This is a beta release. Please report issues at:
https://github.com/mixpanel/mixpanel-react-native/issues

Reference PR #331 for technical details:
https://github.com/mixpanel/mixpanel-react-native/pull/331

## What's Next

Coming in future releases:

- JavaScript mode support (Expo/React Native Web)
- Runtime context updates via `updateContext()`
- Performance optimizations

---

**Questions?** Visit [Mixpanel Documentation](https://mixpanel.com) or reach out to support.
