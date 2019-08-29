<p align="center">
 <img width="460" height="300" src="https://github.com/mixpanel/mixpanel-android/blob/assets/mixpanel.png?raw=true">
</p>

# **Table of Contents**
- [Introduction](#introduction)
- [Getting started](#getting started)
- [Installation](#installation)
- [Usage](#usage)
- [ API](#API)

<a name="introduction"></a>
# **Introduction**

Welcome to the official Mixpanel React-Native Library 


The Mixpanel React-Native library for iOS and Android is an open source project, and we'd love to see your contributions! 

<a name="getting started"></a>
# **Getting started**
```
 $ npm install mixpanel-react-native --save 
```
<a name="installation"></a>
# **Installation**
```
$ react-native link mixpanel-react-native
```

#### iOS 

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


#### Android

Android does not need additional setup, installing the package and linking will take care rest of the setup.

<a name="usage"></a>
# **Usage**
```
import Mixpanel from 'mixpanel-react-native';
```
<a name="API"></a>
# **API**
|  **Method** | **Ios** | **Android** |
|  ------ | :------: | :------: |
| initialize() | &#9989; |  &#9989; |
|hasOptedOutTracking() |  &#9989; |  &#9989;|
|optInTracking() |  &#9989; |  &#9989;|
|optOutTracking() |  &#9989; |  &#9989;|
|identify() |  &#9989; |  &#9989;|
|getDistinctId()|  &#10060;|  &#9989;|
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
|clearTimedEvents()|  &#9989; |  &#10060;|
|eventElapsedTime()|  &#9989; |  &#9989;|
|isIdentified()|  &#10060;|  &#9989;|
|set()|  &#9989; |  &#9989;|
|setPropertyTo()|  &#9989; |  &#9989;|
|unset()|  &#9989; |  &#9989;|
|setOnce()|  &#9989; |  &#9989;|
|trackCharge()|  &#9989; |  &#9989;|
|clearCharges()|  &#9989; |  &#9989;|
|incrementPropertyBy()|  &#9989; |  &#9989;|
|increment()|  &#9989; |  &#9989;|
|append()|  &#9989; |  &#9989;|
|deleteUser()|  &#9989; |  &#9989;|
|merge()|  &#10060;|  &#9989;|
|remove()|  &#9989; |  &#9989;|
|setPushRegistrationId()|  &#9989; |  &#9989;|
|getPushRegistrationId()|  &#10060; |  &#9989;|
|clearPushRegistrationId()|  &#9989; |  &#9989;|
|clearAllPushRegistrationId()|  &#9989; |  &#9989;|
|union()|  &#9989; |  &#9989;|

# **initialize()**
To start tracking with library you must first initialize with your project token
### **Example**
```
Mixpanel.initialize();
```

# **hasOptedOutTracking()**
To check user has opted out from tracking or not.

### **Example**
```
Mixpanel.hasOptedOutTracking();
```

# **optInTracking()**
Used to internally track an opt-in event, to opt in an already opted out user from tracking. People updates and track calls will be
     sent to Mixpanel after using this method.

### **Example**
```
Mixpanel.optInTracking();
```

# **optOutTracking()**
User get opted out from tracking. So all events and people request will not sent back to the Mixpanel server.

### **Example**
```
Mixpanel.optOutTracking();
```

# **identify()**
Identify the user uniquely by providing the user distinct id, so all the event, update ,track call
     will manipulate the data only for identified users profile.
     This call does not identify the user for People Analytics to do that you have to call
     method.

### **Example**

```
Mixpanel.identify();
```

# **getDistinctId()**
Returns Id to identify User uniquely.

### **Example**
```
Mixpanel.getDistinctId()
```

# **track()**
Use to Track an event with properties.
     Properties are optional and can be added only if needed.
     Properties will allow you to segment your events in your Mixpanel reports.
     If the event is being timed, the timer will stop and be added as a property.

### **Example**
```
Mixpanel.track();
```

# **registerSuperProperties()**
Super properties, once registered, are automatically sent as properties for
     all event tracking calls. 
    
### **Example**
```
Mixpanel.registerSuperProperties();
```

# **registerSuperPropertiesOnce()**
Registers super properties without overwriting ones that have already been set,
     unless the existing value is equal to defaultValue. defaultValue is optional.
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
    
### **Example**
```
Mixpanel.registerSuperPropertiesOnce();
```

# **unregisterSuperProperty()**
 Removes a previously registered super property.
     As an alternative to clearing all properties, unregistering specific super
     properties prevents them from being recorded on future events. This operation
     does not affect the value of other super properties. Any property name that is
     not registered is ignored.
 
### **Example**
```
 Mixpanel.unregisterSuperProperty();
 ```
 
# **getSuperProperties()**
Returns a json object of the user's current super properties.

### **Example**
```
Mixpanel.getSuperProperties();
```

# **clearSuperProperties()**
Erase all currently registered superProperties.

### **Example**
```
Mixpanel.clearSuperProperties();
```

# **alias()**
This function creates a distinct_id alias from alias to original.

### **Example**
```
Mixpanel.alias();
```

# **reset()**
Clears tweaks and all distinct_ids, superProperties, and push registrations from persistent storage.

### **Example**
```
Mixpanel.reset();
```
# **flush()**
Send all queued message to server. By default, queued data is flushed to the Mixpanel servers every minute (the
     default for flushInterval), and on background (since
     flushOnBackground is on by default). You only need to call this
     method manually if you want to force a flush at a particular moment.

### **Example**
```
Mixpanel.flush();
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
Mixpanel.timeEvent();
```

# **clearTimedEvents()**
Clears all current event timers.

### **Example**
```
Mixpanel.clearTimedEvents();
```

# **eventElapsedTime()**
Retrieves the time elapsed for the named event since timeEvent() was called.

### **Example**
```
Mixpanel.eventElapsedTime();
```

# **isIdentified()**
Checks profile of people is identified or not.

### **Example**
```
Mixpanel.isIdentified();
```

# **set()**
Set a collection of properties on the identified user

### **Example**
```
Mixpanel.set();
```

# **setPropertyTo()**
Sets a single property with the given name and value for this user.

### **Example**
```
Mixpanel.setPropertyTo();
```

# **unset()**
Permanently removes the property with the given name from the user's profile.

### **Example**
```
Mixpanel.unset();
```

# **setOnce()**
Set properties on the current user in Mixpanel People, but doesn't overwrite if
     there is an existing value. It is particularly useful for collecting
     data about the user's initial experience and source, as well as dates
     representing the first time something happened.
### **Example**
```
Mixpanel.setOnce();
```

# **trackCharge()**
Track money spent by the current user for revenue analytics and associate
     properties with the charge. Properties is optional.
### **Example**
```
Mixpanel.trackCharge();
```

# **clearCharges()**
It will permanently clear the whole transaction history for the identified people profile.

### **Example**
```
Mixpanel.clearCharges();
```

# **incrementPropertyBy()**
Add the given amount to an existing property on the identified user.

### **Example**
```
Mixpanel.incrementPropertyBy();
```

# **increment()**
  Increment the given numeric properties by the given values.Property keys must be String names of numeric properties.
### **Example**
```
Mixpanel.increment();
```

# **append()**
Appends a value to a list-valued property. Property keys must be String objects and the supported value types need to conform to MixpanelType.

### **Example**
```
Mixpanel.append();
```

# **deleteUser()**
Permanently deletes the identified user's record.

### **Example**
```
Mixpanel.deleteUser();
```

# **merge()**
 Merge a given JSONObject into the object-valued property named name.
 
### **Example**
```
Mixpanel.merge();
 ```
 
# **remove()**
 Remove value from a list-valued property only if they are already present in the list.
 
### **Example**
```
 Mixpanel.remove();
 ```
 
# **setPushRegistrationId()**
Register the given device to receive push notifications. This will associate the device token with the current user in Mixpanel People,
     which will allows you to send push notifications to the user from the Mixpanel
     People web interface.

### **Example**
```
Mixpanel.setPushRegistrationId();
```

# **getPushRegistrationId()**
Retrieves current Firebase Cloud Messaging token.

### **Example**
```
Mixpanel.getPushRegistrationId();
```

# **clearPushRegistrationId()**
Manually clears all current Firebase Cloud Messaging tokens from Mixpanel. This will associate the device token with the current user in Mixpanel People,
     which will allow you to send push notifications to the user from the Mixpanel
     People web interface.

### **Example**
```
Mixpanel.clearPushRegistrationId();
```

# **clearAllPushRegistrationId()**
   Unregister the given device to receive push notifications.
     This will unset all of the push tokens saved to this people profile. This is useful
     in conjunction with a call to reset, or when a user is logging out.
### **Example**
```
Mixpanel.clearAllPushRegistrationId();
```

# **union()**
 Union list properties. Property values must be array objects.
 
### **Example**
```
 Mixpanel.union();
 ```




You're done! You've successfully integrated the Mixpanel React-Native SDK into your app. 

Have any questions? Reach out to [support@mixpanel.com](mailto:support@mixpanel.com) to speak to someone smart, quickly.