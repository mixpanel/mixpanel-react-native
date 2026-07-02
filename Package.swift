// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MixpanelReactNative",
    platforms: [
        .iOS(.v12)
    ],
    products: [
        .library(
            name: "MixpanelReactNative",
            targets: ["MixpanelReactNative"]
        )
    ],
    dependencies: [
        .package(
            url: "https://github.com/mixpanel/mixpanel-swift.git",
            from: "6.4.1"
        )
    ],
    targets: [
        .target(
            name: "MixpanelReactNative",
            dependencies: [
                .product(name: "Mixpanel", package: "mixpanel-swift")
            ],
            path: "ios",
            exclude: [
                "MixpanelReactNative.xcodeproj",
                ".DS_Store"
            ],
            sources: [
                "MixpanelReactNative.swift",
                "MixpanelReactNative.m",
                "Constants.swift",
                "AutomaticProperties.swift",
                "MixpanelTypeHandler.swift"
            ],
            publicHeadersPath: ".",
            cSettings: [
                .headerSearchPath(".")
            ]
        )
    ],
    cLanguageStandard: .c11,
    cxxLanguageStandard: .cxx14
)
