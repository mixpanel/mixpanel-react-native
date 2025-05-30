#

## [v3.1.0](https://github.com/mixpanel/mixpanel-react-native/tree/v3.1.0) (2025-05-30)

### Enhancements

- Use expo-crypto for UUID on Expo, expose useGzipCompression option and fix JavaScript mode People flushing issue [\#288](https://github.com/mixpanel/mixpanel-react-native/pull/288)

#

## [v3.0.9](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.9) (2025-04-11)

### Enhancements

- Bump native SDKs, Swift 4.4.0 and Android 8.0.3 [\#285](https://github.com/mixpanel/mixpanel-react-native/pull/285)

### Fixes

- fix: custom storage [\#282](https://github.com/mixpanel/mixpanel-react-native/pull/282)

#

## [v3.0.8](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.8) (2024-11-21)

### Fixes

- encodeURIComponent body JSON data [\#277](https://github.com/mixpanel/mixpanel-react-native/pull/277)

#

## [v3.0.7](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.7) (2024-09-26)

### Fixes

- Revert the minSDK to 21 [\#271](https://github.com/mixpanel/mixpanel-react-native/pull/271)
- revert android [\#267](https://github.com/mixpanel/mixpanel-react-native/pull/267)

#

## [v3.0.6](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.6) (2024-09-10)

### Enhancements

- bump iOS to 4.3.0 and Android minSDK to 23 [\#264](https://github.com/mixpanel/mixpanel-react-native/pull/264)
- upgrade android sdk to 7.5.3 [\#263](https://github.com/mixpanel/mixpanel-react-native/pull/263)

### Fixes

- fix: opt in tracking issue during initialize [\#257](https://github.com/mixpanel/mixpanel-react-native/pull/257)

#

## [v3.0.5](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.5) (2024-05-14)

### Fixes

- fix: resolve import issue for MixpanelMain [\#253](https://github.com/mixpanel/mixpanel-react-native/pull/253)

#

## [v3.0.4](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.4) (2024-05-13)

### Fixes

- Improvement for supporting the custom storage [\#251](https://github.com/mixpanel/mixpanel-react-native/pull/251)
- Avoid CORS errors [\#250](https://github.com/mixpanel/mixpanel-react-native/pull/250)

#

## [v3.0.3](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.3) (2024-05-10)

### Enhancements

- bump iOS to 4.2.7 [\#249](https://github.com/mixpanel/mixpanel-react-native/pull/249)
- Require only the used subset of `AsnycStorage` as custom storage [\#246](https://github.com/mixpanel/mixpanel-react-native/pull/246)
- Fix CI issues for both iOS and Android and update the sample app [\#241](https://github.com/mixpanel/mixpanel-react-native/pull/241)
- Version bump Android SDK to 7.5.2 [\#237](https://github.com/mixpanel/mixpanel-react-native/pull/237)

### Fixes

- fix: fix adapter storage jest setup [\#244](https://github.com/mixpanel/mixpanel-react-native/pull/244)
- fix storage adapter info being logged on every app launch [\#239](https://github.com/mixpanel/mixpanel-react-native/pull/239)
- Added null check for empty constants object incase of web [\#238](https://github.com/mixpanel/mixpanel-react-native/pull/238)

#

## [v3.0.2](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.2) (2024-04-16)

### Fixes

- Avoid crash if AsyncStorage is null [\#235](https://github.com/mixpanel/mixpanel-react-native/pull/235)

#

## [v3.0.1](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.1) (2024-04-11)

### Fixes

- Replace the MixpanelReactNative with mixpanelImpl and bump native versions [\#231](https://github.com/mixpanel/mixpanel-react-native/pull/231)

**Closed issues:**

- Expo managed workflow support [\#82](https://github.com/mixpanel/mixpanel-react-native/issues/82)
- Feature request: Support react-native-web [\#24](https://github.com/mixpanel/mixpanel-react-native/issues/24)

#

## [v3.0.0](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.0) (2024-04-09)

This is the official release for Expo and React Native Web support. For more details, please refer to the release notes for versions [3.0.0-beta.2](https://github.com/mixpanel/mixpanel-react-native/blob/master/CHANGELOG.md#v300-beta2-2024-03-06) and [3.0.0-beta.1](https://github.com/mixpanel/mixpanel-react-native/blob/master/CHANGELOG.md#v300-beta1-2024-02-29).

### Enhancements

- bump ios version to 4.2.4 [\#228](https://github.com/mixpanel/mixpanel-react-native/pull/228)

#

## [v3.0.0-beta.2](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.0-beta.2) (2024-03-06)

### Enhancements
- Add support to use custom storage instead of @react-native-async-storage/async-storage.(https://github.com/mixpanel/mixpanel-react-native/pull/225)
When JavaScript mode is enabled, Mixpanel utilizes [AsyncStorage](https://reactnative.dev/docs/asyncstorage) to persist data. If you prefer not to use it, or if AsyncStorage is unavailable in your target environment, you can import or define a different storage class. However, it must follow the same interface as [AsyncStorage](https://reactnative.dev/docs/asyncstorage) The following example demonstrates how to use a custom storage solution:

```
const MyAsyncStorage = require("@my-org/<library-path>/AsyncStorage"); // or your own storage class
const trackAutomaticEvents = false;
const useNative = false;
const mixpanel = new Mixpanel('YOUR_TOKEN', trackAutomaticEvents, useNative, MyAsyncStorage);
mixpanel.init();
```

### Fixes
- Make `optOutTracking` and `optInTracking` consistent with the native SDK.(https://github.com/mixpanel/mixpanel-react-native/pull/225)
  
#

## [v3.0.0-beta.1](https://github.com/mixpanel/mixpanel-react-native/tree/v3.0.0-beta.1) (2024-02-29)

### Expo and React Native Web support

This version(PR [\#223](https://github.com/mixpanel/mixpanel-react-native/pull/223)) introduces support for Expo, React Native Web, and any platform using React Native that does not support iOS and Android. To activate this, initialize Mixpanel with an additional parameter `useNative` set to false, which will enable JavaScript mode. Currently in beta, we plan to iterate on this to address any issues and add more features. We welcome your feedback.

```
 const trackAutomaticEvents = false;
 const useNative = false;
 const mixpanel = new Mixpanel(
    "YOUR_MIXPANEL_TOKEN",
    trackAutomaticEvents,
    useNative
  );
 mixpanel.init();
```

To try the Expo sample app, navigate to `Samples/MixpanelExpo`, run `npm install`, and then execute `npm run ios` or `npm run android`

Known limitations and differences compared to the native mode (iOS/Android):

- Automatic Events are currently not supported in this mode. Setting 'trackAutomaticEvents' to 'true' will have no effect.
- Certain Mixpanel Properties are unavailable in Javascript mode, including detailed information about the device and screen.
- The default flush interval is set to 10 seconds. The data will not flush automatically when the app moves to the background. We recommend flushing more frequently for key events.

#

## [v2.4.1](https://github.com/mixpanel/mixpanel-react-native/tree/v2.4.1) (2024-03-01)

### Fixes

- Fix mp_lib(Mixpanel Library) not being set as `react-native`

#

## [v2.4.0](https://github.com/mixpanel/mixpanel-react-native/tree/v2.4.0) (2023-12-02)

### Enhancements

- add api: setFlushBatchSize [\#219](https://github.com/mixpanel/mixpanel-react-native/pull/219)
- RN 73 support for Android with AGP 8 required [\#215](https://github.com/mixpanel/mixpanel-react-native/pull/215)

#

## [v2.3.1](https://github.com/mixpanel/mixpanel-react-native/tree/v2.3.1) (2023-06-20)

### Fixes

- fix typo in the identify function resolve [\#205](https://github.com/mixpanel/mixpanel-react-native/pull/205)

#

## [v2.3.0](https://github.com/mixpanel/mixpanel-react-native/tree/v2.3.0) (2023-06-16)

### Enhancements

- Returning Promise for the identify\(\) to avoid race condition [\#200](https://github.com/mixpanel/mixpanel-react-native/pull/200)

### Fixes

- Fix null reference used for synchronization \(monitor-enter\) [\#199](https://github.com/mixpanel/mixpanel-react-native/pull/199)
- fix initialize was called with 4 arguments but expects 5 arguments [\#198](https://github.com/mixpanel/mixpanel-react-native/pull/198)
- safer handling of super properties [\#197](https://github.com/mixpanel/mixpanel-react-native/pull/197)
- Android resource linking failure fix [\#187](https://github.com/mixpanel/mixpanel-react-native/pull/187)

**Closed issues:**

- Support new React Native new architecture \(TurboModules/Fabric\) [\#145](https://github.com/mixpanel/mixpanel-react-native/issues/145)
- Feature Request: Built in getInstance\(\) or similar instead of custom tooling [\#139](https://github.com/mixpanel/mixpanel-react-native/issues/139)
- \[Feature Request\] Add support for Expo Config Plugins [\#69](https://github.com/mixpanel/mixpanel-react-native/issues/69)

#

## [v2.2.5](https://github.com/mixpanel/mixpanel-react-native/tree/v2.2.5) (2023-04-29)

### Fixes

- Remove semaphores, copy properties, use .merging, don't includeLibInfo in init [\#191](https://github.com/mixpanel/mixpanel-react-native/pull/191)

#

## [v2.2.4](https://github.com/mixpanel/mixpanel-react-native/tree/v2.2.4) (2023-04-25)

### Fixes

- use semaphore to prevent concurrent access to properties object [\#188](https://github.com/mixpanel/mixpanel-react-native/pull/188)

#

## [v2.2.3](https://github.com/mixpanel/mixpanel-react-native/tree/v2.2.3) (2023-04-17)

### Fixes

- Make 'groups' argument optional in trackWithGroups [\#169](https://github.com/mixpanel/mixpanel-react-native/pull/169)

#

## [v2.2.1](https://github.com/mixpanel/mixpanel-react-native/tree/v2.2.1) (2023-03-23)

### Enhancements

- bump iOS version to 4.1.0 [\#180](https://github.com/mixpanel/mixpanel-react-native/pull/180)

## [v2.2.0](https://github.com/mixpanel/mixpanel-react-native/tree/v2.2.0) (2023-03-06)

### NOTE:

- From this version we will prefix randomly generated device-specific distinct_ids with "$device:". The prefix is applied the next time a new random ID is generated, any IDs generated by previous SDK versions and persisted on the device will continue to be used as-is until reset is called to generate a new ID. This does not change the value sent for the $device_id property, which will continue to be the randomly-generated ID without a prefix. Mixpanel's $identify endpoint has been updated to accept UUIDs with this prefix to coordinate with this change.

### Enhancements

- bump ios to 4.0.5 and android to 7.3.0 [\#176](https://github.com/mixpanel/mixpanel-react-native/pull/176)

#

## [v2.1.0](https://github.com/mixpanel/mixpanel-react-native/tree/v2.1.0) (2022-09-14)

### Enhancements

- add serverURL to init params and fix Android module [\#160](https://github.com/mixpanel/mixpanel-react-native/pull/160)

#

## [v2.0.1](https://github.com/mixpanel/mixpanel-react-native/tree/v2.0.1) (2022-09-12)

### Fixes

- update typescript and iOS bridging header [\#158](https://github.com/mixpanel/mixpanel-react-native/pull/158)

#

## [v2.0.0](https://github.com/mixpanel/mixpanel-react-native/tree/v2.0.0) (2022-09-09)

### BREAKING CHANGE:

This major release removes all remaining calls to Mixpanel's `/decide` API endpoint. The main effect of this is that the SDK no longer fetches the remote status of your [project's "Automatically collect common mobile events" setting](https://help.mixpanel.com/hc/en-us/articles/115004596186#enable-or-disable-common-mobile-events). From this version forward, automatic event tracking can only be controlled by the, now required, parameter `trackAutomaticEvents`. Upon upgrading, existing implementations will need to add this parameter to their Mixpanel initializer calls.

### Enhancements

- make trackAutomaticEvents required and bump versions to deprecate Decide [\#153](https://github.com/mixpanel/mixpanel-react-native/pull/153)

#

## [v1.5.0](https://github.com/mixpanel/mixpanel-react-native/tree/v1.5.0) (2022-06-24)

### Enhancements

- bump versions to get millisecond precision for event time property [\#146](https://github.com/mixpanel/mixpanel-react-native/pull/146)

#

## [v1.4.2](https://github.com/mixpanel/mixpanel-react-native/tree/v1.4.2) (2022-05-21)

### Enhancements

- bump versions to remove survey [\#140](https://github.com/mixpanel/mixpanel-react-native/pull/140)

#

## [v1.4.1](https://github.com/mixpanel/mixpanel-react-native/tree/v1.4.1) (2022-05-09)

### Fixes

- bump android version to 6.2.1 [\#138](https://github.com/mixpanel/mixpanel-react-native/pull/138)

#

## [v1.4.0](https://github.com/mixpanel/mixpanel-react-native/tree/v1.4.0) (2022-05-06)

### Enhancements

- Bump to latest ios and android sdk versions and remove android people identify\(deprecated\) [\#137](https://github.com/mixpanel/mixpanel-react-native/pull/137)
- Allow disable flush on background [\#135](https://github.com/mixpanel/mixpanel-react-native/pull/135)
- Adds a new API `getDeviceId` for React Native [\#134](https://github.com/mixpanel/mixpanel-react-native/pull/134)

#

## [v1.3.10](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.10) (2022-03-26)

### Enhancements

- upgrade android targetSdkVersion to 30 [\#131](https://github.com/mixpanel/mixpanel-react-native/pull/131)

#

## [v1.3.9](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.9) (2022-03-02)

**Merged pull requests:**

- bump mixpanel-swift to 3.1.5 [\#129](https://github.com/mixpanel/mixpanel-react-native/pull/129)

#

## [v1.3.8](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.8) (2022-02-25)

### Enhancements

- add init super props & declare multi-prop interfaces [\#127](https://github.com/mixpanel/mixpanel-react-native/pull/127)

#

## [v1.3.7](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.7) (2022-01-26)

### Fixes

- Bump iOS SDK to v3.1.2 [\#125](https://github.com/mixpanel/mixpanel-react-native/pull/125)

#

## [v1.3.6](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.6) (2022-01-13)

### Caution: Please DO NOT use this build! In this version, we have a bug in iOS that event names with `&` or `%` will be rejected by the server. We recommend you update to 1.3.7 or above.

### Fixes

- Fix common mobile events not showing 'react-native' as property value for 'Mixpanel Library' [\#122](https://github.com/mixpanel/mixpanel-react-native/pull/122)

#

## [v1.3.5](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.5) (2022-01-04)

**Merged pull requests:**

- nested dictionary should be a valid type in iOS [\#119](https://github.com/mixpanel/mixpanel-react-native/pull/119)
- fix setGroup array properties [\#118](https://github.com/mixpanel/mixpanel-react-native/pull/118)
- bump SDk dependencies [\#116](https://github.com/mixpanel/mixpanel-react-native/pull/116)
- Fix Expo SDK 44 build error [\#115](https://github.com/mixpanel/mixpanel-react-native/pull/115)

#

## [v1.3.4](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.4) (2021-09-25)

**Merged pull requests:**

- Bump native SDK dependencies [\#102](https://github.com/mixpanel/mixpanel-react-native/pull/102)

#

## [v1.3.3](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.3) (2021-09-21)

### Fixes

- Enable automatic events in iOS [\#99](https://github.com/mixpanel/mixpanel-react-native/pull/99)
- replace JCenter with Maven [\#95](https://github.com/mixpanel/mixpanel-react-native/pull/95)

**Merged pull requests:**

- Bump tmpl from 1.0.4 to 1.0.5 in /Samples/ContextAPIMixpanel [\#100](https://github.com/mixpanel/mixpanel-react-native/pull/100)
- Bump tmpl from 1.0.4 to 1.0.5 [\#98](https://github.com/mixpanel/mixpanel-react-native/pull/98)
- Bump tmpl from 1.0.4 to 1.0.5 in /Samples/MixpanelDemo [\#97](https://github.com/mixpanel/mixpanel-react-native/pull/97)
- Bump path-parse from 1.0.6 to 1.0.7 in /Samples/MixpanelDemo [\#87](https://github.com/mixpanel/mixpanel-react-native/pull/87)
- Bump path-parse from 1.0.6 to 1.0.7 [\#84](https://github.com/mixpanel/mixpanel-react-native/pull/84)
- Bump react-native from 0.64.0 to 0.64.1 in /Samples/MixpanelDemo [\#80](https://github.com/mixpanel/mixpanel-react-native/pull/80)

#

## [v1.3.2](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.2) (2021-08-23)

### Fixes

- Add constructor method type definition [\#85](https://github.com/mixpanel/mixpanel-react-native/pull/85)

#

## [v1.3.1](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.1) (2021-07-29)

### Fixes

- Fix the inconsistency typescript definition of init [\#78](https://github.com/mixpanel/mixpanel-react-native/pull/78)

**Merged pull requests:**

- Add more sample apps for integrating Mixpanel including using Context API [\#79](https://github.com/mixpanel/mixpanel-react-native/pull/79)

#

## [v1.3.0](https://github.com/mixpanel/mixpanel-react-native/tree/v1.3.0) (2021-07-28)

**Merged pull requests:**

- Deprecate the class method init\(\) and improve the example [\#76](https://github.com/mixpanel/mixpanel-react-native/pull/76)

#

## [v1.2.4](https://github.com/mixpanel/mixpanel-react-native/tree/v1.2.4) (2021-06-24)

**Merged pull requests:**

- Polish README [\#67](https://github.com/mixpanel/mixpanel-react-native/pull/67)
- Update README: Improve the quick start guide [\#66](https://github.com/mixpanel/mixpanel-react-native/pull/66)
- Fix Android crash caused by invalid number being set as property value [\#65](https://github.com/mixpanel/mixpanel-react-native/pull/65)
- Bump glob-parent from 5.1.1 to 5.1.2 [\#63](https://github.com/mixpanel/mixpanel-react-native/pull/63)
- Add a CHANGELOG placeholder [\#62](https://github.com/mixpanel/mixpanel-react-native/pull/62)
- Add github workflow for auto release [\#61](https://github.com/mixpanel/mixpanel-react-native/pull/61)

#

## [v1.2.3](https://github.com/mixpanel/mixpanel-react-native/tree/v1.2.3) (2021-05-20)

- Bump Mixpanel Andriod dependency to 5.9.1 (Migrate to Airship 12.x for the integration)
  https://github.com/mixpanel/mixpanel-react-native/pull/59

#

## [v1.2.2](https://github.com/mixpanel/mixpanel-react-native/tree/v1.2.2) (2021-05-08)

- Fix Mixpanel type conversion for ios
  https://github.com/mixpanel/mixpanel-react-native/pull/48
- Fix iOS compile error
  https://github.com/mixpanel/mixpanel-react-native/pull/53

#

## [v1.2.0](https://github.com/mixpanel/mixpanel-react-native/tree/v1.2.0) (2021-05-03)

- Add new settings APIs: setUseIpAddressForGeolocation, setLoggingEnabled(add android), setServerURL(add android)
  https://github.com/mixpanel/mixpanel-react-native/pull/44

#

## [v1.1.1](https://github.com/mixpanel/mixpanel-react-native/tree/v1.1.1) (2021-03-17)

- Fix the issue of passing boolean value as int in iOS
  https://github.com/mixpanel/mixpanel-react-native/pull/34

#

## [v1.1.0](https://github.com/mixpanel/mixpanel-react-native/tree/v1.1.0) (2021-03-03)

- Add Typescript support
- https://github.com/mixpanel/mixpanel-react-native/pull/31. thanks @sroy3 !

#

## [v1.0.2](https://github.com/mixpanel/mixpanel-react-native/tree/v1.0.2) (2021-01-27)

- Fix dynamic type not being able to convert properly in android that causes some group apis to fail
  PR: https://github.com/mixpanel/mixpanel-react-native/pull/23
  This is to address issue: https://github.com/mixpanel/mixpanel-react-native/issues/21

#

## [v1.0.0](https://github.com/mixpanel/mixpanel-react-native/tree/v1.0.0) (2020-12-08)

- This is our first release! :tada::tada::tada:
  Report issues or give us any feedback is appreciated!
- integration guide: https://developer.mixpanel.com/docs/react-native
- full API reference: https://mixpanel.github.io/mixpanel-react-native
























