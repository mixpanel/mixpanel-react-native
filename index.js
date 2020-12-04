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
    GROUP_KEY: "groupKey",
    GROUP_ID: "groupID",
    GROUP_IDs: "groupIDs",
    PROPERTIES: "properties",
    PROPERTY_NAME: "propertyName",
    PROP: "prop",
    NAME: "name",
    DEVICE_TOKEN: "deviceToken",
    CHARGE: "charge",
    PROPERTY_VALUE: "property value"
}

const DEFAULT_OPT_OUT = false;

/**
 * The primary class for integrating Mixpanel with your app.
 */
export default class Mixpanel {

    constructor(token) {
        if (!StringHelper.isValid(token)) {
            StringHelper.raiseError(PARAMS.TOKEN);
        }
        this.token = token;
        this.people = new People(this.token);
    }

    /**
     * Initializes an instance of the API with the given project token.
     * 
     *
     * @param token your project token.
     * @param optOutTrackingDefault Optional Whether or not Mixpanel can start tracking by default. See
     * optOutTracking()
     */
    static async init(token, optOutTrackingDefault = DEFAULT_OPT_OUT) {
        let metadata = Helper.getMetaData();
        await MixpanelReactNative.initialize(token, optOutTrackingDefault, metadata);
        return new Mixpanel(token);
    }

    /**
     * Will return true if the user has opted out from tracking.
     *
     * @return true if user has opted out from tracking. Defaults to false.
     */
    hasOptedOutTracking() {
        return MixpanelReactNative.hasOptedOutTracking(this.token);
    }
  
    /**
     * Use this method to opt-in an already opted-out user from tracking. People updates and track
     * calls will be sent to Mixpanel after using this method.
     * This method will internally track an opt-in event to your project.
     *
     * @param options Optional
     *    options = {
            distinctId: string
            properties: {}
          }
        distinctId: Optional string to use as the distinct ID for events.
     * 
     *  properties: Optional could be passed to add properties to the opt-in event that is sent to Mixpanel.
     *
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
     * Use this method to opt-out a user from tracking. Events and people updates that haven't been
     * flushed yet will be deleted. Use flush() before calling this method if you want
     * to send all the queues to Mixpanel before.
     *
     * This method will also remove any user-related information from the device.
     */
    optOutTracking() {
        return MixpanelReactNative.optOutTracking(this.token);
    }

    /**
     * Associate all future calls to track() with the user identified by
     * the given distinct id.
     *
     * <p>Calls to track() made before corresponding calls to identify
     * will use an anonymous locally generated distinct id, which means it is best to call identify
     * early to ensure that your Mixpanel funnels and retention analytics can continue to track the
     * user throughout their lifetime. We recommend calling identify when the user authenticates.
     *
     * <p>Once identify is called, the local distinct id persists across restarts of
     * your application.
     *
     * @param distinctId a string uniquely identifying this user. Events sent to
     *     Mixpanel using the same disinct_id will be considered associated with the
     *     same visitor/customer for retention and funnel reporting, so be sure that the given
     *     value is globally unique for each individual user you intend to track.
     *
     */
    identify(distinctId) {
        if (!StringHelper.isValid(distinctId)) {
            StringHelper.raiseError(PARAMS.DISTINCT_ID);
        }
        return MixpanelReactNative.identify(this.token, distinctId);
    }

    /**
     * The alias method creates an alias which Mixpanel will use to remap one id to another.
     * Multiple aliases can point to the same identifier.
     * 
     *  `mixpane.alias("New ID", mixpane.distinctId)`
     *  `mixpane.alias("Newer ID", mixpane.distinctId)`
     * 
     * <p>This call does not identify the user after. You must still call both identify() and
     * People.identify() if you wish the new alias to be used for Events and People.
     *
     * @param alias A unique identifier that you want to use as an identifier for this user.
     * @param distinctId the current distinct_id that alias will be mapped to.
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
     * Track an event.
     *
     * <p>Every call to track eventually results in a data point sent to Mixpanel. These data points
     * are what are measured, counted, and broken down to create your Mixpanel reports. Events
     * have a string name, and an optional set of name/value pairs that describe the properties of
     * that event.
     *
     * @param eventName The name of the event to send
     * @param properties A Map containing the key value pairs of the properties to include in this event.
     *                   Pass null if no extra properties exist.
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
     * Returns a Mixpanel People object that can be used to set and increment
     * People Analytics properties.
     *
     * @return an instance of People that you can use to update
     *     records in Mixpanel People Analytics
     */
    getPeople() {
        return this.people;
    }

