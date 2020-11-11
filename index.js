"use strict";

import { Platform, NativeModules } from "react-native";
import packageJson from "./package.json";
const { MixpanelReactNative } = NativeModules;

if (!MixpanelReactNative) {
    throw new Error(`mixpanel-react-native: MixpanelReactNative is null. To fix this issue try these steps:
    • Run \`react-native link mixpanel-react-native\` in the project root.
    • Rebuild and re-run the app.
    • If you are using CocoaPods on iOS, run \`pod install\` in the \`ios\` directory and then rebuild and re-run the app. You may also need to re-open Xcode to get the new pods.
    If none of these fix the issue, please open an issue on the Github repository: https://github.com/mixpanel/mixpanel-react-native`);
}

const DevicePlatform = {
    Unknown: "Unknown",
    Android: "Android",
    iOS: "ios"
}

const ERROR_MESSAGE = {
    INVALID_OBJECT: " is not a valid json object",
    REQUIRED_DOUBLE: " is not a valid number",
    ONLY_FOR_ANDROID: " This method is only applicable for android platform"
}

const PARAMS = {
    TOKEN: "token",
    DISTINCT_ID_IN_OPTIONS: "distinctId in the options parameter",
    PROPERTIES_IN_OPTIONS: "properties in the options parameter",
    DISTINCT_ID: "distinctId",
    ALIAS: "alias",
    EVENT_NAME: "eventName",
    PROPERTIES: "properties",
    PROPERTY_NAME: "propertyName",
    PROP: "prop",
    NAME: "name",
    DEVICE_TOKEN: "deviceToken",
    CHARGE: "charge",
    PROPERTY_VALUE: "property value"
}

const DEFAULT_OPT_OUT = false;

export default class Mixpanel {

    constructor(token) {
        if (!StringHelper.isValid(token)) {
            StringHelper.raiseError(PARAMS.TOKEN);
        }
        this.token = token;
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

      options = {
          distinctId: string
          properties: {
          }
      }
     */
    optInTracking(options) {
        options = options || { distinctId: null, properties: {} };

        if (!StringHelper.isValidOrUndefined(options.distinctId)) {
            StringHelper.raiseError(PARAMS.DISTINCT_ID_IN_OPTIONS);
        }

        if (!ObjectHelper.isValidOrUndefined(options.properties)) {
            ObjectHelper.raiseError(PARAMS.PROPERTIES_IN_OPTIONS);
        }
        return MixpanelReactNative.optInTracking(this.token, options.distinctId, options.properties || {});
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
        if (!StringHelper.isValid(distinctId)) {
            StringHelper.raiseError(PARAMS.DISTINCT_ID);
        }
        return MixpanelReactNative.identify(this.token, distinctId);
    }

    /**
      This function creates an alias for distinctId.
     */
    alias(alias, distinctId) {
        if (!StringHelper.isValid(alias)) {
            StringHelper.raiseError(PARAMS.ALIAS);
        }

        if (!StringHelper.isValid(distinctId)) {
            StringHelper.raiseError(PARAMS.DISTINCT_ID);
        }
        return MixpanelReactNative.alias(this.token, alias, distinctId);
    }

    /**
      Track an event.
     */
    track(eventName, properties) {
        if (!StringHelper.isValid(eventName)) {
            StringHelper.raiseError(PARAMS.EVENT_NAME);
        }

        if (!ObjectHelper.isValidOrUndefined(properties)) {
            ObjectHelper.raiseError(PARAMS.PROPERTIES);
        }
        return MixpanelReactNative.track(this.token, eventName, properties || {});
    }

    /**
      Register a set of super properties, which are included with all
      events. This will overwrite previous super property values.
     */
    registerSuperProperties(properties) {
        if (!ObjectHelper.isValidOrUndefined(properties)) {
            ObjectHelper.raiseError(PARAMS.PROPERTIES);
        }
        return MixpanelReactNative.registerSuperProperties(this.token, properties || {});
    }

    /**
      Register a set of super properties only once. This will not
      overwrite previous super property values, unlike register().
     */
    registerSuperPropertiesOnce(properties) {
        if (!ObjectHelper.isValidOrUndefined(properties)) {
            ObjectHelper.raiseError(PARAMS.PROPERTIES);
        }
        return MixpanelReactNative.registerSuperPropertiesOnce(this.token, properties || {});
    }

    /**
      Delete a super property stored with the current user.
     */
    unregisterSuperProperty(propertyName) {
        if (!StringHelper.isValid(propertyName)) {
            StringHelper.raiseError(PARAMS.PROPERTY_NAME);
        }
        return MixpanelReactNative.unregisterSuperProperty(this.token, propertyName);
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
        if (!StringHelper.isValid(eventName)) {
            StringHelper.raiseError(PARAMS.EVENT_NAME);
        }
        return MixpanelReactNative.timeEvent(this.token, eventName);
    }

    /**
     Clears all current event timers.
     */
    clearTimedEvents() {
        return MixpanelReactNative.clearTimedEvents(this.token);  
    }

    /**
      Retrieve the time elapsed for the named event since timeEvent(eventName) was called.
     */
    eventElapsedTime(eventName) {
        if (!StringHelper.isValid(eventName)) {
            StringHelper.raiseError(PARAMS.EVENT_NAME);
        }
        return MixpanelReactNative.eventElapsedTime(this.token, eventName);
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
        if (Helper.getDevicePlatform() !== DevicePlatform.Android) {
            throw new Error(ERROR_MESSAGE.ONLY_FOR_ANDROID);
        }
        return MixpanelReactNative.isIdentified(this.token);
    }

    /**
     Returns the string id currently being used to uniquely identify the user associated
     with events.
    */
    getDistinctId() {
        return MixpanelReactNative.getDistinctId(this.token);
    }

    /**
      Upload queued data to the Mixpanel server.
     */
    flush() {
        return MixpanelReactNative.flush(this.token);
    }
}

export class People {

