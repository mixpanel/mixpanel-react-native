package com.mixpanel.reactnative;

import com.mixpanel.android.mpmetrics.MixpanelAPI;

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

    public MixpanelReactNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "MixpanelReactNative";
    }

    /**
    * Set the properties present in json file.
    * @param metadata  The name of the json object containing properties to send
    */
    @ReactMethod
    public void initialize(String token, boolean optOutTrackingDefault, ReadableMap metadata, Promise promise) throws JSONException {
        JSONObject sendProperties = ReactNativeHelper.reactToJSON(metadata);
        AutomaticProperties.setAutomaticProperties(sendProperties);
        MixpanelAPI.getInstance(this.mReactContext, token, optOutTrackingDefault);
        promise.resolve(null);
    }

    /**
     * This method will return true if the user has opted out from tracking.
     */
    @ReactMethod
    public void hasOptedOutTracking(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            promise.resolve(instance.hasOptedOutTracking());
        }
    }

    /**
     * Use this method to opt-in an already opted-out user from tracking.
     * People updates and track calls will be sent to Mixpanel after using this method.
     * This method will internally track an opt-in event to your project.
     */
    @ReactMethod
    public void optInTracking(final String token, final String distinctId, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            JSONObject eventProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(eventProperties);
            instance.optInTracking(distinctId, eventProperties);
            promise.resolve(null);
        }
    }

    /**
     * By calling this method user opted out from tracking.
     * Events and people updates that haven't been flushed yet will be deleted.
     * Use flush() before calling this method if you want to send all the queues to Mixpanel before.
     * This method will also remove any user-related information from the device.
     */
    @ReactMethod
    public void optOutTracking(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.optOutTracking();
            promise.resolve(null);
        }
    }

    /**
     * Identify the user uniquely by providing the user distinctId.
     * Associate all future calls to track(String, JSONObject), set(JSONObject), increment(Map),
     * append(String, Object), etc... with the user identified by the given distinctId.
     * The user identification will persist across restarts of your application.
     */
    @ReactMethod
    public void identify(final String token, final String distinctId, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.identify(distinctId);
            instance.getPeople().identify(distinctId);
            promise.resolve(null);
        }
    }

    /**
     * Returns the string id currently being used to uniquely identify the user associated with events.
     */
    @ReactMethod
    public void getDistinctId(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            promise.resolve(instance.getDistinctId());
        }
    }

    /**
     * To track an event.
     * Every call to track eventually results in a data point sent to Mixpanel.
     * Events have a string name, and an optional set of name/value pairs that describe the properties of that event.
     */
    @ReactMethod
    public void track(final String token, final String eventName, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            JSONObject eventProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(eventProperties);
            instance.track(eventName, eventProperties);
            promise.resolve(null);
        }
    }

    /**
     * registerSuperProperties will store a new superProperty and possibly overwriting any existing superProperty with the same name.
     * Register properties that will be sent with every subsequent call to track().
     */
    @ReactMethod
    public void registerSuperProperties(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            JSONObject superProperties = ReactNativeHelper.reactToJSON(properties);
            instance.registerSuperProperties(superProperties);
            promise.resolve(null);
        }
    }

    /**
     * Register super properties for events, only if no other super property with the same names has already been registered.
     * Calling registerSuperPropertiesOnce will never overwrite existing properties.
     */
    @ReactMethod
    public void registerSuperPropertiesOnce(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            JSONObject superProperties = ReactNativeHelper.reactToJSON(properties);
            instance.registerSuperPropertiesOnce(superProperties);
            promise.resolve(null);
        }
    }

    /**
     * Remove a single superProperty, so that it will not be sent with future calls to track(String, JSONObject).
     * If there is a superProperty registered with the given name, it will be permanently removed from the existing superProperties.
     */
    @ReactMethod
    public void unregisterSuperProperty(final String token, String superPropertyName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.unregisterSuperProperty(superPropertyName);
            promise.resolve(null);
        }
    }

    /**
     * Add values to a list-valued property only if they are not already present in the list.
     * If the property does not currently exist,
     * it will be created with the given list as it's value.
     * If the property exists and is not list-valued, the union will be ignored.
     */
    @ReactMethod
    public void union(final String token, String name, ReadableArray value, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            JSONArray propertyValue = ReactNativeHelper.reactToJSON(value);
            instance.getPeople().union(name, propertyValue);
            promise.resolve(null);
        }
    }

    /**
     * Returns a json object of the user's current super properties.
     * SuperProperties are a collection of properties that will be sent with every event to Mixpanel,
     * and persist beyond the lifetime of your application.
     */
    @ReactMethod
    public void getSuperProperties(final String token, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            promise.resolve(ReactNativeHelper.convertJsonToMap(instance.getSuperProperties()));
        }
    }

    /**
     * Erase all currently registered superProperties.
     * Future tracking calls to Mixpanel will not contain the specific
     * superProperties registered before the clearSuperProperties method was called.
     */
    @ReactMethod
    public void clearSuperProperties(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.clearSuperProperties();
            promise.resolve(null);
        }
    }

    /**
     * This function creates a distinctId alias from alias to original. If original is null, then it will create an alias
     * to the current events distinctId, which may be the distinctId randomly generated by the Mixpanel library
     * before identify(String) is called.
     *
     * @param alias    the new distinctId that should represent original.
     * @param original the old distinctId that alias will be mapped to.
     */
    @ReactMethod
    public void alias(final String token, String alias, String original, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.alias(alias, original);
            promise.resolve(null);
        }
    }

    /**
     * Clear tweaks and all distinctIds, superProperties, and push registrations from persistent storage.
     * Will not clear referrer information.
     */
    @ReactMethod
    public void reset(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.reset();
            promise.resolve(null);
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
    public void flush(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.flush();
            promise.resolve(null);
        }
    }

    /**
     * Begin timing of an event. Calling timeEvent("EventName") will not send an event, but
     * when you eventually call track("EventName"), your tracked event will be sent with a
     * "$duration" property, representing the number of seconds between your calls.
     */
    @ReactMethod
    public void timeEvent(final String token, final String eventName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.timeEvent(eventName);
            promise.resolve(null);
        }
    }

    /**
     * Retrieve the time elapsed for the named event since timeEvent() was called.
     */
    @ReactMethod
    public void eventElapsedTime(final String token, final String eventName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            promise.resolve(instance.eventElapsedTime(eventName));
        }
    }

    /**
     * Check whether the people profile is identified or not.
     *
     * @return boolean value whether the current user is identified or not.
     */
    @ReactMethod
    public void isIdentified(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            promise.resolve(instance.getPeople().isIdentified());
        }
    }

    /**
     * Set a collection of properties on the identified user all at once.
     */
    @ReactMethod
    public void set(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            JSONObject sendProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(sendProperties);
            instance.getPeople().set(sendProperties);
            promise.resolve(null);
        }
    }

    /**
     * Permanently removes the property with the given name from the user's profile
     */
    @ReactMethod
    public void unset(final String token, String propertyName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.getPeople().unset(propertyName);
            promise.resolve(null);
        }
    }

    /**
     * Set a single property with the given name and value for this user.
     * The given name and value will be assigned to the user in Mixpanel People Analytics,
     * it will not overwrite existing property with same name.
     */
    @ReactMethod
    public void setOnce(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            JSONObject sendProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(sendProperties);
            instance.getPeople().setOnce(sendProperties);
            promise.resolve(null);
        }
    }

    /**
     * Track a revenue transaction for the identified people profile.
     */
    @ReactMethod
    public void trackCharge(final String token, double charge, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            JSONObject transactionValue = ReactNativeHelper.reactToJSON(properties);
            instance.getPeople().trackCharge(charge, transactionValue);
            promise.resolve(null);
        }
    }

    /**
     * It will permanently clear the whole transaction history for the identified people profile.
     */
    @ReactMethod
    public void clearCharges(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.getPeople().clearCharges();
            promise.resolve(null);
        }
    }

    /**
     * Change the existing values of multiple People Analytics properties at once.
     * If the user does not already have the associated property, the amount will
     * be added to zero. To reduce a property, provide a negative number for the value.
     */
    @ReactMethod
    public void increment(final String token, ReadableMap properties, Promise promise) {
        Map incrementProperties = ReactNativeHelper.toMap(properties);
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.getPeople().increment(incrementProperties);
            promise.resolve(null);
        }
    }

    /**
     * Append a value to a list-valued property. If the property does not currently exist, it will be created as a list of one element.
     * If the property does exist and doesn't currently have a list value, the append will be ignored.
     */
    @ReactMethod
    public void append(final String token, String name, ReadableMap value, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            JSONObject sendProperties = ReactNativeHelper.reactToJSON(value);
            instance.getPeople().append(name, sendProperties.get(name));
            promise.resolve(null);
        }
    }

    /**
     * Permanently deletes the identified user's record from People Analytics.
     * Calling deleteUser deletes an entire record completely.
     * Any future calls to People Analytics using the same distinctId will create and store new values.
     */
    @ReactMethod
    public void deleteUser(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.getPeople().deleteUser();
            promise.resolve(null);
        }
    }

    /**
     * Remove value from a list-valued property only if they are already present in the list.
     * If the property does not currently exist, the remove will be ignored.
     * If the property exists and is not list-valued, the remove will be ignored.
     */
    @ReactMethod
    public void remove(final String token, String name, ReadableMap value, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            JSONObject sendProperties = ReactNativeHelper.reactToJSON(value);
            instance.getPeople().remove(name, sendProperties.get(name));
            promise.resolve(null);
        }
    }

    /**
     * Manually send a Firebase Cloud Messaging token to Mixpanel.
     * If you are handling Firebase Cloud Messages in your own application, but would like to allow Mixpanel to handle messages originating from Mixpanel campaigns,
     * you should call setPushRegistrationId with the FCM token.
     * setPushRegistrationId should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void setPushRegistrationId(final String token, String deviceToken, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.getPeople().setPushRegistrationId(deviceToken);
            promise.resolve(null);
        }
    }

    /**
     * Retrieve current Firebase Cloud Messaging token.
     * getPushRegistrationId() should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void getPushRegistrationId(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            promise.resolve(instance.getPeople().getPushRegistrationId());
        }
    }

    /**
     * Manually clear a single Firebase Cloud Messaging token from Mixpanel.
     * clearPushRegistrationId() should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void clearPushRegistrationId(final String token, String registrationId, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.getPeople().clearPushRegistrationId(registrationId);
            promise.resolve(null);
        }
    }

    /**
     * Manually clear all current Firebase Cloud Messaging tokens from Mixpanel.
     * clearAllPushRegistrationId() should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void clearAllPushRegistrationId(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance) {
            instance.getPeople().clearPushRegistrationId();
            promise.resolve(null);
        }
    }
}
