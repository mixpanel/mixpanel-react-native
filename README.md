#  @tapsensetech/mixpanel-react-native

## Getting started

`$ npm install  @tapsensetech/mixpanel-react-native --save`

### Installation

`$ react-native link  @tapsensetech/mixpanel-react-native`

#### iOS 

If you're already using Cocoapods, add the following to your Podfile
```
pod 'MixpanelReactNative', path: '../node_modules/@tapsensetech/mixpanel-react-native'
```

Otherwise, setup Podfile according to [react native documentation](https://facebook.github.io/react-native/docs/integration-with-existing-apps), so the Podfile will look like this:
```
source 'https://github.com/CocoaPods/Specs.git'

target 'YourTargetName' do
    pod 'React', :path => '../node_modules/react-native', :subspecs => [
        'Core',
        'CxxBridge', # Include this for RN >= 0.47
        'DevSupport', # Include this to enable In-App Devmenu if RN >= 0.43
        'RCTText',
        'RCTNetwork',
        'RCTWebSocket', # Needed for debugging
        'RCTAnimation', # Needed for FlatList and animations running on native UI thread
        ]
    # Explicitly include Yoga if you are using RN >= 0.42.0
    pod 'yoga', :path => '../node_modules/react-native/ReactCommon/yoga'
    pod 'DoubleConversion', :podspec => '../node_modules/react-native/third-party-podspecs/DoubleConversion.podspec'
    pod 'glog', :podspec => '../node_modules/react-native/third-party-podspecs/glog.podspec'
    pod 'Folly', :podspec => '../node_modules/react-native/third-party-podspecs/Folly.podspec'

    pod 'MixpanelReactNative', path: '../node_modules/@tapsensetech/mixpanel-react-native'

end
```

Remember to replace *YourTargetName* with your actual target name.

Next, run ```pod install```.


#### Android

Android does not need additional setup, installing the package and linking will take care rest of the setup.


## Usage
```javascript
import mixpanel from ' @tapsensetech/mixpanel-react-native';

// TODO: What to do with the module?
MixpanelReactNative;
```