    constructor(token) {
        this.token = token;
    }

    /**
      Set properties on an user record in engage.
     */
    set(prop, to) {
        let properties = {};
        if (ObjectHelper.isValid(prop)) {
            properties = JSON.parse(JSON.stringify(prop || {}));
        } else {
            if (!StringHelper.isValid(prop)) {
                StringHelper.raiseError(PARAMS.PROP);
            }
            properties[prop] = to;
        }
        return MixpanelReactNative.set(this.token, properties);
    }

    /**
      The same as people.set but This method allows you to set a user attribute, only if it is not currently set.
     */
    setOnce(prop, to) {
        let properties = {};
        if (ObjectHelper.isValid(prop)) {
            prop = prop || {};
            properties = JSON.parse(JSON.stringify(prop));
        } else {
            if (!StringHelper.isValid(prop)) {
                StringHelper.raiseError(PARAMS.PROP);
            }
            properties[prop] = to;
        }
        return MixpanelReactNative.setOnce(this.token, properties);
    }

    /**
      Track a revenue transaction for the identified people profile.
     */
    trackCharge(charge, properties) {
        if (isNaN(parseFloat(charge))) {
            throw new Error(`${PARAMS.CHARGE}${ERROR_MESSAGE.REQUIRED_DOUBLE}`)
        }

        if (!ObjectHelper.isValidOrUndefined(properties)) {
            ObjectHelper.raiseError(PARAMS.PROPERTIES);
        }
        return MixpanelReactNative.trackCharge(this.token, charge, properties || {});
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
    increment(prop, by) {
        var add = {};
        if (ObjectHelper.isValid(prop)) {
            Object.keys(prop).forEach(function (key) {
                var val = prop[key];
                if (isNaN(parseFloat(val))) {
                    throw new Error(`${PARAMS.PROPERTY_VALUE}${ERROR_MESSAGE.REQUIRED_DOUBLE}`);
                }
                add[key] = val;
            });
        } else {
            by = by || 1;
            if (isNaN(parseFloat(by))) {
                throw new Error(`${PARAMS.PROPERTY_VALUE}${ERROR_MESSAGE.REQUIRED_DOUBLE}`);
            }

            if (!StringHelper.isValid(prop)) {
                StringHelper.raiseError(PARAMS.NAME);
            }

            add[prop] = by;
        }
        return MixpanelReactNative.increment(this.token, add);
    }

    /**
      Append a value to a list-valued people analytics property.
     */
    append(name, value) {
        let appendProp = {};
        if (!StringHelper.isValid(name)) {
            StringHelper.raiseError(PARAMS.NAME);
        } else {
            appendProp[name] = value;
        }

        if (DevicePlatform.iOS === Helper.getDevicePlatform()) {
            return MixpanelReactNative.append(this.token, appendProp);
        } else {
            return MixpanelReactNative.append(this.token, name, appendProp);
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
        if (!StringHelper.isValid(name)) {
            StringHelper.raiseError(PARAMS.NAME);
        } else {
            removeProp[name] = value;
        }

        if (DevicePlatform.iOS === Helper.getDevicePlatform()) {
            return MixpanelReactNative.remove(this.token, removeProp);
        } else {
            return MixpanelReactNative.remove(this.token, name, removeProp);
        }
    }

    /**
      Add values to a list-valued property only if they are not already present in the list.
     */
    union(name, values) {
        if (!StringHelper.isValid(name)) {
            StringHelper.raiseError(PARAMS.NAME);
        }

        values = Array.isArray(values) ? values : [values];

        if (DevicePlatform.iOS === Helper.getDevicePlatform()) {
            return MixpanelReactNative.union(this.token, { name: values });
        } else {
            return MixpanelReactNative.union(this.token, name, values);
        }
    }

    /**
      Remove a list of properties and their values from the current user's profile
      in Mixpanel People.
     */
    unset(propertyName) {
        if (!StringHelper.isValid(propertyName)) {
            StringHelper.raiseError(PARAMS.PROPERTY_NAME);
        }
        return MixpanelReactNative.unset(this.token, propertyName);
    }

    /**
      Register the given device to receive push notifications.
     */
    setPushRegistrationId(deviceToken) {
        if (!StringHelper.isValid(deviceToken)) {
            StringHelper.raiseError(PARAMS.DEVICE_TOKEN);
        }
        return MixpanelReactNative.setPushRegistrationId(this.token, deviceToken);
    }

    /**
      For Android only
      Retrieve current Firebase Cloud Messaging token.
     */
    getPushRegistrationId() {
        if (Helper.getDevicePlatform() !== DevicePlatform.Android) {
            throw new Error(ERROR_MESSAGE.ONLY_FOR_ANDROID);
        }
        return MixpanelReactNative.getPushRegistrationId(this.token);
    }

    /**
      Unregister specific device token from the ability to receive push notifications. This will remove the provided push token saved to user profile.
     */
    clearPushRegistrationId(deviceToken) {
        if (!StringHelper.isValid(deviceToken)) {
            StringHelper.raiseError(PARAMS.DEVICE_TOKEN);
        }
        return MixpanelReactNative.clearPushRegistrationId(this.token, deviceToken);
    }
}

class Helper {
    /**
      Get the library data from package.json file.
     */
    static getMetaData() {
        let metadata = JSON.parse(JSON.stringify(packageJson.metadata));
        metadata["$lib_version"] = packageJson.version;
        return metadata;
    }

    /**
      Get current device platform.
     */
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

class StringHelper {
    /**
      Check whether the parameter is not a blank string.
     */
    static isValid(str) {
        return typeof str === "string" && !(/^\s*$/).test(str);
    }

    /**
      Check whether the parameter is undefined or not a blank string.
     */
    static isValidOrUndefined(str) {
        return str === undefined || StringHelper.isValid(str);
    }

    /**
      Raise a string validation error.
     */
    static raiseError(paramName) {
        throw new Error(`${paramName}${ERROR_MESSAGE.INVALID_STRING}`);
    }
}

class ObjectHelper {
    /**
      Check whether the parameter is an object.
     */
    static isValid(obj) {
        return typeof obj === "object";
    }

    /**
      Check whether the parameter is undefined or an object.
     */
    static isValidOrUndefined(obj) {
        return obj === undefined || ObjectHelper.isValid(obj);
    }

    /**
      Raise an object validation error.
     */
    static raiseError(paramName) {
        throw new Error(`${paramName}${ERROR_MESSAGE.INVALID_OBJECT}`);
    }
}
