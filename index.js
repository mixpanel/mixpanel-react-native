"use strict";

import { Platform, NativeModules } from 'react-native';
import packageJson from "./package.json";
const { MixpanelReactNative } = NativeModules;

if (!MixpanelReactNative) {
    throw new Error(`mixpanel-react-native: MixpanelReactNative is null. To fix this issue try these steps:
    • Run \`react-native link mixpanel-react-native\` in the project root.
    • Rebuild and re-run the app.
    • If you are using CocoaPods on iOS, run \`pod install\` in the \`ios\` directory and then rebuild and re-run the app. You may also need to re-open Xcode to get the new pods.
    If none of these fix the issue, please open an issue on the Github repository: https://github.com/mixpanel/mixpanel-react-native`);
}

const KEY = {
    DISTINCT_ID: "Distinct id",
    ALIAS: "Alias",
    EVENT_NAME: "Event name",
    PROPERTIES: "Properties",
    PROPERTY_NAME: "Property name",
    DEVICE_TOKEN: "Device token",
    TOKEN: "Token",
    VALUES: "Values"
};

const ERROR_MESSAGE = {
    REQUIRED_PARAMETER: " is required",
    INVALID_OBJECT: " is not a valid json object",
    INVALID_ARRAY: " is not a valid array",
    REQUIRED_DOUBLE: "expected parameter of type `double`",
    REQUIRED_NON_OBJECT: "expected parameter of type `string`, `number`, or `boolean`"
};

const DEFAULT_OPT_OUT = false;

export default class Mixpanel {
    token: ?string;
    people: ?People;
 
    constructor(token) {   
        this.token = Helper.getValidString(token, KEY.Token);
        this.people = new People(this.token);
    }

    /**
      Initialize mixpanel setup.
     */
    static async init(token, optOutTrackingDefault = DEFAULT_OPT_OUT) {
        let metadata = Helper.getMetaData();
        await MixpanelReactNative.initialize(token, optOutTrackingDefault, metadata);
        return new Mixpanel(token);
    }

    /**
      Check whether the current user has opted out tracking or not.
     */
    hasOptedOutTracking() {
        return MixpanelReactNative.hasOptedOutTracking(this.token);        
    }

    /**
      This method is used to opt in an already opted out user from tracking. People updates and track calls will be
      sent to Mixpanel after using this method.
     */
    optInTracking(distinctId, properties) {
        if (arguments.length === 0) {
            properties = {};
        } else if (typeof distinctId === "string") {
            distinctId = Helper.getValidString(distinctId, KEY.DISTINCT_ID);
            properties = properties || {};
        } else if (typeof distinctId === "object") {
            properties = distinctId;
            distinctId = null;
        }
        properties = Helper.getValidObject(properties, KEY.PROPERTIES);
        return MixpanelReactNative.optInTracking(this.token, distinctId, properties);
    }

    /**
      This method is used to opt out from tracking. This causes all events and people request no longer
      to be sent back to the Mixpanel server.
     */
    optOutTracking() {
        return MixpanelReactNative.optOutTracking(this.token);
    }

    /**
      Identify a user with a unique ID instead of a Mixpanel
      randomly generated distinctId. If the method is never called,
      then unique visitors will be identified by a UUID generated
      the first time they visit the site.
     */
    identify(distinctId) {
        return MixpanelReactNative.identify(this.token, Helper.getValidString(distinctId, KEY.DISTINCT_ID));
    }

    /** 
      This function creates an alias for distinctId
     */
    alias(alias, distinctId) {
        return MixpanelReactNative.alias(this.token, Helper.getValidString(alias, KEY.ALIAS), Helper.getValidString(distinctId, KEY.DISTINCT_ID));
    }

    /**
      Track an event. 
     */
    track(eventName, properties) {
        eventName = Helper.getValidString(eventName, KEY.EVENT_NAME);
        properties = Helper.getValidObject(properties || {}, KEY.PROPERTIES);
        return MixpanelReactNative.track(this.token, eventName, properties);
    }

    /**
      Register a set of super properties, which are included with all
      events. This will overwrite previous super property values.
     */
    registerSuperProperties(properties) {
        properties = properties || {};
        properties = Helper.getValidObject(properties, KEY.PROPERTIES);
        return MixpanelReactNative.registerSuperProperties(this.token, properties);
    }

