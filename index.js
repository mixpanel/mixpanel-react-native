"use strict";

import {Platform, NativeModules} from "react-native";
import packageJson from "./package.json";
const {MixpanelReactNative} = NativeModules;
import MixpanelMain from "mixpanel-react-native/javascript/mixpanel-main"

const DevicePlatform = {
  Unknown: "Unknown",
  Android: "android",
  iOS: "ios",
};

const ERROR_MESSAGE = {
  INVALID_OBJECT: " is not a valid json object",
  INVALID_STRING: " is not a valid string",
  REQUIRED_DOUBLE: " is not a valid number",
};

const PARAMS = {
  TOKEN: "token",
  DISTINCT_ID: "distinctId",
  ALIAS: "alias",
  EVENT_NAME: "eventName",
  GROUP_KEY: "groupKey",
  PROPERTIES: "properties",
  PROPERTY_NAME: "propertyName",
  PROP: "prop",
  NAME: "name",
  CHARGE: "charge",
  PROPERTY_VALUE: "property value",
};

const DEFAULT_OPT_OUT = false;

/**
 * The primary class for integrating Mixpanel with your app.
 */
export class Mixpanel {
  constructor(token, trackAutomaticEvents, useNative = true, storage) {
    if (!StringHelper.isValid(token)) {
      StringHelper.raiseError(PARAMS.TOKEN);
    }
    if (trackAutomaticEvents == null) {
      throw new Error(`trackAutomaticEvents is undefined`);
    }
    this.token = token;
    this.trackAutomaticEvents = trackAutomaticEvents;

    if (useNative && MixpanelReactNative) {
      this.mixpanelImpl = MixpanelReactNative;
      return;
    } else if (useNative) {
      console.warn(
        "MixpanelReactNative is not available; using JavaScript mode. If you prefer not to use the JavaScript mode, please follow the guide in the GitHub repository: https://github.com/mixpanel/mixpanel-react-native."
      );
    }

    this.mixpanelImpl = new MixpanelMain(token, trackAutomaticEvents, storage);
  }

  /**
   * Initializes Mixpanel
   *
   * @param {boolean} optOutTrackingDefault Optional Whether or not Mixpanel can start tracking by default. See optOutTracking()
   * @param {object} superProperties  Optional A Map containing the key value pairs of the super properties to register
   * @param {string} serverURL Optional Set the base URL used for Mixpanel API requests. See setServerURL()
   * @param {boolean} useGzipCompression Optional Set whether to use gzip compression for network requests. Defaults to false.
   */
  async init(
    optOutTrackingDefault = DEFAULT_OPT_OUT,
    superProperties = {},
    serverURL = "https://api.mixpanel.com",
    useGzipCompression = false
  ) {
    await this.mixpanelImpl.initialize(
      this.token,
      this.trackAutomaticEvents,
      optOutTrackingDefault,
      {...Helper.getMetaData(), ...superProperties},
      serverURL,
      useGzipCompression
    );
  }

  /**
   * @deprecated since version 1.3.0. To initialize Mixpanel, please use the instance method `init` instead. See the example below:
   *
   * <pre><code>
   * const trackAutomaticEvents = true;
   * const mixpanel = new Mixpanel('your project token', trackAutomaticEvents);
   * mixpanel.init();
   * </code></pre>
   *
   * Initializes Mixpanel and return an instance of Mixpanel the given project token.
   *
   * @param {string} token your project token.
   * @param {boolean} trackAutomaticEvents Whether or not to automatically track common mobile events
   * @param {boolean} Optional Whether or not Mixpanel can start tracking by default. See optOutTracking()
   *
   */
  static async init(
    token,
    trackAutomaticEvents,
    optOutTrackingDefault = DEFAULT_OPT_OUT
  ) {
    await MixpanelReactNative.initialize(
      token,
      trackAutomaticEvents,
      optOutTrackingDefault,
      Helper.getMetaData(),
      "https://api.mixpanel.com"
    );
    return new Mixpanel(token, trackAutomaticEvents);
  }

