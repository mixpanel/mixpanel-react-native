"use strict";

import { NativeModules } from 'react-native';
import packageJson from "./package.json";
const { MixpanelReactNative } = NativeModules;

if (!MixpanelReactNative) {
    throw new Error(`mixpanel-react-native: MixpanelReactNative is null. To fix this issue try these steps:
    • Run \`react-native link mixpanel-react-native\` in the project root.
    • Rebuild and re-run the app.
    • If you are using CocoaPods on iOS, run \`pod install\` in the \`ios\` directory and then rebuild and re-run the app. You may also need to re-open Xcode to get the new pods.
    If none of these fix the issue, please open an issue on the Github repository: https://github.com/mixpanel-react-native`);
}

var KEY = {
    DISTINCT_ID: "Distinct id",
    ALIAS: "Alias",
    EVENT_NAME: "Event name",
    PROPERTIES: "Properties",
    PROPERTY_NAME: "Property name",
    DEVICE_TOKEN: "Device token",
    TOKEN: "Token"
};

var ERROR_MESSAGE = {
    NEED_MP_TOKEN: "The Mixpanel Client needs a Mixpanel token: `Mixpanel.init(token)`",
    REQUIRED_PARAMETER: " is required",
    REQUIRED_OBJECT: " is required. Cannot be null or undefined",
    REQUIRED_DOUBLE: "expected parameter of type `double`"
};

var DEFAULT_OPT_OUT = false;

export default class Mixpanel {
    token: ?string;
    initialized: boolean;
    people: ?People;
    constructor(token) {   
        token = Helper.getValidString(token, KEY.Token);
        this.initialized = false;
        this.token = token;
        this.people = new People(this.token, this.initialized);
    }
    /**
      Initialize mixpanel setup
     */
    async init(optOutTrackingDefault = DEFAULT_OPT_OUT) {   
        let metadata = JSON.parse(JSON.stringify(packageJson.metadata));
        metadata["$lib_version"] = packageJson.version;
        await MixpanelReactNative.initialize(this.token, optOutTrackingDefault, metadata);
        this.initialized = true;
        this.people.initialized = true;
    }
    /**
      Returns if the current user has opted out tracking.
     */
    async hasOptedOutTracking() {
        return await MixpanelReactNative.hasOptedOutTracking(this.token);        
    }

    /**
      Opt in tracking.
      Use this method to opt in an already opted out user from tracking. People updates and track calls will be
      sent to Mixpanel after using this method.
     */
    async optInTracking(distinct_id, properties) {
        if (arguments.length === 0) {
            properties = {};
        } else if (typeof distinct_id === "string") {
            distinct_id = Helper.getValidString(distinct_id, KEY.DISTINCT_ID);
            properties = properties || {};
        } else if (typeof distinct_id === "object") {
            properties = distinct_id;
            distinct_id = null;
        }
        await MixpanelReactNative.optInTracking(this.token, distinct_id, properties);
    }

    /**
      Opt out tracking.
      This method is used to opt out tracking. This causes all events and people request no longer
      to be sent back to the Mixpanel server.
     */
    async optOutTracking() {
        await MixpanelReactNative.optOutTracking(this.token);
    }

    /**
      Identify a user with a unique ID instead of a Mixpanel
      randomly generated distinct_id. If the method is never called,
      then unique visitors will be identified by a UUID generated
      the first time they visit the site.
     */
    identify(distinct_id) {
        MixpanelReactNative.identify(this.token, Helper.getValidString(distinct_id, KEY.DISTINCT_ID));
    }

    /** 
      This function creates an alias for distinct_id
     */
    async alias(alias, distinct_id) {
        await MixpanelReactNative.alias(this.token, Helper.getValidString(alias, KEY.ALIAS), Helper.getValidString(distinct_id, KEY.DISTINCT_ID));
    }

    /**
      Track an event. 
     */
    async track(event_name, properties) {
        if (arguments.length === 0) {
            properties = {};
        } else if (typeof event_name === "string") {
            event_name = Helper.getValidString(event_name, KEY.EVENT_NAME);
            properties = properties || {};
        } else if (typeof event_name === "object") {
            properties = event_name;
            event_name = null;
        }
        await MixpanelReactNative.track(this.token, event_name, properties);
    }

    /**
      Register a set of super properties, which are included with all
      events. This will overwrite previous super property values.
     */
    async registerSuperProperties(properties) {
        properties = properties || {};
        await MixpanelReactNative.registerSuperProperties(this.token, properties);
    }

    /**
      Register a set of super properties only once. This will not
      overwrite previous super property values, unlike register().
     */
    async registerSuperPropertiesOnce(properties) {
        properties = properties || {};
        await MixpanelReactNative.registerSuperPropertiesOnce(this.token, properties);
    }

    /**
      Delete a super property stored with the current user.
     */
    async unregisterSuperProperty(property_name) {
        await MixpanelReactNative.unregisterSuperProperty(this.token, Helper.getValidString(property_name,KEY.PROPERTY_NAME));
    }

    /**
      Gets current user super property.
      For Android only
     */
    async getSuperProperties() {
        return await MixpanelReactNative.getSuperProperties(this.token);
    }

    /**
     Clears all currently set super properties.
     */
    async clearSuperProperties() {
        await MixpanelReactNative.clearSuperProperties(this.token);
    }

