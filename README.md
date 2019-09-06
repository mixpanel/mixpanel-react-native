<div align="center">
  <img src="https://github.com/mixpanel/mixpanel-android/blob/assets/mixpanel.png?raw=true" alt="Mixpanel Android Library" height="150"/>
</div>

# **Table of Contents**
- [Introduction](#introduction)
- [Getting started](#getting started)
- [Linking](#linking)
- [Installation](#installation)
- [Usage](#usage)
- [API](#API)

<a name="introduction"></a>
# **Introduction**

Welcome to the official Mixpanel React-Native library.

The Mixpanel React-Native library is an open source project, and we'd love to see your contributions! 

<a name="getting started"></a>
# **Getting started**
Using npm:

Before you start using npm, if npm is not installed, you'll first need to install npm on your system.

```
npm install mixpanel-react-native --save
```
Using yarn:

Before you start using yarn, if yarn is not installed, you'll first need to install yarn on your system.

```
 $ yarn add mixpanel-react-native 
```
<a name="linking"></a>
# **Linking (RN < 0.60)**

## **Auto Linking**

If you have been using React-Native version prior to 0.60 then you have to link dependencies using react-native-link for iOS & Android like below.
```
$ react-native link mixpanel-react-native
```
Done! mixpanel-react-native with native dependencies will be successfully linked to your iOS/Android project after this command.

## **Manual Linking**

### **iOS**
It is an alternative to react-native-link.
If you have been using React-Native version prior to 0.60, please unlink native dependencies if you have any from a previous install.
And then follow steps which are given
 in manual linking part of [iOS manual-linking](https://facebook.github.io/react-native/docs/linking-libraries-ios) document.

### **Android**
For manual linking you have to make following changes in respective pages.

#### build.gradle(app level) changes:
Add project implementation in dependencies :-
``` 
implementation project(':mixpanel-react-native')
```

#### setting.gradle changes:
Include project in setting.gradle :-
```
include ':mixpanel-react-native'
project(':mixpanel-react-native').projectDir = new File(rootProject.projectDir, '../node_modules/mixpanel-react-native/android')
```
#### MainApplication.java changes:
Import MixpanelReactNativePackage in your MainApplication file :-
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
# **Linking (For latest React-Native application)**
For iOS and Android if React-Native version is above 0.60 then there is no need of linking. It will get linked automatically.

# **Installation**
#### iOS (RN >= 0.60)

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

#### iOS (React-Native >= 0.60)
POD file is already present above 0.60. So we only need to add MixpanelReactNative dependency
```
pod 'MixpanelReactNative', path: '../node_modules/mixpanel-react-native'
```
Next, run ```pod install```.
```
Mandatory: Our library with Swift is only supported in Xcode 9 and later.
In order for the Xcode project to build when you use Swift in the iOS static library you include in the module, your main app project must 
contain Swift code and a bridging header itself. 
If your app project does not contain any Swift code, a workaround can be a single empty .swift file and an empty bridging header.
```
#### Android 
No need of extra installation in Android.

<a name="usage"></a>
# **Usage**
```
import Mixpanel from 'mixpanel-react-native';
```
<a name="API"></a>
# **API**
Following methods are from all classes.

|  **Method** | **Ios** | **Android** |
|  ------ | :------: | :------: |
|[init()](#init()) | &#9989; |  &#9989; |
|[hasOptedOutTracking()](#hasOptedOutTracking) |  &#9989; |  &#9989;|
|[optInTracking()](#optInTracking) |  &#9989; |  &#9989;|
|[optOutTracking()](#optOutTracking) |  &#9989; |  &#9989;|
|[identify()](#identify) |  &#9989; |  &#9989;|
|[track()](#track)|  &#9989; |  &#9989;|
|[registerSuperProperties()](#registerSuperProperties)|  &#9989; |  &#9989;|
|[registerSuperPropertiesOnce()](#registerSuperPropertiesOnce)|  &#9989; |  &#9989;|
|[unregisterSuperProperty()](#unregisterSuperProperty)|  &#9989; |  &#9989;|
|[getSuperProperties()](#getSuperProperties)|  &#9989; |  &#9989;|
|[clearSuperProperties()](#clearSuperProperties)|  &#9989; |  &#9989;|
|[alias()](#alias)|  &#9989; |  &#9989;|
|[reset()](#reset)|  &#9989; |  &#9989;|
|[flush()](#flush)|  &#9989; |  &#9989;|
|[timeEvent()](#timeEvent)|  &#9989; |  &#9989;|
|[eventElapsedTime()](#eventElapsedTime)|  &#9989; |  &#9989;|
|[isIdentified()](#isIdentified)|  &#10060;|  &#9989;|
|[set()](#set)|  &#9989; |  &#9989;|
|[unset()](#unset)|  &#9989; |  &#9989;|
|[setOnce()](#setOnce)|  &#9989; |  &#9989;|
|[trackCharge()](#trackCharge)|  &#9989; |  &#9989;|
|[clearCharges()](#clearCharges)|  &#9989; |  &#9989;|
|[increment()](#increment)|  &#9989; |  &#9989;|
|[append()](#append)|  &#9989; |  &#9989;|
|[deleteUser()](#deleteUser)|  &#9989; |  &#9989;|
|[remove()](#remove)|  &#9989; |  &#9989;|
|[setPushRegistrationId()](#setPushRegistrationId)|  &#9989; |  &#9989;|
|[getPushRegistrationId()](#getPushRegistrationId)|  &#10060; |  &#9989;|
|[clearPushRegistrationId()](#clearPushRegistrationId)|  &#9989; |  &#9989;|
|[union()](#union)|  &#9989; |  &#9989;|

# **All classes**
- [Mixpanel](#Mixpanel)
- [Mixpanel.People](#Mixpanel.People)

```
Note: To call any method from both classes first you have to call init method from Mixpanel class.
```

<a name="Mixpanel"></a>
# **Mixpanel**
# **init()**
To use library first you have to call init. It will initializes all mixpanel setup.

### **Example**
```
import Mixpanel from 'mixpanel-react-native';
const mixpanel = Mixpanel.init(String token);
```

# **hasOptedOutTracking()**
To check user has opted out from tracking or not.

### **Example**
```
mixpanel.hasOptedOutTracking();
```

# **optInTracking()**
To internally track an opt-in event, to opt in an already opted out user from tracking. People updates and track calls will be
     sent to Mixpanel after using this method.

### **Example**
```
mixpanel.optInTracking(String distinctId, JSONObject properties);
```

# **optOutTracking()**
To opt-out user from tracking. So all events and people request will not sent back to the Mixpanel server.

### **Example**
```
mixpanel.optOutTracking();
```

# **track()**
To Track an event with properties.
     Properties are optional and can be added only if needed.
     Properties will allow you to segment your events in your Mixpanel reports.
     If the event is being timed, the timer will stop and be added as a property.

### **Example**
```
mixpanel.track(String eventName, JSONObject properties);
```


# **registerSuperProperties()**
To register super properties, once registered, are automatically sent as properties for
     all event tracking calls. 
    
### **Example**
```
mixpanel.registerSuperProperties(JSONObject properties);
```

# **registerSuperPropertiesOnce()**
To register super properties without overwriting ones that have already been set,
     unless the existing value is equal to defaultValue. DefaultValue is optional.
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
    
### **Example**
```
mixpanel.registerSuperPropertiesOnce(JSONObject superProperties);
```

# **unregisterSuperProperty()**
 To remove a previously registered super property.
     As an alternative to clearing all properties, unregistering specific super
     properties prevents them from being recorded on future events. This operation
     does not affect the value of other super properties. Any property name that is
     not registered is ignored.
 
### **Example**
```
mixpanel.unregisterSuperProperty(String superPropertyName);
 ```
 
# **getSuperProperties()**
To return a json object of the user's current super properties.

### **Example**
```
mixpanel.getSuperProperties();
```

# **clearSuperProperties()**
To erase all currently registered superProperties.

### **Example**
```
mixpanel.clearSuperProperties();
```

# **alias()**
To create a distinct_id alias from alias to original.

### **Example**
```
mixpanel.alias(String alias, String original);
```

# **reset()**
To clear tweaks and all distinct_ids, superProperties, and push registrations from persistent storage.

### **Example**
```
mixpanel.reset();
```
# **flush()**
To send all queued message to server. By default, queued data is flushed to the Mixpanel servers every minute. You only need to call this
     method manually if you want to force a flush at a particular moment.

### **Example**
```
mixpanel.flush();
```

# **timeEvent()**
To start a timer that will be stopped and added as a property when a
     corresponding event is tracked.
     For **Example**, if a developer wants to track an "Image Upload" event
     and he want to also know how long the upload took. Calling this method
     before the upload code would implicitly cause the track
     call to record its duration.

### **Example**
```
mixpanel.timeEvent(String eventName);
ex. mixpanel.timeEvent(event: "Image Upload");
```

# **eventElapsedTime()**
To retrieve the time elapsed for the named event since timeEvent() was called.

### **Example**
```
mixpanel.eventElapsedTime(String eventName);
```

# **identify()**
To identify the user uniquely by providing the user distinct id. After calling track all the events, updates will manipulate the data only for identified users profile.
     This call does not identify the user for People Analytics, to do that you have to call
     method.

### **Example**
```
mixpanel.identify(String distinctId);
```

# **isIdentified()**
To check profile of people is identified or not.

### **Example**
```
mixpanel.isIdentified();
```

<a name="Mixpanel.People"></a>
# **Mixpanel.People**

# **identify()**
To identify the user uniquely by providing the user distinct id, so all the event, update ,track call
     will manipulate the data only for identified users profile.
     This call does not identify the user for People Analytics to do that you have to call
     method.

### **Example**
```
mixpanel.people.identify(String distinctId);
```

# **set()**
To set a collection of properties on the identified user

### **Example**
```
mixpanel.people.set(JSONObject properties, to);
Ex.mixpanel.people.set(property: "Plan",to: "Premium");
```

# **unset()**
To remove property permanently with the given name from the user's profile.

### **Example**
```
mixpanel.people.unset(String propertyName);
```

# **setOnce()**
To set properties on the current user in Mixpanel People, but doesn't overwrite if
     there is an existing value. It is particularly useful for collecting
     data about the user's initial experience and source, as well as dates
     representing the first time something happened.
### **Example**
```
mixpanel.people.setOnce(String propertyName, Object value);
```

# **trackCharge()**
To track money spent by the current user for revenue analytics and associate
     properties with the charge. Properties is optional.
### **Example**
```
mixpanel.people.trackCharge(double amount,JSONObject properties);
```

# **clearCharges()**
To clear the whole transaction history permanently for the identified people profile.

### **Example**
```
mixpanel.people.clearCharges();
```

# **increment()**
 To increment the given numeric properties by the given values.Property keys must be String names of numeric properties.
### **Example**
```
mixpanel.people.increment(String propertyName, double increment);
```

# **append()**
To append a value to a list-valued property. Property keys must be String objects and the supported value types need to conform to MixpanelType.

### **Example**
```
mixpanel.people.append(String propertyName, Object value);
```

# **deleteUser()**
To delete permanently the identified user's record.

### **Example**
```
mixpanel.people.deleteUser();
```

# **remove()**
 To remove value from a list-valued property only if they are already present in the list.
 
### **Example**
```
 mixpanel.people.remove(String propertyName, Object value);
 ```
 
# **setPushRegistrationId()**
To register the given device to receive push notifications. This will associate the device token with the current user in people profile,
     which will allows you to send push notifications to the user.

### **Example**
```
mixpanel.people.setPushRegistrationId(String deviceToken);
```

# **getPushRegistrationId()**
To retrieve current Firebase Cloud Messaging token.

### **Example**
```
mixpanel.people.getPushRegistrationId();
```

# **clearPushRegistrationId()**
 To clear all current Firebase Cloud Messaging tokens manually from Mixpanel.

### **Example**
```
mixpanel.people.clearPushRegistrationId(String deviceToken);
```

# **union()**
 Union list properties. Property values must be array objects.
 
### **Example**
```
 mixpanel.people.union(String properties, JSONArray value);
 ```

You're done! You've successfully integrated the Mixpanel React-Native library into your app. 

Have any questions? Reach out to [support@mixpanel.com](mailto:support@mixpanel.com) to speak to someone smart, quickly.

