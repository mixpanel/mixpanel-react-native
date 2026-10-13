<div align="center" style="text-align: center">
  <img src="https://user-images.githubusercontent.com/71290498/231855346-12c8fc52-5f24-485c-b9e6-24468599fb87.png" alt="Mixpanel React Native Library" height="150"/>
</div>

##### _October 13, 2026_ - [v4.0.0](https://github.com/mixpanel/mixpanel-react-native/releases/tag/v4.0.0)

## Table of Contents

<!-- MarkdownTOC -->

- [Introduction](#introduction)
- [Quick Start Guide](#quick-start-guide)
  - [Install Mixpanel](#1-install-mixpanel)
  - [Initialize Mixpanel](#2-initialize-mixpanel)
  - [Send Data](#3-send-data)
  - [Check for Success](#4-check-for-success)
  - [Complete Code Example](#complete-code-example)
- [Version Support Policy](#version-support-policy)
- [FAQ](#faq)
- [I want to know more!](#i-want-to-know-more)

<!-- /MarkdownTOC -->

> **iOS 15+ from v4.0.0.** Starting with v4.0.0, the SDK supports iOS 15.0 and above (required by Xcode 27). Need iOS 12–14? Stay on v3.x with Xcode 26. See the [Version Support Policy](#version-support-policy).

> **Autocapture is in beta.** Autocapture — `$mp_click`, `$mp_rage_click` and `$mp_dead_click`, and
> the `mixpanel.autocapture` API — may contain issues, and its API and the properties it captures may
> change in a future release before general availability. Pin your SDK version if you build reports
> on autocaptured events.

## Introduction

Welcome to the official Mixpanel React Native library.
The Mixpanel React Native library is an open-source project, and we'd love to see your contributions!
We'd also love for you to come and work with us! Check out **[Jobs](https://mixpanel.com/jobs/#openings)** for details.

## Quick Start Guide

Mixpanel's React Native SDK is a wrapper around Mixpanel’s native iOS and Android SDKs and it supports offline tracking. Check out our **[official documentation](https://developer.mixpanel.com/docs/react-native)** for more in depth information on installing and using Mixpanel on React Native.

<a name="installation"></a>

### 1. Install Mixpanel

#### Prerequisites

- React Native v0.6+
- iOS 15.0+ deployment target. Xcode 27 rejects any target below iOS 15, so this SDK's minimum is iOS 15.0 from v4.0.0. Need to support iOS 12–14? Stay on v3.x with Xcode 26 (see [Version Support Policy](#version-support-policy)).
- [Setup development environment for React Native](https://reactnative.dev/docs/environment-setup)

#### Steps

1. Under your app's root directory, install Mixpanel React Native SDK.

```
npm install mixpanel-react-native
```

2. Install AsyncStorage (required for data persistence):

```
npm install @react-native-async-storage/async-storage
```

> **Note:** Starting from v3.2.0, `@react-native-async-storage/async-storage` is a peer dependency. This allows your project to use either v1.x or v2.x, avoiding conflicts with frameworks like Expo 52+.

> **Building with Xcode 27 and AsyncStorage installed?** Mixpanel only uses AsyncStorage in JavaScript mode, but AsyncStorage ships its own iOS pod (`RNCAsyncStorage`), which CocoaPods builds whenever the package is installed. Its podspec declares a deployment target below iOS 15 (v1.x and v2.x declare 13.4 or lower), and Xcode 27 rejects that for its resource-bundle target with an error like `IPHONEOS_DEPLOYMENT_TARGET is set to 13.4, but the range of supported deployment target versions is 15.0 to ...`. Until AsyncStorage raises its floor, add this inside the `post_install` block of your app's `ios/Podfile`, after `react_native_post_install`:
>
> ```ruby
> installer.pods_project.targets.each do |target|
>   target.build_configurations.each do |config|
>     current = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
>     if current.nil? || Gem::Version.new(current) < Gem::Version.new('15.0')
>       config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
>     end
>   end
> end
> ```
>
> This does not apply if AsyncStorage is not installed (for example, native mode only).

3. Under your application's ios folder, run

```
pod install
```

Please note: You do not need to update your Podfile to add Mixpanel.

### 2. Initialize Mixpanel

To start tracking with the library you must first initialize with your project token. You can get your project token from [project settings](https://mixpanel.com/settings/project).

```js
import { Mixpanel } from "mixpanel-react-native";

const trackAutomaticEvents = false;
const mixpanel = new Mixpanel("Your Project Token", trackAutomaticEvents);
mixpanel.init();
```

Once you've called this method once, you can access `mixpanel` throughout the rest of your application.

### 3. Send Data

Let's get started by sending event data. You can send an event from anywhere in your application. Better understand user behavior by storing details that are specific to the event (properties). After initializing the library, Mixpanel will automatically track some properties by default. [learn more](https://help.mixpanel.com/hc/en-us/articles/115004613766-Default-Properties-Collected-by-Mixpanel)

```js
// Track with event-name
mixpanel.track("Sent Message");
// Track with event-name and property
mixpanel.track("Plan Selected", { Plan: "Premium" });
```

In addition to event data, you can also send [user profile data](https://developer.mixpanel.com/docs/react-native#storing-user-profiles). We recommend this after completing the quickstart guide.

### 4. Check for Success

[Open up Events in Mixpanel](http://mixpanel.com/report/events) to view incoming events.
Once data hits our API, it generally takes ~60 seconds for it to be processed, stored, and queryable in your project.
<a name="i-want-to-know-more"></a>

### Complete Code Example

```js
import React from "react";
import { Button, SafeAreaView } from "react-native";
import { Mixpanel } from "mixpanel-react-native";

const trackAutomaticEvents = false;
const mixpanel = new Mixpanel("Your Project Token", trackAutomaticEvents);
mixpanel.init();

const SampleApp = () => {
  return (
    <SafeAreaView>
      <Button
        title="Select Premium Plan"
        onPress={() => mixpanel.track("Plan Selected", { Plan: "Premium" })}
      />
    </SafeAreaView>
  );
};

export default SampleApp;
```

### Feature Flags 

Please see the [documentation](https://docs.mixpanel.com/docs/tracking-methods/sdks/react-native/react-native-flags) for how to integrate with Mixpanel feature flags.

### Expo and React Native for Web support (3.0.2 and above)

Starting from version 3.0.2, we have introduced support for Expo, React Native for Web, and other platforms utilizing React Native that do not support iOS and Android directly.
To enable this feature,
<br>Step 1:

```
npm install @react-native-async-storage/async-storage
```

When JavaScript mode is enabled, Mixpanel utilizes [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) to persist data. If you prefer not to use it, or if AsyncStorage is unavailable in your target environment, you can import or define a different storage class. However, it must follow a subset (see: [`MixpanelAsyncStorage`](index.d.ts)) of the same interface as [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) The following example demonstrates how to use a custom storage solution:

```
// Optional: if you do not want to use the default AsyncStorage
const MyAsyncStorage = require("@my-org/<library-path>/AsyncStorage");
const trackAutomaticEvents = false;
const useNative = false;
const mixpanel = new Mixpanel('YOUR_TOKEN', trackAutomaticEvents, useNative, MyAsyncStorage);
mixpanel.init();
```

<br>Step 2:
Initialize Mixpanel with an additional parameter, `useNative`, set to false.

```
const trackAutomaticEvents = false;
const useNative = false;
const mixpanel = new Mixpanel(
    "YOUR_MIXPANEL_TOKEN",
    trackAutomaticEvents,
    useNative
  );
```

This will activate JavaScript mode.

👋 👋 Tell us about the Mixpanel developer experience! [https://www.mixpanel.com/devnps](https://www.mixpanel.com/devnps) 👍 👎

## Version Support Policy

Xcode 27 requires every target in your build, including CocoaPods pod targets, to have a deployment target of iOS 15 or higher. Apple also requires App Store submissions to use the iOS 27 SDK starting April 2027, so apps will move to iOS 15+ regardless.

| Version | Minimum iOS | Xcode | Status |
| ------- | ----------- | ----- | ------ |
| v4.x    | 15.0        | 26 and 27 | Current: new features and fixes |
| v3.x    | 12.0        | 26    | Maintenance: security, crash and data-loss fixes only, through April 2027 |

**Need iOS 12–14? Stay on v3.x with Xcode 26.** Existing `^3.x` ranges keep resolving to v3.x and receive its maintenance patches without any action. When you are ready to move, upgrade to v4.x and raise your app's deployment target to iOS 15.0 or higher.

Our policy: we add support for each new Xcode's deployment-target floor promptly after its GM release, and we drop the old floor only when Apple's SDK submission requirement makes it necessary, not on the day Xcode ships. The v3.x maintenance window ends in April 2027, when Apple requires the iOS 27 SDK. At that point we publish a final v3.x release and stop backporting.

## FAQ

**I want to stop tracking an event/event property in Mixpanel. Is that possible?**
Yes, in Lexicon, you can intercept and drop incoming events or properties. Mixpanel won’t store any new data for the event or property you select to drop. [See this article for more information](https://help.mixpanel.com/hc/en-us/articles/360001307806#dropping-events-and-properties).

**I have a test user I would like to opt out of tracking. How do I do that?**
Mixpanel’s client-side tracking library contains the [optOutTracking()](https://mixpanel.github.io/mixpanel-react-native/Mixpanel.html#optOutTracking) method, which will set the user’s local opt-out state to “true” and will prevent data from being sent from a user’s device. More detailed instructions can be found in the section, [Opting users out of tracking](https://developer.mixpanel.com/docs/react-native#opting-users-out-of-tracking).

**Why aren't my events showing up?**
First, make sure your test device has internet access. To preserve battery life and customer bandwidth, the Mixpanel library doesn't send the events you record immediately. Instead, it sends batches to the Mixpanel servers every 60 seconds while your application is running, as well as when the application transitions to the background. You can call [flush()](https://mixpanel.github.io/mixpanel-react-native/Mixpanel.html#flush) manually if you want to force a flush at a particular moment.

```
mixpanel.flush();
```

If your events are still not showing up after 60 seconds, check if you have opted out of tracking. You can also enable Mixpanel debugging and logging, it allows you to see the debug output from the Mixpanel library. To enable it, call [setLoggingEnabled](https://mixpanel.github.io/mixpanel-react-native/Mixpanel.html#setLoggingEnabled) with true, then run your iOS project with Xcode or android project with Android Studio. The logs should be available in the console.

```
mixpanel.setLoggingEnabled(true);
```

**Starting with iOS 14.5, do I need to request the user’s permission through the AppTrackingTransparency framework to use Mixpanel?**
No, Mixpanel does not use IDFA so it does not require user permission through the AppTrackingTransparency(ATT) framework.

**If I use Mixpanel, how do I answer app privacy questions for the App Store?**
Please refer to our [Apple App Developer Privacy Guidance](https://mixpanel.com/legal/app-store-privacy-details/)

## I want to know more!

No worries, here are some links that you will find useful:

- **[Sample apps](https://github.com/mixpanel/mixpanel-react-native/tree/master/Samples)**
- **[Full API Reference](https://mixpanel.github.io/mixpanel-react-native/Mixpanel.html)**

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/mixpanel/mixpanel-react-native)

Have any questions? Reach out to Mixpanel [Support](https://help.mixpanel.com/hc/en-us/requests/new) to speak to someone smart, quickly.
