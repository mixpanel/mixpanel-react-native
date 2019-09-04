<div align="center">
  <img src="https://github.com/mixpanel/mixpanel-android/blob/assets/mixpanel.png?raw=true" alt="Mixpanel Android Library" height="150"/>
</div>

# **Table of Contents**
- [Introduction](#introduction)
- [Getting started](#getting started)
- [linking](#linking)
- [Installation](#installation)
- [Usage](#usage)
- [API](#API)

<a name="introduction"></a>
# **Introduction**

Welcome to the official Mixpanel React-Native Library.

The Mixpanel React-Native library for iOS and Android is an open source project, and we'd love to see your contributions! 

<a name="getting started"></a>
# **Getting started**
Before you start using Yarn, you'll first need to install yarn on your system.

```
 $ yarn add mixpanel-react-native 
```
<a name="linking"></a>
# **linking(below 0.60) for iOS & Android**
```
$ react-native link mixpanel-react-native
```
Done! mixpanel-react-native with native dependencies will be successfully linked to your iOS/Android project after this command.

# **ios**

## **Manual Linking (below 0.60)**
If you have been using React Native before version 0.60, please unlink native dependencies if you have any from a previous install.
1.Library has an .xcodeproj file inside its folder. 
Drag this file to your project on Xcode (usually under the Libraries group on Xcode);

2.Click on your main project file (the one that represents the .xcodeproj) select Build Phases and drag the static library from the Products folder inside the Library you are importing to Link Binary With Libraries

## ** Linking (above 0.60)**
Autolinking is a replacement for react-native link. No need of any extra settings for linking.

# **Android**

## **Manual Linking (below 0.60)**
### build.gradle(app level) changes:
Add project implementation in dependencies :-
``` 
implementation project(':mixpanel-react-native')
```

### setting.gradle changes:
Include project in setting.gradle :-
```
include ':mixpanel-react-native'
project(':mixpanel-react-native').projectDir = new File(rootProject.projectDir, '../node_modules/mixpanel-react-native/android')
```
### MainApplication.java changes:
import MixpanelReactNativePackage in your MainApplication file :-
```
import com.mixpanel.reactnative.MixpanelReactNativePackage;
```
Add package in getPackages method :-
```
@Override
   protected List<ReactPackage> getPackages() {
     return Arrays.<ReactPackage>asList(
        ...
           new MixpanelReactNativePackage(),
           ...
     );
   }
```
# **installation**
#### iOS (below 0.60)

If you're already using Cocoapods, add the following to your Podfile
```
pod 'MixpanelReactNative', path: '../node_modules/mixpanel-react-native'
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

    pod 'MixpanelReactNative', path: '../node_modules/mixpanel-react-native'

end
```

Remember to replace *YourTargetName* with your actual target name.

Next, run ```pod install```.

#### iOS (above 0.60)
POD files are already present above 0.60. So we only need to add MixpanelReactNative dependency
```
pod 'MixpanelReactNative', path: '../node_modules/mixpanel-react-native'
```
Next, run ```pod install```.
<a name="usage"></a>
# **Usage**
```
import Mixpanel from 'mixpanel-react-native';
```
<a name="API"></a>
# **API**
|  **Method** | **Ios** | **Android** |
|  ------ | :------: | :------: |
| init() | &#9989; |  &#9989; |
|hasOptedOutTracking() |  &#9989; |  &#9989;|
|optInTracking() |  &#9989; |  &#9989;|
|optOutTracking() |  &#9989; |  &#9989;|
|identify() |  &#9989; |  &#9989;|
|track()|  &#9989; |  &#9989;|
|registerSuperProperties()|  &#9989; |  &#9989;|
|registerSuperPropertiesOnce()|  &#9989; |  &#9989;|
|unregisterSuperProperty()|  &#9989; |  &#9989;|
|getSuperProperties()|  &#9989; |  &#9989;|
|clearSuperProperties|  &#9989; |  &#9989;|
|alias()|  &#9989; |  &#9989;|
|reset()|  &#9989; |  &#9989;|
|flush()|  &#9989; |  &#9989;|
|timeEvent()|  &#9989; |  &#9989;|
|eventElapsedTime()|  &#9989; |  &#9989;|
|isIdentified()|  &#10060;|  &#9989;|
|set()|  &#9989; |  &#9989;|
|unset()|  &#9989; |  &#9989;|
|setOnce()|  &#9989; |  &#9989;|
|trackCharge()|  &#9989; |  &#9989;|
|clearCharges()|  &#9989; |  &#9989;|
|increment()|  &#9989; |  &#9989;|
|append()|  &#9989; |  &#9989;|
|deleteUser()|  &#9989; |  &#9989;|
|remove()|  &#9989; |  &#9989;|
|setPushRegistrationId()|  &#9989; |  &#9989;|
|getPushRegistrationId()|  &#10060; |  &#9989;|
|clearPushRegistrationId()|  &#9989; |  &#9989;|
|union()|  &#9989; |  &#9989;|

# **init()**
To use library we have to call first init. It will initializes all mixpanel setup.

### **Example**
```
import Mixpanel from "mixpanel-react-native";
const mixpanel = await Mixpanel.init(String distinctId);
```

# **hasOptedOutTracking()**
To check user has opted out from tracking or not.

### **Example**
```
mixpanel.hasOptedOutTracking();
```

# **optInTracking()**
Used to internally track an opt-in event, to opt in an already opted out user from tracking. People updates and track calls will be
     sent to Mixpanel after using this method.

### **Example**
```
mixpanel.optInTracking(String distinctId, JSONObject properties);
```

# **optOutTracking()**
User get opted out from tracking. So all events and people request will not sent back to the Mixpanel server.

### **Example**
```
mixpanel.optOutTracking();
```

# **identify()**
Identify the user uniquely by providing the user distinct id, so all the event, update ,track call
     will manipulate the data only for identified users profile.
     This call does not identify the user for People Analytics to do that you have to call
     method.

### **Example**
```
mixpanel.people.identify(String distinct_id);
```

# **track()**
Use to Track an event with properties.
     Properties are optional and can be added only if needed.
     Properties will allow you to segment your events in your Mixpanel reports.
     If the event is being timed, the timer will stop and be added as a property.

### **Example**
```
mixpanel.track(String event_name, JSONObject properties);
```

# **registerSuperProperties()**
Super properties, once registered, are automatically sent as properties for
     all event tracking calls. 
    
### **Example**
```
mixpanel.registerSuperProperties(JSONObject properties);
```

# **registerSuperPropertiesOnce()**
Registers super properties without overwriting ones that have already been set,
     unless the existing value is equal to defaultValue. defaultValue is optional.
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
    
### **Example**
```
mixpanel.registerSuperPropertiesOnce(JSONObject superProperties);
```

# **unregisterSuperProperty()**
 Removes a previously registered super property.
     As an alternative to clearing all properties, unregistering specific super
     properties prevents them from being recorded on future events. This operation
     does not affect the value of other super properties. Any property name that is
     not registered is ignored.
 
### **Example**
```
mixpanel.unregisterSuperProperty(String superPropertyName);
 ```
 
# **getSuperProperties()**
Returns a json object of the user's current super properties.

### **Example**
```
mixpanel.getSuperProperties();
```

# **clearSuperProperties()**
Erase all currently registered superProperties.

### **Example**
```
mixpanel.clearSuperProperties();
```

# **alias()**
This function creates a distinct_id alias from alias to original.

### **Example**
```
mixpanel.alias(String alias, String original);
```

# **reset()**
Clears tweaks and all distinct_ids, superProperties, and push registrations from persistent storage.

### **Example**
```
mixpanel.reset();
```
# **flush()**
Send all queued message to server. By default, queued data is flushed to the Mixpanel servers every minute (the
     default for flushInterval), and on background (since
     flushOnBackground is on by default). You only need to call this
     method manually if you want to force a flush at a particular moment.

### **Example**
```
mixpanel.flush();
```

# **timeEvent()**
Starts a timer that will be stopped and added as a property when a
     corresponding event is tracked.
     For **Example**, if a developer were to track an "Image Upload" event
     she might want to also know how long the upload took. Calling this method
     before the upload code would implicitly cause the track
     call to record its duration.

### **Example**
```
mixpanel.timeEvent(String event_name);
ex. mixpanel.timeEvent(event: "Image Upload");
```

# **eventElapsedTime()**
Retrieves the time elapsed for the named event since timeEvent() was called.

### **Example**
```
mixpanel.eventElapsedTime();
```

# **isIdentified()**
Checks profile of people is identified or not.

### **Example**
```
mixpanel.isIdentified();
```

# **set()**
Set a collection of properties on the identified user

### **Example**
```
mixpanel.set(JSONObject Properties, to);
Ex.mixpanel.people.set(property: "Plan",to: "Premium");
```

# **unset()**
Permanently removes the property with the given name from the user's profile.

### **Example**
```
mixpanel.people.unset(String name);
```

# **setOnce()**
Set properties on the current user in Mixpanel People, but doesn't overwrite if
     there is an existing value. It is particularly useful for collecting
     data about the user's initial experience and source, as well as dates
     representing the first time something happened.
### **Example**
```
mixpanel.people.setOnce(String propertyName, Object value);
```

# **trackCharge(double amount,JSONObject properties)**
Track money spent by the current user for revenue analytics and associate
     properties with the charge. Properties is optional.
### **Example**
```
mixpanel.people.trackCharge();
```

# **clearCharges()**
It will permanently clear the whole transaction history for the identified people profile.

### **Example**
```
mixpanel.people.clearCharges();
```

# **increment()**
  Increment the given numeric properties by the given values.Property keys must be String names of numeric properties.
### **Example**
```
mixpanel.people.increment(String name, double increment);
```

# **append()**
Appends a value to a list-valued property. Property keys must be String objects and the supported value types need to conform to MixpanelType.

### **Example**
```
mixpanel.people.append(String name, Object value);
```

# **deleteUser()**
Permanently deletes the identified user's record.

### **Example**
```
mixpanel.people.deleteUser();
```

# **remove()**
 Remove value from a list-valued property only if they are already present in the list.
 
### **Example**
```
 mixpanel.people.remove(String name, Object value);
 ```
 
# **setPushRegistrationId()**
Register the given device to receive push notifications. This will associate the device token with the current user in Mixpanel People,
     which will allows you to send push notifications to the user from the Mixpanel
     People web interface.

### **Example**
```
mixpanel.people.setPushRegistrationId(String token);
```

# **getPushRegistrationId()**
Retrieves current Firebase Cloud Messaging token.

### **Example**
```
mixpanel.people.getPushRegistrationId();
```

# **clearPushRegistrationId()**
Manually clears all current Firebase Cloud Messaging tokens from Mixpanel. This will associate the device token with the current user in Mixpanel People,
     which will allow you to send push notifications to the user from the Mixpanel
     People web interface.

### **Example**
```
mixpanel.people.clearPushRegistrationId();
```

# **union()**
 Union list properties. Property values must be array objects.
 
### **Example**
```
 mixpanel.people.union(String name, JSONArray value);
 ```

You're done! You've successfully integrated the Mixpanel React-Native SDK into your app. 

Have any questions? Reach out to [support@mixpanel.com](mailto:support@mixpanel.com) to speak to someone smart, quickly.
