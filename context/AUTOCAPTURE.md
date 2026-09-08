# React Native Autocapture

Autocapture automatically tracks user interactions in React Native apps by delegating to the native Android and iOS SDKs.

## Overview

Autocapture captures three types of events:

| Event | Name | Description |
|-------|------|-------------|
| Click | `$mp_click` | Fired when a user taps any element |
| Rage Click | `$mp_rage_click` | Fired when a user taps rapidly (4+ times) in the same area |
| Dead Click | `$mp_dead_click` | Fired when a tap produces no visible UI response |

## Requirements

**Autocapture requires native mode.** It is implemented entirely in the native Android and
iOS SDKs; the JavaScript layer only forwards configuration to them. In JavaScript mode there
is nothing to forward to, so `autocaptureOptions` is ignored and `init` logs:

> Mixpanel autocapture requires native mode (useNative: true). Autocapture config will be
> ignored in JavaScript mode.

`useNative` is the third argument to the constructor and defaults to `true`, so most apps get
it for free. Passing `false` — as an app targeting Expo Go must, since it cannot load custom
native modules — silently disables autocapture. No events are captured, and no error is
raised beyond that one warning at startup.

```typescript
new Mixpanel('YOUR_TOKEN', true);              // native mode, autocapture works
new Mixpanel('YOUR_TOKEN', true, true);        // explicit, same thing
new Mixpanel('YOUR_TOKEN', true, false);       // JavaScript mode — autocapture does nothing
```

## Quick Start

```typescript
import {Mixpanel} from 'mixpanel-react-native';

const mixpanel = new Mixpanel('YOUR_TOKEN', true);
await mixpanel.init(
  false, // optOutTrackingDefault
  {},    // superProperties
  '',    // serverURL
  true,  // useGzipCompression
  {},    // featureFlagsOptions
  {      // autocaptureOptions
    click: true,
    rageClick: true,
    deadClick: true,
  }
);
```

## Element Identification (`$el_id`)

### Walk-Up to Clickable Parent

When a non-interactive leaf view (e.g., `<Text>` inside a `<Pressable>`) is tapped, the native SDK walks up the view hierarchy to the nearest clickable ancestor and uses its `accessibilityLabel` for `$el_id`. This is always-on behavior — not configurable.

- The walk-up always takes the clickable parent's identity, even if the leaf has its own `accessibilityLabel`.
- Stops at the first clickable ancestor (nested clickables: inner wins).
- Max ancestor search depth: **10 levels**.
- If no clickable ancestor is found within 10 levels, the leaf's own identity (or hash fallback) is used.

React Native's view flattening compounds this — intermediate `<View>` wrappers are removed from the native tree, so the platform's hit-test often returns a leaf `Text` node even when the developer intended the tap for the parent `Pressable`.

### Best Practice

Set `accessibilityLabel` on interactive wrappers (`Pressable`, `TouchableOpacity`):

```tsx
<Pressable
  onPress={handlePress}
  accessible={true}
  accessibilityLabel="add_to_cart">
  <Text>Add to Cart</Text>
</Pressable>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `click` | `boolean \| AutocaptureClickOptions` | `true` | Track click events |
| `rageClick` | `boolean \| AutocaptureRageClickOptions` | `true` | Track rage click events |
| `deadClick` | `boolean \| AutocaptureDeadClickOptions` | `true` | Track dead click events |

See `index.d.ts` for `AutocaptureClickOptions`, `AutocaptureRageClickOptions`, and `AutocaptureDeadClickOptions` interfaces.
