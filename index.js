"use strict";

import { NativeModules } from 'react-native';

const { MixpanelReactNative } = NativeModules;

var KEY = {
    DISTINCT_ID: "Distinct id",
    ALIAS: "Alias",
    EVENT_NAME: "Event name",
    PROPERTIES: "Properties",
    PROPERTY_NAME: "Property name"
};

var ERROR_MESSAGE = {
    NEED_MP_TOKEN: "The Mixpanel Client needs a Mixpanel token: `init(token)`",
    REQUIRED_PARAMETER: " is required",
    REQUIRED_OBJECT: " is required. Cannot be null or undefined",
    REQUIRED_DOUBLE: "expected parameter of type `double`"
};

var DEFAULT_OPT_OUT = false;

export class Mixpanel {
    apiToken = "";
    people = this.people = new People();      
   
    getInstance(token) {
        if (!token || token === "") {
            throw new Error(ERROR_MESSAGE.NEED_MP_TOKEN);
        }
        this.apiToken = token;
        return MixpanelReactNative.getInstance(this.apiToken, DEFAULT_OPT_OUT);
    }

    /**
      Returns if the current user has opted out tracking.
     */
    hasOptedOutTracking() {
        return MixpanelReactNative.hasOptedOutTracking();
    }

    /**
      Opt in tracking.
      Use this method to opt in an already opted out user from tracking. People updates and track calls will be
      sent to Mixpanel after using this method.
     */
    optInTracking(distinct_id, properties) {
        if (arguments.length === 0) {
            properties = {};
        } else if (typeof distinct_id === "string") {
            distinct_id = Helper.getValidString(distinct_id, KEY.DISTINCT_ID);
            properties = properties || {};
        } else if (typeof distinct_id === "object") {
            properties = distinct_id;
            distinct_id = null;
        }
        return MixpanelReactNative.optInTracking(distinct_id, properties);
    }

    /**
      Opt out tracking.
      This method is used to opt out tracking. This causes all events and people request no longer
      to be sent back to the Mixpanel server.
     */
    optOutTracking() {
        return MixpanelReactNative.optOutTracking();
    }

    /**
      Identify a user with a unique ID instead of a Mixpanel
      randomly generated distinct_id. If the method is never called,
      then unique visitors will be identified by a UUID generated
      the first time they visit the site.
     */
    identify(distinct_id) {
        return MixpanelReactNative.identify(Helper.getValidString(distinct_id, KEY.DISTINCT_ID));
    }

    /** 
      This function creates an alias for distinct_id
     */
    alias(alias, distinct_id) {
        return MixpanelReactNative.alias(Helper.getValidString(alias, KEY.ALIAS), Helper.getValidString(distinct_id, KEY.DISTINCT_ID));
    }

    /**
      Track an event. 
     */
    track(event_name, properties) {
        if (arguments.length === 0) {
            properties = {};
        } else if (typeof event_name === "string") {
            event_name = Helper.getValidString(event_name, KEY.EVENT_NAME);
            properties = properties || {};
        } else if (typeof event_name === "object") {
            properties = event_name;
            event_name = null;
        }
        return MixpanelReactNative.track(event_name, properties);
    }

    /**
      Register a set of super properties, which are included with all
      events. This will overwrite previous super property values.
     */
    registerSuperProperties(properties) {
        properties = properties || {};
        return MixpanelReactNative.registerSuperProperties(properties);
    }

    /**
      Register a set of super properties only once. This will not
      overwrite previous super property values, unlike register().
     */
    registerSuperPropertiesOnce(properties) {
        properties = properties || {};
        return MixpanelReactNative.registerSuperPropertiesOnce(properties);
    }

    /**
      Delete a super property stored with the current user.
     */
    unregisterSuperProperty(property_name) {
        return MixpanelReactNative.unregisterSuperProperty(Helper.getValidString(property_name,KEY.PROPERTY_NAME));
    }

    /**
      Gets current user super property.
      For Android only
     */
    getSuperProperties() {
        return MixpanelReactNative.getSuperProperties();
    }

    /**
     Clears all currently set super properties.
     */
    clearSuperProperties() {
        return MixpanelReactNative.clearSuperProperties();
    }

