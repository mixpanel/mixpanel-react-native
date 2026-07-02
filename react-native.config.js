'use strict';

module.exports = {
  dependencies: {
    'mixpanel-react-native': {
      platforms: {
        android: {
          "sourceDir": "./node_modules/mixpanel-react-native/android",
          "folder": "./node_modules/mixpanel-react-native",
          "packageImportPath": "import com.mixpanel.reactnative.MixpanelReactNativePackage;",
          "packageInstance": "new MixpanelReactNativePackage()"
        },
        ios: {
          // CocoaPods support (backward compatibility for React Native < 0.84)
          project: './node_modules/mixpanel-react-native/ios/MixpanelReactNative.xcodeproj',
          // Swift Package Manager support (React Native 0.84+)
          spm: {
            package: './node_modules/mixpanel-react-native',
            products: ['MixpanelReactNative']
          }
        }
      }
    }
  }
};