    /**
      Time an event by including the time between this call and a
      later 'track' call for the same event in the properties sent
      with the event.
     */
    async timeEvent(event_name) {
        await MixpanelReactNative.timeEvent(this.token, Helper.getValidString(event_name, KEY.EVENT_NAME));
    }

    /**
      Retrieves the time elapsed for the named event since time(event:) was called.
     */
    async eventElapsedTime(event_name) {
        return await MixpanelReactNative.eventElapsedTime(this.token, Helper.getValidString(event_name, KEY.EVENT_NAME));
    } 

    /**
      Clears super properties and generates a new random distinct_id for this instance.
      Useful for clearing data when a user logs out.
     */
    async reset() {
        await MixpanelReactNative.reset(this.token);
    }

    /**
      For Android only
     */
    async isIdentified() {
        return await MixpanelReactNative.isIdentified(this.token);
    }
     
    /**
      Uploads queued data to the Mixpanel server.
     */
    async flush() {
        await MixpanelReactNative.flush(this.token);
    }
}

export class People {
    token: ?string;
    initialized: boolean;

    constructor(token, initialized) {   
        this.token = token;
        this.initialized = initialized;
    }

    /**
      Identify a user with a unique ID instead of a Mixpanel
      randomly generated distinct_id. If the method is never called,
      then unique visitors will be identified by a UUID generated
      the first time they visit the site.
     */
    async identify(distinct_id) {
        await MixpanelReactNative.identify(this.token, Helper.getValidString(distinct_id, KEY.DISTINCT_ID));
    }

    /**
      Set properties on an user record in engage
     */
    async set(prop, to) {
        if (typeof prop === "object") {
            prop = prop || {};
            await MixpanelReactNative.set(this.token, prop);
        } 
        to = to || {};
        await MixpanelReactNative.setPropertyTo(this.token, Helper.getValidString(prop, KEY.PROPERTY_NAME), to);
    }

    /**
      The same as people.set but This method allows you to set a user attribute, only if it is not currently set.
     */
    async setOnce(properties) {
        properties = properties || {};
        await MixpanelReactNative.setOnce(this.token, properties);
    }

    /**
      Append a value to a list-valued people analytics property.
     */
    async trackCharge(charge, properties) {
        if (isNaN(parseFloat(charge))) {
            throw new Error(ERROR_MESSAGE.REQUIRED_DOUBLE )
        }
        properties = properties || {};
        await MixpanelReactNative.trackCharge(this.token, charge, properties);
    }

    /**
      Clear all the current user's transactions.
     */
    async clearCharges() {
        await MixpanelReactNative.clearCharges(this.token);
    }
 
    /**
      Increment/Decrement properties on an user record in engage
     */
    async increment(prop, by) {
        if (typeof prop === "object") {
            var add = {};
            Object.keys(prop).forEach(function(key) {
                var val = prop[key];
                if (isNaN(parseFloat(val))) {
                    throw new Error(ERROR_MESSAGE.REQUIRED_DOUBLE )
                }
             add[key] = val;
            });
          await MixpanelReactNative.increment(this.token, add);
        } else if (typeof by === "number" || !by) {
            by = by || 1; 
        }
        await MixpanelReactNative.incrementPropertyBy(this.token, Helper.getValidString(prop, KEY.PROPERTY_NAME), by);
    }

    /**
      Append a value to a list-valued people analytics property.
     */
    async append(name, properties) {
        properties = properties || {};
        await MixpanelReactNative.append(this.token, Helper.getValidString(name, KEY.PROPERTY_NAME), properties);
    }

    /**
      Delete an user record in engage
     */
    async deleteUser() {
        await MixpanelReactNative.deleteUser(this.token);
    }

    /**
      Removes list properties.
     */
    async remove(name, properties) {
        properties = properties || {};
        await MixpanelReactNative.remove(this.token, Helper.getValidString(name, KEY.PROPERTY_NAME), properties);
    }
    
    /**
      Adds values to a list-valued property only if they are not already present in the list.  
     */
    async union(name, properties) {
        await MixpanelReactNative.union(this.token, name, properties);
    }

    /**
      Remove a list of properties and their values from the current user's profile
      in Mixpanel People.
     */
    async unset(property_name) {
        await MixpanelReactNative.unset(this.token, property_name);
    }

    /**
      Register the given device to receive push notifications.
     */
    async setPushRegistrationId(deviceToken) {
        await MixpanelReactNative.setPushRegistrationId(this.token, Helper.getValidString(deviceToken, KEY.DEVICE_TOKEN));
    }

    /**
      For Android only
     */
    async getPushRegistrationId() {
        return await MixpanelReactNative.getPushRegistrationId(this.token);
    }

    /**
      Clears all currently set super properties.
     */
    async clearPushRegistrationId(deviceToken) {
        await MixpanelReactNative.clearPushRegistrationId(this.token, Helper.getValidString(deviceToken, KEY.DEVICE_TOKEN));
    }
}

class Helper {
    /**
     * Gets valid string 
     */
    static getValidString(str, parameter_name) {
    if (!str || str === "" ) {
        throw new Error(parameter_name + ERROR_MESSAGE.REQUIRED_PARAMETER );
    }
    return str;
   }
}