    /**
     * Track an event with specific groups.
     *
     * <p>Every call to track eventually results in a data point sent to Mixpanel. These data points
     * are what are measured, counted, and broken down to create your Mixpanel reports. Events
     * have a string name, and an optional set of name/value pairs that describe the properties of
     * that event. Group key/value pairs are upserted into the property map before tracking.
     *
     * @param eventName The name of the event to send
     * @param properties A Map containing the key value pairs of the properties to include in this event.
     *                   Pass null if no extra properties exist.
     * @param groups A Map containing the group key value pairs for this event.
     *
     * See also {@link #track(String, org.json.JSONObject)}, {@link #trackMap(String, Map)}
     */ 
    trackWithGroups(eventName, properties, groups) {
        if (!StringHelper.isValid(eventName)) {
            StringHelper.raiseError(PARAMS.EVENT_NAME);
        }

        if (!ObjectHelper.isValidOrUndefined(properties)) {
            ObjectHelper.raiseError(PARAMS.PROPERTIES);
        }
        return MixpanelReactNative.trackWithGroups(this.token, eventName, properties || {}, groups);
    }

    /**
     * Set the group this user belongs to.
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupID The group the user belongs to.
     */
    setGroup(groupKey, groupID) {
        if (!StringHelper.isValid(groupKey)) {
            StringHelper.raiseError(PARAMS.GROUP_KEY);
        }

        return MixpanelReactNative.setGroup(this.token, groupKey, groupID);
    }

    /**
     * Returns a MixpanelGroup object that can be used to set and increment
     * Group Analytics properties.
     *
     * @param groupKey String identifying the type of group (must be already in use as a group key)
     * @param groupID Object identifying the specific group
     * @return an instance of MixpanelGroup that you can use to update
     *     records in Mixpanel Group Analytics
     */
    getGroup(groupKey, groupID) {
        return new MixpanelGroup(this.token, groupKey, groupID);
    }

    /**
     * Add a group to this user's membership for a particular group key
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupID The new group the user belongs to.
     */
    addGroup(groupKey, groupID) {
        if (!StringHelper.isValid(groupKey)) {
            StringHelper.raiseError(PARAMS.GROUP_KEY);
        }

        return MixpanelReactNative.addGroup(this.token, groupKey, groupID);
    }

    /**
     * Remove a group from this user's membership for a particular group key
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupID The group value to remove.
     */
    removeGroup(groupKey, groupID) {
        if (!StringHelper.isValid(groupKey)) {
            StringHelper.raiseError(PARAMS.GROUP_KEY);
        }

        return MixpanelReactNative.removeGroup(this.token, groupKey, groupID);
    }

