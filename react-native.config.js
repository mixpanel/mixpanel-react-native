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
          project: './node_modules/mixpanel-react-native/ios/MixpanelReactNative.xcodeproj',
        }
      }
    }
  }
};
