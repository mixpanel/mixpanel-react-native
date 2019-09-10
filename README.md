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
```js
npm install mixpanel-react-native --save
```
Or using yarn:

Before you start using yarn, if yarn is not installed, you'll first need to install yarn on your system.
```js
yarn add mixpanel-react-native 
```
<a name="linking"></a>
# **Linking (RN < 0.60)**
## **Auto Linking**
If you have been using React-Native version prior to 0.60, then you have to link dependencies using react-native-link for iOS & Android like below.
```js
react-native link mixpanel-react-native
```
Done! mixpanel-react-native with native dependencies will be successfully linked to your iOS/Android project after this command.
## **Manual Linking**
### **iOS**
It is an alternative to auto-linking.
If you have been using React-Native version prior to 0.60, please unlink native dependencies if you have any from a previous install.
And then follow steps which are given in manual linking part of [iOS manual-linking](https://facebook.github.io/react-native/docs/linking-libraries-ios) document.
### **Android**
For manual linking you have to make following changes in respective pages.
#### build.gradle(app level) changes:
Add project implementation in dependencies :-
```js
implementation project(':mixpanel-react-native')
```
#### setting.gradle changes:
Include project in setting.gradle :-
```js
include ':mixpanel-react-native'
project(':mixpanel-react-native').projectDir = new File(rootProject.projectDir, '../node_modules/mixpanel-react-native/android')
```
#### MainApplication.java changes:
Import MixpanelReactNativePackage in your MainApplication file :-
```js
import com.mixpanel.reactnative.MixpanelReactNativePackage;
```
Add package in getPackages method :-
```js
@Override
   protected List<ReactPackage> getPackages() {
     return Arrays.<ReactPackage>asList(
        ...
           new MixpanelReactNativePackage(),
           ...
     );
   }
```
# **Linking (RN >= 0.60)**
For iOS and Android if React-Native version is above 0.60, then there is no need of linking. It will get linked automatically.

# **Installation**
#### iOS (RN < 0.60)
If you're already using Cocoapods, add the following to your Podfile
```js
pod 'MixpanelReactNative', :path => '../node_modules/mixpanel-react-native'
```

Otherwise, setup Podfile according to [react native documentation](https://facebook.github.io/react-native/docs/integration-with-existing-apps), so the Podfile will look like this:
```js
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
#### iOS (RN >= 0.60)
Podfile is already present above 0.60. So we only need to add MixpanelReactNative dependency.
```js
pod 'MixpanelReactNative', :path => '../node_modules/mixpanel-react-native'
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
```js
import Mixpanel from 'mixpanel-react-native';
```
<a name="API"></a>
# **API**
Following methods are from Mixpanel and People class.

|  **Method** | **Ios** | **Android** |
|  ------ | :------: | :------: |
|[init()](#init) | &#9989; |  &#9989; |
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
Note: To call any method from both classes, first you have to call init method from Mixpanel class.
```

<a name="Mixpanel"></a>
# **Mixpanel**
<a name="init"></a>
# **init( mixpanelToken, optOutTrackingDefault)**
To use library first you have to call init. It will initialize all Mixpanel setup. **optOutTrackingDefault** is by default set to false.
### **Example**
```js
import Mixpanel from 'mixpanel-react-native';

const mixpanel = await Mixpanel.init('Your mixpanel token'); // optOutTrackingDefault is false by default

const mixpanelInstance = await Mixpanel.init('Your mixpanel token', true);
```
<a name="hasOptedOutTracking"></a>
# **hasOptedOutTracking()**
To check whether user has opted out from tracking or not.
### **Example**
```js
let hasOptedOut = mixpanel.hasOptedOutTracking();
```
<a name="optInTracking"></a>
# **optInTracking(distinctId, properties)**
To internally track an opt-in event, to opt in an already opted out user from tracking. User updates and track calls will be
     sent to Mixpanel after using this method.
### **Example**
```js
// Opt-in without any parameters
mixpanel.optInTracking();

// Opt-in with a distinctId
mixpanel.optInTracking('1234');

// Opt-in with properties
mixpanel.optInTracking({'Name': 'ABC'});

// Opt-in with distinctId and properties
mixpanel.optInTracking('1234', {'Name': 'ABC'});
```
<a name="optOutTracking"></a>
# **optOutTracking()**
To opt-out user from tracking. So all events and user request will not sent back to the Mixpanel server.
### **Example**
```js
mixpanel.optOutTracking();
```
<a name="track"></a>
# **track(eventName, properties)**
To Track an event with properties.
     Properties are optional and can be added only if needed.
     Properties will allow you to segment your events in your Mixpanel reports.
     If the event is being timed, the timer will stop and added as a property.
### **Example**
```js
// Track with event-name
mixpanel.track('TrackEvent');

//Track with event-name and property
mixpanel.track('TrackEvent', {'Status': 'Pending'})
```
<a name="registerSuperProperties"></a>
# **registerSuperProperties(superProperties)**
To register super properties, once registered, are automatically sent as properties for
     all event tracking calls. 
### **Example**
```js
mixpanel.registerSuperProperties(['Plan': 'Mega','Cost': '2000']);
```
<a name="registerSuperPropertiesOnce"></a>
# **registerSuperPropertiesOnce(superProperties)**
To register super properties without overwriting ones that have already been set.
Property keys must be String objects and the supported value types need to conform to MixpanelType.
### **Example**
```js
mixpanel.registerSuperPropertiesOnce(['Role': 'Admin']);
```
<a name="unregisterSuperProperty"></a>
# **unregisterSuperProperty(superProperty)**
 To remove a previously registered super property.
     As an alternative to clearing all properties, unregistering specific super
     property prevents them from being recorded on future events. This operation
     does not affect the value of other super properties. Any property name that is
     not registered is ignored.
### **Example**
```js
mixpanel.unregisterSuperProperty(['Plan': 'Mega']);
 ```
<a name="getSuperProperties"></a>
# **getSuperProperties()**
To return a json object of the user's current super properties.
### **Example**
```js
mixpanel.getSuperProperties();
```
<a name="clearSuperProperties"></a>
# **clearSuperProperties()**
To erase all currently registered superProperties.
### **Example**
```js
mixpanel.clearSuperProperties();
```
<a name="alias"></a>
# **alias(alias, distinct_id)**
To create a distinctId alias from alias to the current id. It is used to map an identifier called an alias to the existing distinctId of Mixpanel.
### **Example**
```js
mixpanel.alias('Test123','Test456');
```
<a name="reset"></a>
# **reset()**
To clear tweaks and all distinctIds, superProperties, and push registrations from persistent storage.
### **Example**
```js
mixpanel.reset();
```
<a name="flush"></a>
# **flush()**
To send all queued message to server. By default, queued data is flushed to the Mixpanel servers every minute. If you want to force a flush at a particular moment
 you only need to call this method manually. 
### **Example**
```js
mixpanel.flush();
```
<a name="timeEvent"></a>
# **timeEvent(eventName)**
To start a timer, that will be stopped and added as a property when a
     corresponding event is tracked.
     For **Example**, if a developer wants to track an "Image Upload" event
     and he wants to also know how long the upload took, he has to call this method.
### **Example**
```js
mixpanel.timeEvent('Image Upload');
```
<a name="eventElapsedTime"></a>
# **eventElapsedTime(eventName)**
To retrieve the time elapsed for the named event since timeEvent() was called.
### **Example**
```js
mixpanel.eventElapsedTime('Image Upload');
```
<a name="identify"></a>
# **identify(distinctId)**
To identify the user uniquely by providing the user distinctId. After calling track all the events, updates will manipulate the data only for identified user's profile.
     This call does not identify the user for People Analytics, to do that you have to call method.
### **Example**
```js
mixpanel.identify('1234');
```
<a name="isIdentified"></a>
# **isIdentified()**
To check whether profile of user is identified or not.
### **Example**
```js
mixpanel.isIdentified();
```
<a name="Mixpanel.People"></a>
# **Mixpanel.People**
<a name="identify"></a>
# **identify(eventName)**
To identify the user uniquely by providing the user distinct id, so all the events, updates, track call
     will manipulate the data only for identified user's profile.
     This call does not identify the user for People Analytics, to do that you have to call
     method.
### **Example**
```js
mixpanel.people.identify('1234');
```
<a name="set"></a>
# **set(propertyName, to)**
To set properties on an user record.
### **Example**
```js
//Set with parameters property and to
mixpanel.people.set({property: 'Plan', to: 'Premium'});

//Set with parameter property only
mixpanel.people.set({'Name': 'ABC'});
```
<a name="unset"></a>
# **unset(propertyName)**
To remove property permanently with the given name from the user's profile.
### **Example**
```js
mixpanel.people.unset('Plan');
```
<a name="setOnce"></a>
# **setOnce(propertyName, value)**
To set properties on the current user record, but doesn't overwrite if
     there is an existing value. It is particularly useful for collecting
     data about the user's initial experience and source, as well as dates
     representing the first time something happened.
### **Example**
```js
//SetOnce with parameters property and to
mixpanel.people.setOnce({property: 'PaperCount', to: '20'});

//SetOnce with parameter property only
mixpanel.people.setOnce({property: 'PaperCount'});
```
<a name="trackCharge"></a>
# **trackCharge(amount,properties)**
To track money spent by the current user for revenue analytics and associate
     properties with the charge. Properties are optional.
### **Example**
```js
mixpanel.people.trackCharge('500', 'Revenue');
```
<a name="clearCharges"></a>
# **clearCharges()**
To clear the whole transaction history permanently for the identified user profile.
### **Example**
```js
mixpanel.people.clearCharges();
```
<a name="increment"></a>
# **increment(propertyName, by)**
 To increment the given numeric properties by the given values. Property keys must be String names of numeric properties.
### **Example**
```js
mixpanel.people.increment('Salary', '2000');
```
<a name="append"></a>
# **append(propertyName, value)**
To append a value to a list-valued property. Property keys must be String objects and the supported value types need to conform to MixpanelType.
### **Example**
```js
mixpanel.people.append('PointCount', '500');
```
<a name="deleteUser"></a>
# **deleteUser()**
To delete the identified user's record permanently.
### **Example**
```js
mixpanel.people.deleteUser();
```
<a name="remove"></a>
# **remove(propertyName, value)**
 To remove value from a list-valued property only if they are already present in the list.
### **Example**
```js
mixpanel.people.remove('PaperCount','20');
 ```
 <a name="setPushRegistrationId"></a>
# **setPushRegistrationId(deviceToken)**
To register the given device to receive push notifications. This will associate the device token with the current user in people profile,
     which will allow you to send push notifications to the user.
### **Example**
```js
mixpanel.people.setPushRegistrationId('Your deviceToken');
```
<a name="getPushRegistrationId"></a>
# **getPushRegistrationId()**
To retrieve current Firebase Cloud Messaging token.
### **Example**
```js
mixpanel.people.getPushRegistrationId();
```
<a name="clearPushRegistrationId"></a>
# **clearPushRegistrationId(deviceToken)**
 Unregister a specific device token from the ability to receive push notifications. This will remove the provided push token saved to this user profile.
### **Example**
```js
mixpanel.people.clearPushRegistrationId('Your deviceToken');
```
<a name="union"></a>
# **union(propertyName, properties)**
 To add values to a list-valued property only if, they are not already present in the list. If the property does not currently exist, it will be created with the given list as it's value. If the property exists and is not list-valued, the union will be ignored.
### **Example**
```js
 mixpanel.people.union('Days', ['Sunday', 'Monday', 'Tuesday']);
 ```
 
You're done! You've successfully integrated the Mixpanel React-Native library into your app. 

Have any questions? Reach out to [support@mixpanel.com](mailto:support@mixpanel.com) to speak to someone smart, quickly.
