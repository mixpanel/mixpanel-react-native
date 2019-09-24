<div align="center" style="text-align: center">
  <img src="https://github.com/mixpanel/mixpanel-android/blob/assets/mixpanel.png?raw=true" alt="Mixpanel Android Library" height="150"/>
</div>

# Table of Contents
- [Introduction](#introduction)
- [Prerequisites for iOS](#Prerequisites for iOS)
- [Installation](#installation)
- [Linking](#linking)
- [Usage](#usage)
- [API](#API)

<a name="introduction"></a>
# Introduction
Welcome to the official Mixpanel React-Native library.

The Mixpanel React-Native library is an open source project, and we'd love to see your contributions! 

<a name="Prerequisites for iOS"></a>
## Prerequisites for iOS

1. iOS module must have a Podfile. In case Podfile is not present, set up it according to [react native documentation](https://facebook.github.io/react-native/docs/integration-with-existing-apps), so the Podfile will look like this:
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

end
```
**Note:** Remember to replace *YourTargetName* with your actual target name.

2. Our library with Swift is only supported in Xcode 9 and later.
In order for the Xcode project to build when you use Swift in the iOS static library you include in the module, your main app project must 
contain Swift code and a bridging header itself. 
If your app project does not contain any Swift code, a workaround can be a single empty .swift file and an empty bridging header.

<a name="installation"></a>
# Installation
Before you start installation using yarn, if yarn is not installed, you'll first need to install yarn on your system.
```js
yarn add mixpanel-react-native 
```

<a name="linking"></a>
# Linking
Following steps are necessary to link mixpanel-react-native native dependencies to your application.
### RN >= 0.60
For iOS and Android, if React-Native version is 0.60 or above, then there is no need of linking. It will get linked automatically.
However, iOS module must run:`pod install`

### RN < 0.60
Applications using React-Native version prior to 0.60 need to run following command to link mixpanel-react-native with native dependencies: 
```js
react-native link mixpanel-react-native
```

#### iOS
iOS module needs to perform additional steps to integrate the SDK:
1. Run pod install under your application's iOS folder.
2. Drag and drop mixpanel-react-native's Xcode project from node_modules/mixpanel-react-native/ios folder under your Xcode application's "Libraries" group.
3. Click on your main project file (the one that represents the .xcodeproj) select Build Phases and add libMixpanelReactNative.a to
Link Binary With Libraries.

<a name="usage"></a>
# Usage
```js
//import our library in app
import Mixpanel from 'mixpanel-react-native';

//create an instance
const mixpanel = await Mixpanel.init('Your mixpanel token');

//Track on instance with only event-name
mixpanel.track('TrackEvent');

//Track with event-name and property
mixpanel.track('TrackEvent', {'Status': 'Pending'})
```

<a name="API"></a>
# API
Following methods are from Mixpanel and People class.

|  **Method** | **iOS** | **Android** |
|  ------ | :------: | :------: |
|[init()](#init) | &#9989; |  &#9989; |
|[hasOptedOutTracking()](#hasOptedOutTracking) |  &#9989; |  &#9989;|
|[optInTracking()](#optInTracking) |  &#9989; |  &#9989;|
|[optOutTracking()](#optOutTracking) |  &#9989; |  &#9989;|
|[identify()](#identify) |  &#9989; |  &#9989;|
|[isIdentified()](#isIdentified)|  &#10060; |  &#9989;|
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

# All classes
- [Mixpanel](#Mixpanel)
- [Mixpanel.People](#Mixpanel.People)

```
Note: To call any method from both classes, first you have to call init method from Mixpanel class.
```

<a name="Mixpanel"></a>
# Mixpanel

<a name="init"></a>
# init()
To use library first you have to call init. It will initialize all Mixpanel setup. **optOutTrackingDefault** is by default set to false.
### Example
```js
import Mixpanel from 'mixpanel-react-native';

const mixpanel = await Mixpanel.init('Your mixpanel token'); // optOutTrackingDefault is false by default

const mixpanelInstance = await Mixpanel.init('Your mixpanel token', true);
```

<a name="hasOptedOutTracking"></a>
# hasOptedOutTracking()
To check whether user has opted out from tracking or not.
### Example
```js
let hasOptedOut = await mixpanel.hasOptedOutTracking();
```

<a name="optInTracking"></a>
# optInTracking()
To internally track an opt-in event, to opt in an already opted out user from tracking. User updates and track calls will be
     sent to Mixpanel after using this method.
### Example
```js
// Opt-in without any parameters
mixpanel.optInTracking();

// Opt-in with a distinctId
mixpanel.optInTracking({ distinctId: '1234' });

// Opt-in with properties
mixpanel.optInTracking({ properties: {'Name': 'ABC'} });

// Opt-in with distinctId and properties
mixpanel.optInTracking({ distinctId: '1234', properties: {'Name': 'ABC'} });
```

<a name="optOutTracking"></a>
# optOutTracking()
To opt-out user from tracking. So all events and user request will not sent back to the Mixpanel server.
### Example
```js
mixpanel.optOutTracking();
```

<a name="track"></a>
# track()
To Track an event with properties.
     Properties are optional and can be added only if needed.
     Properties will allow you to segment your events in your Mixpanel reports.
     If the event is being timed, the timer will stop and added as a property.
### Example
```js
// Track with event-name
mixpanel.track('TrackEvent');

//Track with event-name and property
mixpanel.track('TrackEvent', {'Status': 'Pending'})
```

<a name="registerSuperProperties"></a>
# registerSuperProperties()
To register super properties, once registered, are automatically sent as properties for
     all event tracking calls. 
### Example
```js
mixpanel.registerSuperProperties({'Plan': 'Mega', 'Cost': '2000'});
```

<a name="registerSuperPropertiesOnce"></a>
# registerSuperPropertiesOnce()
To register super properties without overwriting ones that have already been set.
Property keys must be String objects and the supported value types need to conform to MixpanelType.
### Example
```js
mixpanel.registerSuperPropertiesOnce({'Role': 'Admin'});
```

<a name="unregisterSuperProperty"></a>
# unregisterSuperProperty()
 To remove a previously registered super property.
     As an alternative to clearing all properties, unregistering specific super
     property prevents them from being recorded on future events. This operation
     does not affect the value of other super properties. Any property name that is
     not registered is ignored.
### Example
```js
mixpanel.unregisterSuperProperty('propertyName');
 ```
 
<a name="getSuperProperties"></a>
# getSuperProperties()
To return a json object of the user's current super properties.
### Example
```js
let superProperties = await mixpanel.getSuperProperties();
```

<a name="clearSuperProperties"></a>
# clearSuperProperties()
To erase all currently registered superProperties.
### Example
```js
mixpanel.clearSuperProperties();
```

<a name="alias"></a>
# alias()
To create a distinctId alias from alias to the current id. It is used to map an identifier called an alias to the existing distinctId of Mixpanel.
### Example
```js
mixpanel.alias('Test123', 'Test456');
```

<a name="reset"></a>
# reset()
To clear tweaks and all distinctIds, superProperties, and push registrations from persistent storage.
### Example
```js
mixpanel.reset();
```

<a name="flush"></a>
# flush()
To send all queued messages to server. By default, queued data is flushed to the Mixpanel servers every minute. If you want to force a flush at a particular moment
 you only need to call this method manually. 
### Example
```js
mixpanel.flush();
```

<a name="timeEvent"></a>
# timeEvent()
To start a timer, that will be stopped and added as a property when a
     corresponding event is tracked.
     For Example, if a developer wants to track an "Image Upload" event
     and he wants to also know how long the upload took, he has to call this method.
### Example
```js
mixpanel.timeEvent('Image Upload');
```

<a name="eventElapsedTime"></a>
# **eventElapsedTime()**
To retrieve the time elapsed for the named event since timeEvent() was called.
### Example
```js
let elapsedTime = await mixpanel.eventElapsedTime('Image Upload');
```

<a name="identify"></a>
# identify()
To identify the user uniquely by providing the user distinctId. After calling track all the events, updates will manipulate the data only for identified user's profile.
### Example
```js
mixpanel.identify('1234');
```
<a name="isIdentified"></a>
# isIdentified()
To check whether profile of user is identified or not.

**Note:** This method is available in only android platform.
### Example
```js
let isIdentified = await mixpanel.isIdentified();
```

<a name="Mixpanel.People"></a>
# **Mixpanel.People**
<a name="set"></a>
# set()
To set properties on user's profile.
### Example
```js
//Set with property name and value
mixpanel.people.set('Plan', 'Premium');

//Set with json object
mixpanel.people.set({'$name': 'ABC'});
```

<a name="unset"></a>
# unset()
To remove a property permanently with the given name from the user's profile.
### Example
```js
mixpanel.people.unset('Plan');
```

<a name="setOnce"></a>
# setOnce()
To set properties on the current user record, but doesn't overwrite if
     there is an existing value. It is particularly useful for collecting
     data about the user's initial experience and source, as well as dates
     representing the first time something happened.
### Example
```js
//SetOnce with property name and value
mixpanel.people.setOnce('Plan', 'Premium');

//SetOnce with json object
mixpanel.people.setOnce({'$name': 'ABC'});
```

<a name="trackCharge"></a>
# trackCharge()
To track money spent by the current user for revenue analytics and associate
     properties with the charge. Properties are optional.
### Example
```js
mixpanel.people.trackCharge(500);
```

<a name="clearCharges"></a>
# clearCharges()
To clear the whole transaction history permanently for the identified user profile.
### Example
```js
mixpanel.people.clearCharges();
```

<a name="increment"></a>
# increment()
 To increment the given numeric properties by the given values. Property keys must be String names of numeric properties.
### Example
```js
//Increment counter property by 1
mixpanel.people.increment('Counter');

//Increment counter property by 2000
mixpanel.people.increment('Counter', 2000);

//Increment counter property by 100
mixpanel.people.increment({'Counter': 100});
```

<a name="append"></a>
# append()
To append a value to a list-valued property. Property key must be a String name and the supported value types need to be String|Number|Boolean.
### Example
```js
//append a number to list-valued property 'PointCount'
mixpanel.people.append('PointCount', 500);

//append a string to list-valued property 'PointCount'
mixpanel.people.append('PointCount', 'Unlimited');

//append a boolean value to list-valued property 'PointCount'
mixpanel.people.append('PointCount', true);
```

<a name="deleteUser"></a>
# deleteUser()
To delete the identified user's record permanently.
### Example
```js
mixpanel.people.deleteUser();
```

<a name="remove"></a>
# remove()
 To remove a value from a list-valued property only if they are already present in the list.
### Example
```js
//remove a number from list-valued property 'PointCount'
mixpanel.people.remove('PointCount', 500);

//remove a string from list-valued property 'PointCount'
mixpanel.people.remove('PointCount', 'Unlimited');

//remove a boolean value from list-valued property 'PointCount'
mixpanel.people.remove('PointCount', true);
 ```
 
<a name="setPushRegistrationId"></a>
# setPushRegistrationId()
To register the given device to receive push notifications. This will associate the device token with the current user in people profile,
     which will allow you to send push notifications to the user.
### Example
```js
mixpanel.people.setPushRegistrationId('Your Device Token');
```

<a name="getPushRegistrationId"></a>
# getPushRegistrationId()
To retrieve current Firebase Cloud Messaging token.

**Note:** This method is available in only android platform.
### Example
```js
let pushRegistrationId = await mixpanel.people.getPushRegistrationId();
```

<a name="clearPushRegistrationId"></a>
# clearPushRegistrationId()
 Unregister a specific device token from the ability to receive push notifications. This will remove the provided push token saved to this user profile.
### Example
```js
mixpanel.people.clearPushRegistrationId('Your Device Token');
```

<a name="union"></a>
# union()
 To add values to a list-valued property only if, they are not already present in the list. If the property does not currently exist, it will be created with the given list as it's value. If the property exists and is not list-valued, the union will be ignored.
### Example
```js
 mixpanel.people.union('Days', ['Sunday', 'Monday', 'Tuesday']);
 ```
# 
You're done! You've successfully integrated the Mixpanel React-Native library into your app. 

Have any questions? Reach out to [support@mixpanel.com](mailto:support@mixpanel.com) to speak to someone smart, quickly.