  /**
   * Set the base URL used for Mixpanel API requests.
   * Useful if you need to proxy Mixpanel requests. Defaults to https://api.mixpanel.com.
   * To route data to Mixpanel's EU servers, set to https://api-eu.mixpanel.com
   *
   * @param {string} serverURL the base URL used for Mixpanel API requests
   *
   */
  setServerURL(serverURL) {
    this.mixpanelImpl.setServerURL(this.token, serverURL);
  }

  /**
   * This allows enabling or disabling of all Mixpanel logs at run time.
   * All logging is disabled by default. Usually, this is only required if
   * you are running into issues with the SDK that you want to debug
   *
   * @param {boolean} loggingEnabled whether to enable logging
   *
   */
  setLoggingEnabled(loggingEnabled) {
    this.mixpanelImpl.setLoggingEnabled(this.token, loggingEnabled);
  }

  /**
   * This allows enabling or disabling whether or not Mixpanel flushes events
   * when the app enters the background on iOS. This is set to true by default.
   *
   * @param {boolean} flushOnBackground whether to enable logging
   *
   */
  setFlushOnBackground(flushOnBackground) {
    if (Platform.OS === "ios") {
      MixpanelReactNative.setFlushOnBackground(this.token, flushOnBackground);
    } else {
      console.warn(
        "Mixpanel setFlushOnBackground was called and ignored because this method only works on iOS."
      );
    }
  }

  /**
   * This controls whether to automatically send the client IP Address as part of event tracking.
   * With an IP address, geo-location is possible down to neighborhoods within a city,
   * although the Mixpanel Dashboard will just show you city level location specificity.
   *
   * @param {boolean} useIpAddressForGeolocation whether to automatically send the client IP Address.
   * Defaults to true.
   *
   */
  setUseIpAddressForGeolocation(useIpAddressForGeolocation) {
    this.mixpanelImpl.setUseIpAddressForGeolocation(
      this.token,
      useIpAddressForGeolocation
    );
  }

  /**
   * Set the number of events sent in a single network request to the Mixpanel server.
   * By configuring this value, you can optimize network usage and manage the frequency of communication between the client and the server. The maximum size is 50; any value over 50 will default to 50.
   *
   * @param {integer} flushBatchSize whether to automatically send the client IP Address.
   * Defaults to true.
   *
   */
  setFlushBatchSize(flushBatchSize) {
    this.mixpanelImpl.setFlushBatchSize(this.token, flushBatchSize);
  }

  /**
   * Will return true if the user has opted out from tracking.
   *
   * @return {Promise<boolean>} true if user has opted out from tracking. Defaults to false.
   */
  hasOptedOutTracking() {
    return this.mixpanelImpl.hasOptedOutTracking(this.token);
  }

  /**
   * Use this method to opt-in an already opted-out user from tracking. People updates and track
   * calls will be sent to Mixpanel after using this method.
   * This method will internally track an opt-in event to your project.
   *
   */
  optInTracking() {
    this.mixpanelImpl.optInTracking(this.token);
  }