    /**
     * Permanently deletes this group's record from Group Analytics.
     *
     * @param groupKey String identifying the type of group (must be already in use as a group key)
     * @param groupID Object identifying the specific group
     * <p>Calling deleteGroup deletes an entire record completely. Any future calls
     * to Group Analytics using the same group value will create and store new values.
     */
    deleteGroup(groupKey, groupID) {
        if (!StringHelper.isValid(groupKey)) {
            StringHelper.raiseError(PARAMS.GROUP_KEY);
        }
        return MixpanelReactNative.deleteGroup(this.token, groupKey, groupID);
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

/**
 * Core class for using Mixpanel People Analytics features.
 *
 * <p>The People object is used to update properties in a user's People Analytics record,
 * and to manage the receipt of push notifications sent via Mixpanel Engage.
 * For this reason, it's important to call identify(String) on the People
 * object before you work with it. Once you call identify, the user identity will
 * persist across stops and starts of your application, until you make another
 * call to identify using a different id.
 *
 */
export class People {

    constructor(token) {
        if (!StringHelper.isValid(token)) {
            StringHelper.raiseError(PARAMS.TOKEN);
        }
        this.token = token;
    }

    /**
     * Sets a single property with the given name and value for this user.
     * The given name and value will be assigned to the user in Mixpanel People Analytics,
     * possibly overwriting an existing property with the same name.
     *
     * @param prop The name of the Mixpanel property. This must be a String, for example "Zip Code"
     * @param to The value of the Mixpanel property. For "Zip Code", this value might be the String "90210"
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
     * Works just like set(), except it will not overwrite existing property values. This is useful for properties like "First login date".
     *
     * @param prop The name of the Mixpanel property. This must be a String, for example "Zip Code"
     * @param to The value of the Mixpanel property. For "Zip Code", this value might be the String "90210"
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
     * Add the given amount to an existing property on the identified user. If the user does not already
     * have the associated property, the amount will be added to zero. To reduce a property,
     * provide a negative number for the value.
     *
     * @param prop the People Analytics property that should have its value changed
     * @param by the amount to be added to the current value of the named property
     *
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
     * Appends a value to a list-valued property. If the property does not currently exist,
     * it will be created as a list of one element. If the property does exist and doesn't
     * currently have a list value, the append will be ignored.
     * @param name the People Analytics property that should have it's value appended to
     * @param value the new value that will appear at the end of the property's list
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
            return MixpanelReactNative.append(this.token, name, value);
        }
    }

    /**
     * Adds values to a list-valued property only if they are not already present in the list.
     * If the property does not currently exist, it will be created with the given list as it's value.
     * If the property exists and is not list-valued, the union will be ignored.
     *
     * @param name name of the list-valued property to set or modify
     * @param value an array of values to add to the property value if not already present
     */
    union(name, value) {
        if (!StringHelper.isValid(name)) {
            StringHelper.raiseError(PARAMS.NAME);
        }

        value = Array.isArray(value) ? value : [value];

        if (DevicePlatform.iOS === Helper.getDevicePlatform()) {
            return MixpanelReactNative.union(this.token, { name: value });
        } else {
            return MixpanelReactNative.union(this.token, name, value);
        }
    }

    /**
     * Remove value from a list-valued property only if they are already present in the list.
     * If the property does not currently exist, the remove will be ignored.
     * If the property exists and is not list-valued, the remove will be ignored.
     * @param name the People Analytics property that should have it's value removed from
     * @param value the value that will be removed from the property's list
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
            return MixpanelReactNative.remove(this.token, name, value);
        }
    }

    /**
     * permanently removes the property with the given name from the user's profile
     * @param name name of a property to unset
     */
    unset(name) {
        if (!StringHelper.isValid(name)) {
            StringHelper.raiseError(PARAMS.PROPERTY_NAME);
        }
        return MixpanelReactNative.unset(this.token, name);
    }

    /**
     * Track a revenue transaction for the identified people profile.
     *
     * @param charge the amount of money exchanged. Positive amounts represent purchases or income from the customer, negative amounts represent refunds or payments to the customer.
     * @param properties an optional collection of properties to associate with this transaction.
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
     * Permanently clear the whole transaction history for the identified people profile.
     */
    clearCharges() {
        return MixpanelReactNative.clearCharges(this.token);
    }

    /**
     * Permanently deletes the identified user's record from People Analytics.
     *
     * <p>Calling deleteUser deletes an entire record completely. Any future calls
     * to People Analytics using the same distinct id will create and store new values.
     */
    deleteUser() {
      return MixpanelReactNative.deleteUser(this.token);
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

/**
 * Core class for using Mixpanel Group Analytics features.
 *
 * <p>The MixpanelGroup object is used to update properties in a group's Group Analytics record.
 */
export class MixpanelGroup {

    constructor(token, groupKey, groupID) {
        if (!StringHelper.isValid(token)) {
            StringHelper.raiseError(PARAMS.TOKEN);
        }
        this.token = token;
        this.groupKey = groupKey;
        this.groupID = groupID;
    }

    /**
     * Sets a single property with the given name and value for this group.
     * The given name and value will be assigned to the user in Mixpanel Group Analytics,
     * possibly overwriting an existing property with the same name.
     *
     * @param prop The name of the Mixpanel property. This must be a String, for example "Zip Code"
     * @param to The value to set on the given property name. For "Zip Code", this value might be the String "90210"
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
        return MixpanelReactNative.groupSetProperties(this.token, this.groupKey, this.groupID, properties);
    }

    /**
     * Works just like groupSet() except it will not overwrite existing property values. This is useful for properties like "First login date".
     *
     * @param prop The name of the Mixpanel property. This must be a String, for example "Zip Code"
     * @param to The value to set on the given property name. For "Zip Code", this value might be the String "90210"
     */
    setOnce(prop, to) {
        let properties = {};
        if (ObjectHelper.isValid(prop)) {
            properties = JSON.parse(JSON.stringify(prop || {}));
        } else {
            if (!StringHelper.isValid(prop)) {
                StringHelper.raiseError(PARAMS.PROP);
            }
            properties[prop] = to;
        }
        return MixpanelReactNative.groupSetPropertyOnce(this.token, this.groupKey, this.groupID, properties);
    }

    /**
     * Permanently removes the property with the given name from the group's profile
     * 
     * @param prop name of a property to unset
     */
    unset(prop) {
        if (!StringHelper.isValid(prop)) {
            StringHelper.raiseError(PARAMS.PROPERTY_NAME);
        }
        return MixpanelReactNative.groupUnsetProperty(this.token, this.groupKey, this.groupID, prop);
    }

    /**
     * Remove value from a list-valued property only if it is already present in the list.
     * If the property does not currently exist, the remove will be ignored.
     * If the property exists and is not list-valued, the remove will be ignored.
     * 
     * @param name the Group Analytics list-valued property that should have a value removed
     * @param value the value that will be removed from the list
     */
    remove(name, value) {
        if (!StringHelper.isValid(name)) {
            StringHelper.raiseError(PARAMS.PROPERTY_NAME);
        }

        return MixpanelReactNative.groupRemovePropertyValue(this.token, this.groupKey, this.groupID, name, value);
    }

    /**
     * Adds values to a list-valued property only if they are not already present in the list.
     * If the property does not currently exist, it will be created with the given list as its value.
     * If the property exists and is not list-valued, the union will be ignored.
     *
     * @param name name of the list-valued property to set or modify
     * @param value an array of values to add to the property value if not already present
     */
    union(name, value) {
        if (!StringHelper.isValid(name)) {
            StringHelper.raiseError(PARAMS.PROPERTY_NAME);
        }
        value = Array.isArray(value) ? value : [value];
        return MixpanelReactNative.groupUnionProperty(this.token, this.groupKey, this.groupID, name, value);
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
