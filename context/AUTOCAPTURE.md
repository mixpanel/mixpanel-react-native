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

### Resolution Order

| Priority | iOS | Android |
|---|---|---|
| 1 | `nativeID` | `nativeID` |
| 2 | `accessibilityIdentifier` (React Native's `testID`) | resource entry name — React Native's ids are generated at runtime and have none, so `testID` never resolves here |
| 3 | `<ClassName>_<hash>` | `<SimpleClassName>_<hash>` |

**`accessibilityLabel` is never used as identity, on either platform.** It is user-facing
text: localized, so the same element would report a different id per language, and capable
of carrying personal data. It is not reported as a property either.

The hash is not random — it is derived from the element's position in the view hierarchy, so
it is stable across launches for the same layout. It identifies a *position*, not a row:
reordering siblings changes it, and so does wrapping the screen in a navigator.

### Walk-Up to Clickable Parent

Hit-testing returns the deepest view, so tapping a `<Pressable>` usually reports its `<Text>`
child, which carries no identity of its own. The native SDK therefore walks up to the nearest
clickable ancestor and resolves the id from there. This is always-on — not configurable.

- The clickable parent's identity wins, even when the leaf has one of its own.
- Stops at the first clickable ancestor (nested clickables: inner wins).
- Max ancestor search depth: **10 levels**; beyond that the leaf's own identity (or hash) is used.
- On iOS, if no *clickable* ancestor is found, the nearest ancestor carrying a `nativeID` or
  `testID` is used instead, so a named pressable is still attributed correctly.

### Dead Clicks Need an Explicit Role on iOS

`$mp_dead_click` is only reported for elements the platform can recognise as interactive.

On Android that is automatic: React Native sets `focusable` on `Pressable` and the
`Touchable*` family, which attaches an `OnClickListener`, and the SDK keys off
`hasOnClickListeners()` / `isClickable()`.

iOS has no equivalent. React Native dispatches every touch from a single recognizer on the
surface root, so a pressable has no `UIControl`, no gesture recognizer, and no accessibility
trait — it is indistinguishable from a plain `<View>`. A `nativeID` does not help: identifiers
are applied to layout wrappers and test hooks as often as to buttons, so treating one as proof
of clickability would report dead clicks on elements that were never meant to respond.

**Set `accessibilityRole="button"` on interactive wrappers to get dead click detection on
iOS.** It is also what VoiceOver needs in order to announce the element as actionable. Note
that `accessible={true}` does *not* substitute for it — that only marks the view as an
accessibility element and is already the default for `Pressable` and `Touchable*`.

### Best Practice

Set both on the *same* element: `nativeID` for a stable `$el_id`, `accessibilityRole` for dead
click detection.

```tsx
<Pressable
  onPress={handlePress}
  nativeID="add_to_cart"
  accessibilityRole="button">
  <Text>Add to Cart</Text>
</Pressable>
```

If the role sits on a wrapper and the `nativeID` on an inner element, the clickable ancestor
wins for attribution and the inner identifier is dropped — hence "same element".

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `click` | `boolean \| AutocaptureClickOptions` | `true` | Track click events |
| `rageClick` | `boolean \| AutocaptureRageClickOptions` | `true` | Track rage click events |
| `deadClick` | `boolean \| AutocaptureDeadClickOptions` | `true` | Track dead click events |

See `index.d.ts` for `AutocaptureClickOptions`, `AutocaptureRageClickOptions`, and `AutocaptureDeadClickOptions` interfaces.
