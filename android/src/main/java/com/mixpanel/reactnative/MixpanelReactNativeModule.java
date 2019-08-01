package com.mixpanel.reactnative;

import com.mixpanel.android.mpmetrics.MixpanelAPI;

import com.facebook.common.references.SharedReference;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

public class MixpanelReactNativeModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext mReactContext;
    private MixpanelAPI mInstance;

    public MixpanelReactNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "MixpanelReactNative";
    }

    @ReactMethod
    public void getInformation(Promise promise) {
        promise.resolve(Constant.LIBRARY_INVOKED);
    }

    /**
     * Get the instance of MixpanelAPI with providing your project token
     * and boolean value for opting out tracking,  default value for optOutTrackingDefault is
     * false by setting it to true will prevent data from being collected by default
     * This instance of MixpanelAPI you can use to send events and updates to Mixpanel.
     */
    @ReactMethod
    public void getInstance(String mpToken, boolean optOutTrackingDefault, Promise promise) {
        MixpanelAPI mpInstance = MixpanelAPI.getInstance(this.mReactContext, mpToken, optOutTrackingDefault);
        if (mpInstance == null) {
            throw new SharedReference.NullReferenceException();
        } else {
            mInstance = mpInstance;
            promise.resolve(Constant.GET_INSTANCE_SUCCESS);
        }
    }

    /**
     * This method Will return true if the user has opted out from tracking.
     */
    @ReactMethod
    public void hasOptedOutTracking(Promise promise) {
        if (mInstance == null) {
            throw new SharedReference.NullReferenceException();
        } else {
            promise.resolve(mInstance.hasOptedOutTracking());
        }
    }

    /**
     * Use this method to opt-in an already opted-out user from tracking.
     * String to use as the distinct ID for events. This will call identify(String).
     * Optional JSONObject that could be passed to add properties to the opt-in event that is sent to Mixpanel.
     * People updates and track calls will be sent to Mixpanel after using this method.
     * This method will internally track an opt-in event to your project.
     */
    @ReactMethod
    public void optInTracking(final String distinctId, ReadableMap properties, Promise promise) {
         JSONObject eventProperties = null;
        try {
            eventProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(eventProperties);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || eventProperties == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.optInTracking(distinctId, eventProperties);
            promise.resolve(Constant.OPT_IN_SUCCESS);
        }
    }

    /**
     * By calling this method user opted out from tracking and before calling this method
     * call flush() if you want to send all the events or updates to Mixpanel otherwise it will be deleted.
     */
    @ReactMethod
    public void optOutTracking(Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.optOutTracking();
            promise.resolve(Constant.OPT_OUT_SUCCESS);
        }
    }

    /**
     * Identify the user uniquely by providing the user distinct id, so all the event, update ,track call
     * will manipulate the data only for identified users profile.
     * This call does not identify the user for People Analytics to do that you have to call
     * MixpanelAPI.People.identify(String) method.
     */
    @ReactMethod
    public void identify(final String distinctId, Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.identify(distinctId);
            mInstance.getPeople().identify(distinctId);
            promise.resolve(Constant.IDENTIFIED_SUCCESS);
        }
    }

    /**
     * Returns the string id currently being used to uniquely identify the user associated with events.
     */
    @ReactMethod
    public void getDistinctId(Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            promise.resolve(mInstance.getDistinctId());
        }
    }

    /**
     * Use for Track an event.
     * Every call to track eventually results in a data point sent to Mixpanel.
     * These data points are what are measured, counted, and broken down to create your Mixpanel reports.
     * Events have a string name, and an optional set of name/value pairs that describe the properties of that event.
     */
    @ReactMethod
    public void track(final String eventName, ReadableMap properties, Promise promise) throws JSONException {
        JSONObject eventProperties = null;
        try {
            eventProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(eventProperties);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || eventProperties == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.track(eventName, eventProperties);
            promise.resolve(Constant.EVENT_TRACK_SUCCESS);
        }
    }

    /**
     * Track an event.
     * <p>
     * Every call to track eventually results in a data point sent to Mixpanel.
     * These data points are what are measured, counted, and broken down to create your Mixpanel reports.
     * Events have a string name, and an optional set of name/value pairs that describe the properties of
     * that event.
     *
     * @param eventName  The name of the event to send
     * @param properties A Map containing the key value pairs of the properties to include in this event.
     *                   Pass null if no extra properties exist.
     */
    @ReactMethod
    public void trackMap(String eventName, ReadableMap properties, Promise promise) {
        Map eventProperties = ReactNativeHelper.toMap(properties);
        if (mInstance == null || eventProperties == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.trackMap(eventName, eventProperties);
            promise.resolve(Constant.EVENT_TRACK_SUCCESS);
        }
    }

    /**
     * registerSuperProperties will store a new superProperty and possibly overwriting any existing superProperty with the same name.
     * Register properties that will be sent with every subsequent call to track().
     */
    @ReactMethod
    public void registerSuperProperties(ReadableMap properties, Promise promise) {
        JSONObject superProperties = null;
        try {
            superProperties = ReactNativeHelper.reactToJSON(properties);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || superProperties == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.registerSuperProperties(superProperties);
            promise.resolve(Constant.REGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }

    /**
     * Register super properties for events, only if no other super property with the same names has already been registered.
     * Calling registerSuperPropertiesOnce will never overwrite existing properties.
     */
    @ReactMethod
    public void registerSuperPropertiesOnce(ReadableMap properties, Promise promise) {
        JSONObject superProperties = null;
        try {
            superProperties = ReactNativeHelper.reactToJSON(properties);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || superProperties == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.registerSuperPropertiesOnce(superProperties);
            promise.resolve(Constant.REGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }

    /**
     * registerSuperPropertiesMap will store a new superProperty and possibly overwriting any existing superProperty with the same name.
     * Register properties that will be sent with every subsequent call to track().
     *
     * @param properties A Map containing super properties to register
     */
    @ReactMethod
    public void registerSuperPropertiesMap(ReadableMap properties, Promise promise) {
        Map superProperties = ReactNativeHelper.toMap(properties);
        if (mInstance == null || superProperties == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.registerSuperPropertiesMap(superProperties);
            promise.resolve(Constant.REGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }

    /**
     * Register super properties for events, only if no other super property with the same names has already been registered.
     * Calling registerSuperPropertiesOnce will never overwrite existing properties.
     *
     * @param properties A Map containing the super properties to register.
     */
    @ReactMethod
    public void registerSuperPropertiesOnceMap(ReadableMap properties, Promise promise) {
        Map superProperties = ReactNativeHelper.toMap(properties);
        if (mInstance == null || superProperties == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.registerSuperPropertiesOnceMap(superProperties);
            promise.resolve(Constant.REGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }

    /**
     * Remove a single superProperty, so that it will not be sent with future calls to track(String, JSONObject).
     * If there is a superProperty registered with the given name, it will be permanently removed from the existing superProperties.
     */
    @ReactMethod
    public void unregisterSuperProperty(String superPropertyName, Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.unregisterSuperProperty(superPropertyName);
            promise.resolve(Constant.UNREGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }

    /**
     * Returns a json object of the user's current super properties
     * SuperProperties are a collection of properties that will be sent with every event to Mixpanel,
     * and persist beyond the lifetime of your application.
     */
    @ReactMethod
    public void getSuperProperties(Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            promise.resolve(mInstance.getSuperProperties());
        }
    }

    /**
     * Erase all currently registered superProperties.
     * Future tracking calls to Mixpanel will not contain the specific
     * superProperties registered before the clearSuperProperties method was called.
     */
    @ReactMethod
    public void clearSuperProperties(Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.clearSuperProperties();
            promise.resolve(Constant.CLEAR_SUPER_PROPERTY_SUCCESS);
        }
    }

    /**
     * use this for set the group this user belongs to.
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupID  The group the user belongs to.
     */
    @ReactMethod
    public void setGroup(final String groupKey, ReadableMap groupID, Promise promise) {
        JSONObject groupValue = null;
        try {
            groupValue = ReactNativeHelper.reactToJSON(groupID);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || groupValue == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.setGroup(groupKey, groupValue);
            promise.resolve(Constant.SET_GROUP_SUCCESS);
        }
    }

    /**
     * Use this for set the groups this user belongs to.
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupIDs The list of groups the user belongs to.
     */
    @ReactMethod
    public void setGroup(String groupKey, ReadableArray groupIDs, Promise promise) {
        JSONArray groupValue = null;
        try {
            groupValue = ReactNativeHelper.reactToJSON(groupIDs);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || groupValue == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.setGroup(groupKey, groupValue);
            promise.resolve(Constant.SET_GROUP_SUCCESS);
        }
    }

    /**
     * Add a group to this user's membership for a particular group key
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupID  The new group the user belongs to.
     */
    @ReactMethod
    public void addGroup(final String groupKey, ReadableMap groupID, Promise promise) {
        JSONObject groupValue = null;
        try {
            groupValue = ReactNativeHelper.reactToJSON(groupID);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || groupValue == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.addGroup(groupKey, groupValue);
            promise.resolve(Constant.ADD_GROUP_SUCCESS);
        }
    }

    /**
     * Remove a group from this user's membership for a particular group key
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupID  The group value to remove.
     */
    @ReactMethod
    public void removeGroup(final String groupKey, ReadableMap groupID, Promise promise) {
        JSONObject groupValue = null;
        try {
            groupValue = ReactNativeHelper.reactToJSON(groupID);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || groupValue == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.removeGroup(groupKey, groupValue);
            promise.resolve(Constant.REMOVE_GROUP_SUCCESS);
        }
    }

    /**
     * This function creates a distinct_id alias from alias to original. If original is null, then it will create an alias
     * to the current events distinct_id, which may be the distinct_id randomly generated by the Mixpanel library
     * before identify(String) is called
     *
     * @param alias    the new distinct_id that should represent original.
     * @param original the old distinct_id that alias will be mapped to.
     */
    @ReactMethod
    public void alias(String alias, String original, Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.alias(alias, original);
            promise.resolve(Constant.ALIAS_SUCCESS);
        }
    }

    /**
     * Clears tweaks and all distinct_ids, superProperties, and push registrations from persistent storage. Will not clear referrer information.
     */
    @ReactMethod
    public void reset(Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.reset();
            promise.resolve(Constant.RESET_SUCCESS);
        }
    }

    /**
     * Push all queued Mixpanel events and People Analytics changes to Mixpanel servers.
     * Events and People messages are pushed gradually throughout the lifetime of your application.
     * This means that to ensure that all messages are sent to Mixpanel
     * when your application is shut down, you will need to call flush()
     * to let the Mixpanel library know it should send all remaining messages to the server.
     */
    @ReactMethod
    public void flush(Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.flush();
        }
        promise.resolve(null);
    }

    /**
     * Begin timing of an event. Calling timeEvent("EventName") will not send an event, but
     * when you eventually call track("EventName"), your tracked event will be sent with a
     * "$duration"property, representing the number of seconds between your calls.
     *
     * @param eventName the name of the event to track with timing.
     */
    @ReactMethod
    public void timeEvent(final String eventName, Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.timeEvent(eventName);
            promise.resolve(Constant.TIME_EVENT_SUCCESS);
        }
    }

    /**
     * Retrieves the time elapsed for the named event since timeEvent() was called.
     */
    @ReactMethod
    public void eventElapsedTime(final String eventName, Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.eventElapsedTime(eventName);
            promise.resolve(Constant.EVENT_ELAPSED_TIME_SUCCESS);
        }
    }

    /**
     * Checks if the people profile is identified or not.
     *
     * @return boolean value Whether the current user is identified or not.
     */
    @ReactMethod
    public void isIdentified(Promise promise) {
        if (mInstance == null) {
            promise.resolve(Constant.INSTANCE_NOT_FOUND_ERROR);
        } else {
            promise.resolve(mInstance.getPeople().isIdentified());
        }
    }

    /**
     * Set a collection of properties on the identified user all at once.
     */
    @ReactMethod
    public void set(ReadableMap properties, Promise promise) {
        JSONObject sendProperties = null;
        try {
            sendProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(sendProperties);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || sendProperties == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.getPeople().set(sendProperties);
            promise.resolve(Constant.SET_SUCCESS);
        }
    }

    /**
     * Sets a single property with the given name and value for this user.
     * The given name and value will be assigned to the user in Mixpanel People Analytics,
     * possibly overwriting an existing property with the same name.
     */
    @ReactMethod
    public void setPropertyTo(String propertyName, ReadableMap properties, Promise promise) {
        JSONObject sendProperties = null;
        try {
            sendProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(sendProperties);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || sendProperties == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.getPeople().set(propertyName, sendProperties);
            promise.resolve(Constant.SET_SUCCESS);
        }
    }

    /**
     * permanently removes the property with the given name from the user's profile
     */
    @ReactMethod
    public void unset(String propertyName, Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.getPeople().unset(propertyName);
            promise.resolve(Constant.UNSET_SUCCESS);
        }
    }

    /**
     * Sets a single property with the given name and value for this user.
     * The given name and value will be assigned to the user in Mixpanel People Analytics,
     * it will not overwrite existing property with same name.
     */
    @ReactMethod
    public void setOnce(ReadableMap properties, Promise promise) {
        JSONObject sendProperties = null;
        try {
            sendProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(sendProperties);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || sendProperties == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.getPeople().setOnce(sendProperties);
            promise.resolve(Constant.SET_SUCCESS);
        }
    }

    /**
     * Track a revenue transaction for the identified people profile.
     *
     * @param charge     - the amount of money exchanged. Positive amounts represent purchases or income from the customer, negative amounts represent refunds or payments to the customer.
     * @param properties - an optional collection of properties to associate with this transaction.
     */
    @ReactMethod
    public void trackCharge(double charge, ReadableMap properties, Promise promise) {
        JSONObject transactionValue = null;
        try {
            transactionValue = ReactNativeHelper.reactToJSON(properties);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || transactionValue == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.getPeople().trackCharge(charge, transactionValue);
            promise.resolve(Constant.TRACK_CHARGE_SUCCESS);
        }
    }

    /**
     * It will permanently clear the whole transaction history for the identified people profile.
     */
    @ReactMethod
    public void clearCharges(Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.getPeople().clearCharges();
            promise.resolve(Constant.CLEAR_CHARGE_SUCCESS);
        }
    }

    /**
     * Add the given amount to an existing property on the identified user. If the user does not already
     * have the associated property, the amount will be added to zero. To reduce a property,
     * provide a negative number for the value.
     */
    @ReactMethod
    public void incrementPropertyBy(String name, double incrementValue, Promise promise) {
        if (mInstance == null) {
            promise.resolve(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.getPeople().increment(name, incrementValue);
            promise.resolve(Constant.INCREMENT_SUCCESS);
        }
    }

    /**
     * Change the existing values of multiple People Analytics properties at once.
     * <p>
     * If the user does not already have the associated property, the amount will
     * be added to zero. To reduce a property, provide a negative number for the value.
     *
     * @param properties A map of String properties names to Long amounts. Each
     *                   property associated with a name in the map will have its value changed by the given amount.
     */
    @ReactMethod
    public void increment(ReadableMap properties, Promise promise) {
        Map incrementProperties = ReactNativeHelper.toMap(properties);
        if (mInstance == null || incrementProperties == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.getPeople().increment(incrementProperties);
            promise.resolve(Constant.INCREMENT_SUCCESS);
        }
    }

    /**
     * Appends a value to a list-valued property. If the property does not currently exist, it will be created as a list of one element.
     * If the property does exist and doesn't currently have a list value, the append will be ignored.
     */
    @ReactMethod
    public void append(String name, ReadableArray properties, Promise promise) {
        JSONArray sendProperties = null;
        try {
            sendProperties = ReactNativeHelper.reactToJSON(properties);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || sendProperties == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.getPeople().append(name, sendProperties);
            promise.resolve(Constant.APPEND_SUCCESS);
        }
    }

    /**
     * Permanently deletes the identified user's record from People Analytics.
     * Calling deleteUser deletes an entire record completely.
     * Any future calls to People Analytics using the same distinct id will create and store new values.
     */
    @ReactMethod
    public void deleteUser(Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.getPeople().deleteUser();
            promise.resolve(Constant.DELETE_SUCCESS);
        }
    }

    /**
     * Merge a given JSONObject into the object-valued property named name.
     * If the user does not already have the associated property, an new property will be created with the value of the given updates.
     * If the user already has a value for the given property, the updates will be merged into the existing value
     */
    @ReactMethod
    public void merge(String propertyName, ReadableMap updates, Promise promise) {
        JSONObject properties = null;
        try {
            properties = ReactNativeHelper.reactToJSON(updates);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || properties == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.getPeople().merge(propertyName, properties);
            promise.resolve(Constant.MERGE_SUCCESS);
        }
    }

    /***
     Remove value from a list-valued property only if they are already present in the list.
     If the property does not currently exist, the remove will be ignored.
     If the property exists and is not list-valued, the remove will be ignored.
     */
    @ReactMethod
    public void remove(String name, ReadableArray properties, Promise promise) {
        JSONArray sendProperties = null;
        try {
            sendProperties = ReactNativeHelper.reactToJSON(properties);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (mInstance == null || sendProperties == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        } else {
            mInstance.getPeople().remove(name, sendProperties);
            promise.resolve(Constant.REMOVE_SUCCESS);
        }
    }

    /**
     * Manually send a Firebase Cloud Messaging token to Mixpanel.
     * If you are handling Firebase Cloud Messages in your own application, but would like to allow Mixpanel to handle messages originating from Mixpanel campaigns,
     * you should call setPushRegistrationId with the FCM token.
     * setPushRegistrationId should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void setPushRegistrationId(String token, Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.getPeople().setPushRegistrationId(token);
            promise.resolve(Constant.SET_PUSH_REGISTRATION_ID_SUCCESS);
        }
    }

    /**
     * Retrieves current Firebase Cloud Messaging token.
     * getPushRegistrationId() should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void getPushRegistrationId(Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            promise.resolve(mInstance.getPeople().getPushRegistrationId());
        }
    }

    /**
     * Manually clear all current Firebase Cloud Messaging tokens from Mixpanel.
     * clearPushRegistrationId() should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void clearPushRegistrationId(String registrationId, Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.getPeople().clearPushRegistrationId(registrationId);
            promise.resolve(Constant.CLEAR_PUSH_REGISTRATION_ID_SUCCESS);
        }
    }

    /**
     * Manually clear all current Firebase Cloud Messaging tokens from Mixpanel.
     * clearPushRegistrationId() should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void clearAllPushRegistrationId(Promise promise) {
        if (mInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            mInstance.getPeople().clearPushRegistrationId();
            promise.resolve(Constant.CLEAR_ALL_PUSH_REGISTRATION_ID_SUCCESS);
        }
    }
}