    /**
      Time an event by including the time between this call and a
      later 'track' call for the same event in the properties sent
      with the event.
     */
    timeEvent(event_name) {
        return MixpanelReactNative.timeEvent(Helper.getValidString(event_name, KEY.EVENT_NAME));
    }

    /**
      Retrieves the time elapsed for the named event since time(event:) was called.
     */
    eventElapsedTime(event_name) {
        return MixpanelReactNative.eventElapsedTime(Helper.getValidString(event_name, KEY.EVENT_NAME));
    } 

    /**
      Clears super properties and generates a new random distinct_id for this instance.
      Useful for clearing data when a user logs out.
     */
    reset() {
        return MixpanelReactNative.reset();
    }

    /**
      For Android only
     */
    isIdentified() {
        return MixpanelReactNative.isIdentified();
    }
     
    /**
      Uploads queued data to the Mixpanel server.
     */
    flush() {
        return MixpanelReactNative.flush();
    }
}

export class People {
    
    /**
      Identify a user with a unique ID instead of a Mixpanel
      randomly generated distinct_id. If the method is never called,
      then unique visitors will be identified by a UUID generated
      the first time they visit the site.
     */
    identify(distinct_id) {
        return MixpanelReactNative.identify(Helper.getValidString(distinct_id, KEY.DISTINCT_ID));
    }

    /**
      Set properties on an user record in engage
     */
    set(prop, to) {
        if (typeof prop === "object") {
            prop = prop || {};
            return MixpanelReactNative.set(prop);
        } 
        return MixpanelReactNative.setPropertyTo(Helper.getValidString(prop, KEY.PROPERTY_NAME), to);
    }

    /**
      The same as people.set but This method allows you to set a user attribute, only if it is not currently set.
     */
    setOnce(properties) {
        properties = properties || {};
        return MixpanelReactNative.setOnce(properties);
    }

    /**
      Append a value to a list-valued people analytics property.
     */
    trackCharge(charge, properties) {
        if (isNaN(parseFloat(charge))) {
            throw new Error(ERROR_MESSAGE.REQUIRED_DOUBLE )
        }
        properties = properties || {};
        return MixpanelReactNative.trackCharge(charge, properties);
    }

    /**
      Clear all the current user's transactions.
     */
    clearCharges() {
        return MixpanelReactNative.clearCharges();
    }
 
    /**
      Increment/Decrement properties on an user record in engage
     */
    increment(prop, by) {
        if (typeof prop === "object") {
            var add = {};
            Object.keys(prop).forEach(function(key) {
                var val = prop[key];
                if (isNaN(parseFloat(val))) {
                    throw new Error(ERROR_MESSAGE.REQUIRED_DOUBLE )
                }
             add[key] = val;
            });
          return MixpanelReactNative.increment(add);
        }else if (typeof by === "number" || !by) {
            by = by || 1; 
        }
        return MixpanelReactNative.incrementPropertyBy(prop, by);
    }

    /**
      Append a value to a list-valued people analytics property.
     */
    append(name, properties) {
        properties = properties || {};
        return MixpanelReactNative.append(Helper.getValidString(name, KEY.PROPERTY_NAME), properties);
    }

    /**
      Delete an user record in engage
     */
    deleteUser() {
        return MixpanelReactNative.deleteUser();
    }

    /**
      Removes list properties.
     */
    remove(name, properties) {
        properties = properties || {};
        return MixpanelReactNative.remove(Helper.getValidString(name, KEY.PROPERTY_NAME), properties);
    }

    /**
      Remove a list of properties and their values from the current user's profile
      in Mixpanel People.
     */
    unset(property_name) {
        return MixpanelReactNative.unset(property_name);
    }

    /**
      Register the given device to receive push notifications.
     */
    setPushRegistrationId(token) {
        return MixpanelReactNative.setPushRegistrationId(token);
    }

    /**
      For Android only
     */
    getPushRegistrationId() {
        return MixpanelReactNative.getPushRegistrationId();
    }

    /**
      Clears all currently set super properties.
     */
    clearPushRegistrationId(token) {
        return MixpanelReactNative.clearPushRegistrationId(token);
    }
}

class Helper {
    static getValidString(str, parameter_name) {
    if (!str || str === "" ) {
        throw new Error(parameter_name + ERROR_MESSAGE.REQUIRED_PARAMETER );
    }
    return str;
   }
}

const mixpanel = new Mixpanel();
export default mixpanel;