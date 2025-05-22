<div align="center" style="text-align: center">
  <img src="https://user-images.githubusercontent.com/71290498/231855346-12c8fc52-5f24-485c-b9e6-24468599fb87.png" alt="Mixpanel React Native Library" height="150"/>
</div>

#####

## Table of Contents

<!-- MarkdownTOC -->

- [Introduction](#introduction)
- [Quick Start Guide](#quick-start-guide)
  - [Install Mixpanel](#1-install-mixpanel)
  - [Initialize Mixpanel](#2-initialize-mixpanel)
  - [Send Data](#3-send-data)
  - [Check for Success](#4-check-for-success)
  - [Complete Code Example](#complete-code-example)
- [FAQ](#faq)
- [I want to know more!](#i-want-to-know-more)

<!-- /MarkdownTOC -->

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
- [Setup development environment for React Native](https://reactnative.dev/docs/environment-setup)

#### Steps

1. Under your app's root directory, install Mixpanel React Native SDK.

```
npm install mixpanel-react-native
```

2. Under your application's ios folder, run

```
pod install
```

Please note: You do not need to update your Podfile to add Mixpanel.

3. Since Xcode 12.5, there is a known swift compile issue, please refer to this **[workaround](https://github.com/mixpanel/mixpanel-react-native/issues/43#issuecomment-829599732)**. However the compile issue has been resolved in Xcode 13.2.1+, there is no extra step required as long as you upgrade to Xcode 13.2.1+.

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
