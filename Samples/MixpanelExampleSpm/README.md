# MixpanelExampleSpm

The same screen as `MixpanelExample`, on React Native 0.88 with the iOS app linked through
**Swift Package Manager** instead of CocoaPods. It depends on the library in this repo
(`"mixpanel-react-native": "file:../.."`), so it exercises the package's `ios/Package.swift`.

## Run

```sh
npm install

# iOS: resolve the Swift packages (the SwiftPM equivalent of `pod install`).
# Run once after a fresh clone, and again after changing native dependencies.
npm run spm
npm run ios

# Android is unchanged from a regular React Native app.
npm run android
```

`ios/Podfile` is a placeholder: the React Native CLI only recognizes an iOS project that has
one. Do not run `pod install` here.

React Native's SwiftPM support is experimental; see the
[React Native 0.88 release notes](https://reactnative.dev/blog/2026/10/19/react-native-0.88#experimental-swift-package-manager-support).