    /**
      Register a set of super properties only once. This will not
      overwrite previous super property values, unlike register().
     */
    registerSuperPropertiesOnce(properties) {
        properties = properties || {};
        properties = Helper.getValidObject(properties, KEY.PROPERTIES);
        return MixpanelReactNative.registerSuperPropertiesOnce(this.token, properties);
    }

    /**
      Delete a super property stored with the current user.
     */
    unregisterSuperProperty(propertyName) {
        return MixpanelReactNative.unregisterSuperProperty(this.token, Helper.getValidString(propertyName, KEY.PROPERTY_NAME));
    }

    /**
      Get current user super property.
     */
    getSuperProperties() {
        return MixpanelReactNative.getSuperProperties(this.token);
    }

    /**
      Clear all currently set super properties.
     */
    clearSuperProperties() {
        return MixpanelReactNative.clearSuperProperties(this.token);
    }

    /**
      Use to calculate time required for an event by including the time between this call and a
      later 'track' call for the same event in the properties sent
      with the event.
     */
    timeEvent(eventName) {
        return MixpanelReactNative.timeEvent(this.token, Helper.getValidString(eventName, KEY.EVENT_NAME));
    }

    /**
      Retrieve the time elapsed for the named event since timeEvent was called.
     */
    eventElapsedTime(eventName) {
        return MixpanelReactNative.eventElapsedTime(this.token, Helper.getValidString(eventName, KEY.EVENT_NAME));
    } 

    /**
      Clear super properties and generates a new random distinctId for this instance.
      Useful for clearing data when a user logs out.
     */
    reset() {
        return MixpanelReactNative.reset(this.token);
    }

    /**
      For Android only
      Use to check whether user is identified or not.
     */
    isIdentified() {
        return MixpanelReactNative.isIdentified(this.token);
    }
     
    /**
      Upload queued data to the Mixpanel server.
     */
    flush() {
        return MixpanelReactNative.flush(this.token);
    }
}

export class People {
    token: ?string; 
    
    constructor(token) {   
        this.token = token;
    }

    /**
      Identify a user with a unique ID instead of a Mixpanel
      randomly generated distinctId. If the method is never called,
      then unique visitors will be identified by a UUID generated
      the first time they visit the site.
     */
    identify(distinctId) {
        return MixpanelReactNative.identify(this.token, Helper.getValidString(distinctId, KEY.DISTINCT_ID));
    }

    /**
      Set properties on an user record in engage.
     */
    set(prop, to) {
        let properties = {}; 
        if (typeof prop === "object") {
            prop = prop || {};
            properties = JSON.parse(JSON.stringify(prop));
        } else {
            properties[Helper.getValidString(prop, KEY.PROPERTY_NAME)] = to;
        }
        return MixpanelReactNative.set(this.token, properties);
    }

    /**
      The same as people.set but This method allows you to set a user attribute, only if it is not currently set.
     */
    setOnce(prop, to) {
        let properties = {}; 
        if (typeof prop === "object") {
            prop = prop || {};
            properties = JSON.parse(JSON.stringify(prop));
        } else {
            properties[Helper.getValidString(prop, KEY.PROPERTY_NAME)] = to;
        }
        return MixpanelReactNative.setOnce(this.token, properties);
    }

    /**
      Track a revenue transaction for the identified people profile.
     */
    trackCharge(charge, properties) {
        if (isNaN(parseFloat(charge))) {
            throw new Error(ERROR_MESSAGE.REQUIRED_DOUBLE)
        }
        properties = properties || {};
        properties = Helper.getValidObject(properties, KEY.PROPERTIES);
        return MixpanelReactNative.trackCharge(this.token, charge, properties);
    }

    /**
      Clear all the current user's transactions.
     */
    clearCharges() {
        return MixpanelReactNative.clearCharges(this.token);
    }
 
    /**
      Increment/Decrement properties on an user record in engage.
     */
    increment(propertyName, by) {
        var add = {};
        if (typeof propertyName === "object") {            
            Object.keys(propertyName).forEach(function(key) {
                var val = propertyName[key];
                if (isNaN(parseFloat(val))) {
                    throw new Error(ERROR_MESSAGE.REQUIRED_DOUBLE )
                }
             add[key] = val;
            });            
        } else {
            by = by || 1; 
            if (isNaN(parseFloat(by))) {
                throw new Error(ERROR_MESSAGE.REQUIRED_DOUBLE )
            }            
            add[Helper.getValidString(propertyName, KEY.PROPERTY_NAME)] = by;
        }
        return MixpanelReactNative.increment(this.token, add);        
    }

