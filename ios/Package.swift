// swift-tools-version: 5.9
//
// Swift Package Manager manifest for React Native's SPM autolinking (RN 0.88+).
//
// React Native's autolinker references this package through a symlink at
// <app>/ios/build/generated/autolinking/libs/MixpanelReactNative and resolves the
// relative React paths below against that location, so this manifest only
// resolves inside an app that has run `npx react-native spm`. CocoaPods users
// keep using MixpanelReactNative.podspec.
//
// SwiftPM cannot compile Swift and Objective-C in one target, so the native
// module is split in two: the Swift implementation, and the Objective-C file
// that registers it with React Native via RCT_EXTERN_MODULE.

import PackageDescription

let reactNativeProducts: [Target.Dependency] = [
    .product(name: "ReactHeaders", package: "ReactNative"),
    .product(name: "ReactNativeHeaders", package: "ReactNative"),
    .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
    .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
]

let package = Package(
    name: "MixpanelReactNative",
    platforms: [.iOS("15.0")],
    products: [
        .library(
            name: "MixpanelReactNative",
            targets: ["MixpanelReactNative", "MixpanelReactNativeSwift"]
        ),
    ],
    dependencies: [
        // Keep in step with the Mixpanel-swift version in MixpanelReactNative.podspec.
        .package(url: "https://github.com/mixpanel/mixpanel-swift.git", exact: "7.0.0"),
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        .target(
            name: "MixpanelReactNativeSwift",
            dependencies: [
                .product(name: "Mixpanel", package: "mixpanel-swift"),
            ] + reactNativeProducts,
            path: "Sources/MixpanelReactNativeSwift",
            exclude: ["MixpanelReactNative-Bridging-Header.h"]
        ),
        .target(
            name: "MixpanelReactNative",
            dependencies: ["MixpanelReactNativeSwift"] + reactNativeProducts,
            path: "Sources/MixpanelReactNative",
            // This target has no public headers, but SwiftPM requires an Objective-C
            // target's public headers folder to exist, and it defaults to include/. An empty
            // include/ wouldn't survive git or npm, so point it at the target's own folder,
            // which holds only the .m file and so exports nothing.
            publicHeadersPath: "."
        ),
    ]
)