  /**
   * Use this method to opt-out a user from tracking. Events and people updates that haven't been
   * flushed yet will be deleted. Use flush() before calling this method if you want
   * to send all the queues to Mixpanel before.
   *
   * This method will also remove any user-related information from the device.
   */
  optOutTracking() {
    this.mixpanelImpl.optOutTracking(this.token);
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
   * @param {string} distinctId a string uniquely identifying this user. Events sent to
   *     Mixpanel using the same disinct_id will be considered associated with the
   *     same visitor/customer for retention and funnel reporting, so be sure that the given
   *     value is globally unique for each individual user you intend to track.
   * @returns {Promise} A promise that resolves when the identify is successful.
   *     It does not return any value.
   *
   */
  identify(distinctId) {
    return new Promise((resolve, reject) => {
      if (!StringHelper.isValid(distinctId)) {
        StringHelper.raiseError(PARAMS.DISTINCT_ID);
        reject(new Error("Invalid distinctId"));
      }
      this.mixpanelImpl
        .identify(this.token, distinctId)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * @deprecated The alias method creates an alias which Mixpanel will use to remap one id to another.
   * Multiple aliases can point to the same identifier.
   *
   *  `mixpane.alias("New ID", mixpane.distinctId)`
   *  `mixpane.alias("Newer ID", mixpane.distinctId)`
   *
   * <p>This call does not identify the user after. You must still call identify()
   *  if you wish the new alias to be used for Events and People.
   *
   * @param {string} alias A unique identifier that you want to use as an identifier for this user.
   * @param {string} distinctId the current distinct_id that alias will be mapped to.
   */
  alias(alias, distinctId) {
    if (!StringHelper.isValid(alias)) {
      StringHelper.raiseError(PARAMS.ALIAS);
    }
    if (!StringHelper.isValid(distinctId)) {
      StringHelper.raiseError(PARAMS.DISTINCT_ID);
    }
    this.mixpanelImpl.alias(this.token, alias, distinctId);
  }

  /**
   * Track an event.
   *
   * <p>Every call to track eventually results in a data point sent to Mixpanel. These data points
   * are what are measured, counted, and broken down to create your Mixpanel reports. Events
   * have a string name, and an optional set of name/value pairs that describe the properties of
   * that event.
   *
   * @param {string} eventName The name of the event to send
   * @param {object} properties A Map containing the key value pairs of the properties to include in this event.
   *                   Pass null if no extra properties exist.
   */
  track(eventName, properties) {
    if (!StringHelper.isValid(eventName)) {
      StringHelper.raiseError(PARAMS.EVENT_NAME);
    }
    if (!ObjectHelper.isValidOrUndefined(properties)) {
      ObjectHelper.raiseError(PARAMS.PROPERTIES);
    }
    this.mixpanelImpl.track(this.token, eventName, {
      ...Helper.getMetaData(),
      ...properties,
    });
  }

  /**
   * Returns a Mixpanel People object that can be used to set and increment
   * People Analytics properties.
   *
   * @return {People} an instance of People that you can use to update
   *     records in Mixpanel People Analytics
   */
  getPeople() {
    if (this.people) {
      return this.people;
    } else {
      this.people = new People(this.token, this.mixpanelImpl);
      return this.people;
    }
  }

  /**
   * Track an event with specific groups.
   *
   * <p>Every call to track eventually results in a data point sent to Mixpanel. These data points
   * are what are measured, counted, and broken down to create your Mixpanel reports. Events
   * have a string name, and an optional set of name/value pairs that describe the properties of
   * that event. Group key/value pairs are upserted into the property map before tracking.
   *
   * @param {string} eventName The name of the event to send
   * @param {object} properties A Map containing the key value pairs of the properties to include in this event.
   *                   Pass null if no extra properties exist.
   * @param {object} groups A Map containing the group key value pairs for this event.
   *
   */
  trackWithGroups(eventName, properties, groups) {
    if (!StringHelper.isValid(eventName)) {
      StringHelper.raiseError(PARAMS.EVENT_NAME);
    }
    if (!ObjectHelper.isValidOrUndefined(properties)) {
      ObjectHelper.raiseError(PARAMS.PROPERTIES);
    }
    this.mixpanelImpl.trackWithGroups(
      this.token,
      eventName,
      {
        ...Helper.getMetaData(),
        ...properties,
      },
      groups
    );
  }

  /**
   * Set the group this user belongs to.
   *
   * @param {string} groupKey The property name associated with this group type (must already have been set up).
   * @param {object} groupID The group the user belongs to.
   */
  setGroup(groupKey, groupID) {
    if (!StringHelper.isValid(groupKey)) {
      StringHelper.raiseError(PARAMS.GROUP_KEY);
    }
    this.mixpanelImpl.setGroup(this.token, groupKey, groupID);
  }

  /**
   * Returns a MixpanelGroup object that can be used to set and increment
   * Group Analytics properties.
   *
   * @param {string} groupKey String identifying the type of group (must be already in use as a group key)
   * @param {object} groupID Object identifying the specific group
   * @return an instance of MixpanelGroup that you can use to update
   *     records in Mixpanel Group Analytics
   */
  getGroup(groupKey, groupID) {
    if (this.group) {
      return this.group;
    } else {
      this.group = new MixpanelGroup(
        this.token,
        groupKey,
        groupID,
        this.mixpanelImpl
      );
      return this.group;
    }
  }

  /**
   * Add a group to this user's membership for a particular group key
   *
   * @param {string} groupKey The property name associated with this group type (must already have been set up).
   * @param {object} groupID The new group the user belongs to.
   */
  addGroup(groupKey, groupID) {
    if (!StringHelper.isValid(groupKey)) {
      StringHelper.raiseError(PARAMS.GROUP_KEY);
    }
    this.mixpanelImpl.addGroup(this.token, groupKey, groupID);
  }

  /**
   * Remove a group from this user's membership for a particular group key
   *
   * @param {string} groupKey The property name associated with this group type (must already have been set up).
   * @param {object} groupID The group value to remove.
   */
  removeGroup(groupKey, groupID) {
    if (!StringHelper.isValid(groupKey)) {
      StringHelper.raiseError(PARAMS.GROUP_KEY);
    }
    this.mixpanelImpl.removeGroup(this.token, groupKey, groupID);
  }

  /**
   * Permanently deletes this group's record from Group Analytics.
   *
   * @param {string} groupKey String identifying the type of group (must be already in use as a group key)
   * @param {object} groupID Object identifying the specific group
   * <p>Calling deleteGroup deletes an entire record completely. Any future calls
   * to Group Analytics using the same group value will create and store new values.
   */
  deleteGroup(groupKey, groupID) {
    if (!StringHelper.isValid(groupKey)) {
      StringHelper.raiseError(PARAMS.GROUP_KEY);
    }
    this.mixpanelImpl.deleteGroup(this.token, groupKey, groupID);
  }

  /**
   * Register properties that will be sent with every subsequent call to track().
   *
   * <p>SuperProperties are a collection of properties that will be sent with every event to Mixpanel,
   * and persist beyond the lifetime of your application.
   *
   * <p>Setting a superProperty with registerSuperProperties will store a new superProperty,
   * possibly overwriting any existing superProperty with the same name (to set a
   * superProperty only if it is currently unset, use registerSuperPropertiesOnce())
   *
   * <p>SuperProperties will persist even if your application is taken completely out of memory.
   * to remove a superProperty, call unregisterSuperProperty() or clearSuperProperties()
   *
   * @param {object} properties A Map containing super properties to register
   */
  registerSuperProperties(properties) {
    if (!ObjectHelper.isValidOrUndefined(properties)) {
      ObjectHelper.raiseError(PARAMS.PROPERTIES);
    }
    this.mixpanelImpl.registerSuperProperties(this.token, properties || {});
  }

  /**
   * Register super properties for events, only if no other super property with the
   * same names has already been registered.
   *
   * <p>Calling registerSuperPropertiesOnce will never overwrite existing properties.
   *
   * @param {object} properties A Map containing the super properties to register.
   */
  registerSuperPropertiesOnce(properties) {
    if (!ObjectHelper.isValidOrUndefined(properties)) {
      ObjectHelper.raiseError(PARAMS.PROPERTIES);
    }
    this.mixpanelImpl.registerSuperPropertiesOnce(this.token, properties || {});
  }

  /**
   * Remove a single superProperty, so that it will not be sent with future calls to track().
   *
   * <p>If there is a superProperty registered with the given name, it will be permanently
   * removed from the existing superProperties.
   * To clear all superProperties, use clearSuperProperties()
   *
   * @param {string} propertyName name of the property to unregister
   */
  unregisterSuperProperty(propertyName) {
    if (!StringHelper.isValid(propertyName)) {
      StringHelper.raiseError(PARAMS.PROPERTY_NAME);
    }
    this.mixpanelImpl.unregisterSuperProperty(this.token, propertyName);
  }

  /**
   * Returns a json object of the user's current super properties
   *
   *<p>SuperProperties are a collection of properties that will be sent with every event to Mixpanel,
   * and persist beyond the lifetime of your application.
   *
   * @return {Promise<object>} Super properties for this Mixpanel instance.
   */
  getSuperProperties() {
    return this.mixpanelImpl.getSuperProperties(this.token);
  }

  /**
   * Erase all currently registered superProperties.
   *
   * <p>Future tracking calls to Mixpanel will not contain the specific
   * superProperties registered before the clearSuperProperties method was called.
   *
   * <p>To remove a single superProperty, use unregisterSuperProperty()
   */
  clearSuperProperties() {
    this.mixpanelImpl.clearSuperProperties(this.token);
  }

  /**
   * Begin timing of an event. Calling timeEvent("Thing") will not send an event, but
   * when you eventually call track("Thing"), your tracked event will be sent with a "$duration"
   * property, representing the number of seconds between your calls.
   *
   * @param {string} eventName the name of the event to track with timing.
   */
  timeEvent(eventName) {
    if (!StringHelper.isValid(eventName)) {
      StringHelper.raiseError(PARAMS.EVENT_NAME);
    }
    this.mixpanelImpl.timeEvent(this.token, eventName);
  }

  /**
   * Retrieves the time elapsed for the named event since timeEvent() was called.
   *
   * @param {string} eventName the name of the event to be tracked that was previously called with timeEvent()
   *
   * @return {Promise<number>} Time elapsed since timeEvent(String) was called for the given eventName.
   */
  eventElapsedTime(eventName) {
    if (!StringHelper.isValid(eventName)) {
      StringHelper.raiseError(PARAMS.EVENT_NAME);
    }
    return this.mixpanelImpl.eventElapsedTime(this.token, eventName);
  }

  /**
      Clear super properties and generates a new random distinctId for this instance.
      Useful for clearing data when a user logs out.
     */
  reset() {
    this.mixpanelImpl.reset(this.token);
  }

  /**
   * Returns the current distinct id of the user.
   * This is either the id automatically generated by the library or the id that has been passed by a call to identify().
   *
   * example of usage:
   * <pre>
   * <code>
   * const distinctId = await mixpanel.getDistinctId();
   * </code>
   * </pre>
   *
   * @return {Promise<string>} A Promise to the distinct id associated with Mixpanel event and People Analytics
   *
   */
  getDistinctId() {
    return this.mixpanelImpl.getDistinctId(this.token);
  }

  /**
   * Returns the current device id of the device.
   * This id automatically generated by the library and regenerated when logout or reset is called.
   *
   * example of usage:
   * <pre>
   * <code>
   * const deviceId = await mixpanel.getDeviceId();
   * </code>
   * </pre>
   *
   * @return {Promise<string>} A Promise to the device id
   *
   */
  getDeviceId() {
    return this.mixpanelImpl.getDeviceId(this.token);
  }

  /**
   * Push all queued Mixpanel events and People Analytics changes to Mixpanel servers.
   *
   * <p>Events and People messages are pushed gradually throughout
   * the lifetime of your application. This means that to ensure that all messages
   * are sent to Mixpanel when your application is shut down, you will
   * need to call flush() to let the Mixpanel library know it should
   * send all remaining messages to the server.
   */
  flush() {
    this.mixpanelImpl.flush(this.token);
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
  constructor(token, mixpanelImpl) {
    if (!StringHelper.isValid(token)) {
      StringHelper.raiseError(PARAMS.TOKEN);
    }
    this.token = token;
    this.mixpanelImpl = mixpanelImpl;
  }

  /**
   * Sets a single property with the given name and value for this user.
   * The given name and value will be assigned to the user in Mixpanel People Analytics,
   * possibly overwriting an existing property with the same name.
   *
   * @param {string} prop The name of the Mixpanel property. This must be a String, for example "Zip Code"
   * @param {object} to The value of the Mixpanel property. For "Zip Code", this value might be the String "90210"
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
    this.mixpanelImpl.set(this.token, properties);
  }

  /**
   * Works just like set(), except it will not overwrite existing property values. This is useful for properties like "First login date".
   *
   * @param {string} prop The name of the Mixpanel property. This must be a String, for example "Zip Code"
   * @param {object} to The value of the Mixpanel property. For "Zip Code", this value might be the String "90210"
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
    this.mixpanelImpl.setOnce(this.token, properties);
  }

  /**
   * Add the given amount to an existing property on the identified user. If the user does not already
   * have the associated property, the amount will be added to zero. To reduce a property,
   * provide a negative number for the value.
   *
   * @param {string} prop the People Analytics property that should have its value changed
   * @param {number} by the amount to be added to the current value of the named property
   *
   */
  increment(prop, by) {
    var add = {};
    if (ObjectHelper.isValid(prop)) {
      Object.keys(prop).forEach(function (key) {
        var val = prop[key];
        if (isNaN(parseFloat(val))) {
          throw new Error(
            `${PARAMS.PROPERTY_VALUE}${ERROR_MESSAGE.REQUIRED_DOUBLE}`
          );
        }
        add[key] = val;
      });
    } else {
      by = by || 1;
      if (isNaN(parseFloat(by))) {
        throw new Error(
          `${PARAMS.PROPERTY_VALUE}${ERROR_MESSAGE.REQUIRED_DOUBLE}`
        );
      }

      if (!StringHelper.isValid(prop)) {
        StringHelper.raiseError(PARAMS.NAME);
      }

      add[prop] = by;
    }
    this.mixpanelImpl.increment(this.token, add);
  }

  /**
   * Appends a value to a list-valued property. If the property does not currently exist,
   * it will be created as a list of one element. If the property does exist and doesn't
   * currently have a list value, the append will be ignored.
   * @param {string} name the People Analytics property that should have it's value appended to
   * @param {object} value the new value that will appear at the end of the property's list
   */
  append(name, value) {
    let appendProp = {};
    if (!StringHelper.isValid(name)) {
      StringHelper.raiseError(PARAMS.NAME);
    } else {
      appendProp[name] = value;
    }

    if (DevicePlatform.iOS === Helper.getDevicePlatform()) {
      this.mixpanelImpl.append(this.token, appendProp);
    } else {
      this.mixpanelImpl.append(this.token, name, value);
    }
  }

  /**
   * Adds values to a list-valued property only if they are not already present in the list.
   * If the property does not currently exist, it will be created with the given list as it's value.
   * If the property exists and is not list-valued, the union will be ignored.
   *
   * @param {string} name name of the list-valued property to set or modify
   * @param {array} value an array of values to add to the property value if not already present
   */
  union(name, value) {
    if (!StringHelper.isValid(name)) {
      StringHelper.raiseError(PARAMS.NAME);
    }

    value = Array.isArray(value) ? value : [value];

    if (DevicePlatform.iOS === Helper.getDevicePlatform()) {
      this.mixpanelImpl.union(this.token, {[name]: value});
      this.mixpanelImpl.union(this.token, {[name]: value});
    } else {
      this.mixpanelImpl.union(this.token, name, value);
    }
  }

  /**
   * Remove value from a list-valued property only if they are already present in the list.
   * If the property does not currently exist, the remove will be ignored.
   * If the property exists and is not list-valued, the remove will be ignored.
   * @param {string} name the People Analytics property that should have it's value removed from
   * @param {object} value the value that will be removed from the property's list
   */
  remove(name, value) {
    let removeProp = {};
    if (!StringHelper.isValid(name)) {
      StringHelper.raiseError(PARAMS.NAME);
    } else {
      removeProp[name] = value;
    }

    if (DevicePlatform.iOS === Helper.getDevicePlatform()) {
      this.mixpanelImpl.remove(this.token, removeProp);
    } else {
      this.mixpanelImpl.remove(this.token, name, value);
    }
  }

  /**
   * permanently removes the property with the given name from the user's profile
   * @param {string} name name of a property to unset
   */
  unset(name) {
    if (!StringHelper.isValid(name)) {
      StringHelper.raiseError(PARAMS.PROPERTY_NAME);
    }
    this.mixpanelImpl.unset(this.token, name);
  }

  /**
   * Track a revenue transaction for the identified people profile.
   *
   * @param {number} charge the amount of money exchanged. Positive amounts represent purchases or income from the customer, negative amounts represent refunds or payments to the customer.
   * @param {object} properties an optional collection of properties to associate with this transaction.
   */
  trackCharge(charge, properties) {
    if (isNaN(parseFloat(charge))) {
      throw new Error(`${PARAMS.CHARGE}${ERROR_MESSAGE.REQUIRED_DOUBLE}`);
    }

    if (!ObjectHelper.isValidOrUndefined(properties)) {
      ObjectHelper.raiseError(PARAMS.PROPERTIES);
    }
    this.mixpanelImpl.trackCharge(this.token, charge, properties || {});
  }

  /**
   * Permanently clear the whole transaction history for the identified people profile.
   */
  clearCharges() {
    this.mixpanelImpl.clearCharges(this.token);
  }

  /**
   * Permanently deletes the identified user's record from People Analytics.
   *
   * <p>Calling deleteUser deletes an entire record completely. Any future calls
   * to People Analytics using the same distinct id will create and store new values.
   */
  deleteUser() {
    this.mixpanelImpl.deleteUser(this.token);
  }
}

/**
 * Core class for using Mixpanel Group Analytics features.
 *
 * <p>The MixpanelGroup object is used to update properties in a group's Group Analytics record.
 */
export class MixpanelGroup {
  constructor(token, groupKey, groupID, mixpanelImpl) {
    if (!StringHelper.isValid(token)) {
      StringHelper.raiseError(PARAMS.TOKEN);
    }
    this.token = token;
    this.groupKey = groupKey;
    this.groupID = groupID;
    this.mixpanelImpl = mixpanelImpl;
  }

  /**
   * Sets a single property with the given name and value for this group.
   * The given name and value will be assigned to the user in Mixpanel Group Analytics,
   * possibly overwriting an existing property with the same name.
   *
   * @param {string} prop The name of the Mixpanel property. This must be a String, for example "Zip Code"
   * @param {string} to The value to set on the given property name. For "Zip Code", this value might be the String "90210"
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
    this.mixpanelImpl.groupSetProperties(
      this.token,
      this.groupKey,
      this.groupID,
      properties
    );
  }

  /**
   * Works just like groupSet() except it will not overwrite existing property values. This is useful for properties like "First login date".
   *
   * @param {string} prop The name of the Mixpanel property. This must be a String, for example "Zip Code"
   * @param {string} to The value to set on the given property name. For "Zip Code", this value might be the String "90210"
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
    this.mixpanelImpl.groupSetPropertyOnce(
      this.token,
      this.groupKey,
      this.groupID,
      properties
    );
  }

  /**
   * Permanently removes the property with the given name from the group's profile
   *
   * @param {string} prop name of a property to unset
   */
  unset(prop) {
    if (!StringHelper.isValid(prop)) {
      StringHelper.raiseError(PARAMS.PROPERTY_NAME);
    }
    this.mixpanelImpl.groupUnsetProperty(
      this.token,
      this.groupKey,
      this.groupID,
      prop
    );
  }

  /**
   * Remove value from a list-valued property only if it is already present in the list.
   * If the property does not currently exist, the remove will be ignored.
   * If the property exists and is not list-valued, the remove will be ignored.
   *
   * @param {string} name the Group Analytics list-valued property that should have a value removed
   * @param {any} value the value that will be removed from the list
   */
  remove(name, value) {
    if (!StringHelper.isValid(name)) {
      StringHelper.raiseError(PARAMS.PROPERTY_NAME);
    }

    this.mixpanelImpl.groupRemovePropertyValue(
      this.token,
      this.groupKey,
      this.groupID,
      name,
      value
    );
  }

  /**
   * Adds values to a list-valued property only if they are not already present in the list.
   * If the property does not currently exist, it will be created with the given list as its value.
   * If the property exists and is not list-valued, the union will be ignored.
   *
   * @param {string} name name of the list-valued property to set or modify
   * @param {array} value an array of values to add to the property value if not already present
   */
  union(name, value) {
    if (!StringHelper.isValid(name)) {
      StringHelper.raiseError(PARAMS.PROPERTY_NAME);
    }
    value = Array.isArray(value) ? value : [value];
    this.mixpanelImpl.groupUnionProperty(
      this.token,
      this.groupKey,
      this.groupID,
      name,
      value
    );
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
      case "android":
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
    return typeof str === "string" && !/^\s*$/.test(str);
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