    /**
      Append a value to a list-valued people analytics property.
     */
    append(name, value) {
        let appendProp = {};
        name = Helper.getValidString(name, KEY.PROPERTY_NAME);
        if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
            throw new Error(ERROR_MESSAGE.REQUIRED_NON_OBJECT);
        } else {
            appendProp[name] = value;
        }

        if (DevicePlatform.iOS === Helper.getDevicePlatform()) {
            return MixpanelReactNative.append(this.token, appendProp);
        } else {
            return MixpanelReactNative.append(this.token, Helper.getValidString(name, KEY.PROPERTY_NAME), appendProp);
        }        
    }

    /**
      Delete an user record in engage.
     */
    deleteUser() {
        return MixpanelReactNative.deleteUser(this.token);
    }

    /**
      Remove list properties.
     */
    remove(name, value) {
        let removeProp = {};
        name = Helper.getValidString(name, KEY.PROPERTY_NAME);
        if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
            throw new Error(ERROR_MESSAGE.REQUIRED_NON_OBJECT);
        } else {
            removeProp[name] = value;
        }

        if (DevicePlatform.iOS === Helper.getDevicePlatform()) {
            return MixpanelReactNative.remove(this.token, removeProp);
        } else {
            return MixpanelReactNative.remove(this.token, Helper.getValidString(name, KEY.PROPERTY_NAME), removeProp);
        }
        
    }
  
    /**
      Add values to a list-valued property only if they are not already present in the list.  
     */
    union(name, values) {
        name = Helper.getValidString(name, KEY.PROPERTY_NAME);
        if (!Array.isArray(values)) {
            throw new Error(KEY.VALUES + ERROR_MESSAGE.INVALID_ARRAY);
        }

        if (DevicePlatform.iOS === Helper.getDevicePlatform()) {
            return MixpanelReactNative.union(this.token, {name: values});
        } else {
            return MixpanelReactNative.union(this.token, name, values);
        }
    }

    /**
      Remove a list of properties and their values from the current user's profile
      in Mixpanel People.
     */
    unset(propertyName) {
        return MixpanelReactNative.unset(this.token, Helper.getValidString(propertyName, KEY.PROPERTY_NAME));
    }

    /**
      Register the given device to receive push notifications.
     */
    setPushRegistrationId(deviceToken) {
        return MixpanelReactNative.setPushRegistrationId(this.token, Helper.getValidString(deviceToken, KEY.DEVICE_TOKEN));
    }

    /**
      For Android only
      Retrieve current Firebase Cloud Messaging token.
     */
    getPushRegistrationId() {
        return MixpanelReactNative.getPushRegistrationId(this.token);
    }

    /**
      Unregister specific device token from the ability to receive push notifications. This will remove the provided push token saved to user profile.
     */
    clearPushRegistrationId(deviceToken) {
        return MixpanelReactNative.clearPushRegistrationId(this.token, Helper.getValidString(deviceToken, KEY.DEVICE_TOKEN));
    }
}

const DevicePlatform = {
    Unknown: "Unknown", 
    Android: "Android", 
    iOS: "ios"
};

class Helper {
    
    /**
      Get valid string. 
     */
    static getValidString(str, parameterName) {
        if (!str || str === "" ) {
            throw new Error(parameterName + ERROR_MESSAGE.REQUIRED_PARAMETER );
        }
        return str;
    }

    /**
      Get valid object. 
     */
    static getValidObject(obj, parameterName) {
        if (typeof obj !== "object") {
            throw new Error(parameterName + ERROR_MESSAGE.INVALID_OBJECT);
        }
        return obj;
    }
    
    /**
      Get the library data from package.json file. 
     */
    static getMetaData() {
        let metadata = JSON.parse(JSON.stringify(packageJson.metadata));
        metadata["$lib_version"] = packageJson.version;
        return metadata;
    }

    static getDevicePlatform() {
        switch (Platform.OS) {
            case "Android": 
                return DevicePlatform.Android;
            case "ios":
                return DevicePlatform.iOS;
            default: 
                return DevicePlatform.Unknown;
        }
    }
}
