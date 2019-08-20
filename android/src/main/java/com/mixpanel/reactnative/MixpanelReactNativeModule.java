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

    public MixpanelReactNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "MixpanelReactNative";
    }

    /**
    * This method used to check whether integration of SDK with App is done or not
    * TODO - Remove this method from final publish
    */
    @ReactMethod
    public void getInformation(Promise promise) {
        promise.resolve(Constant.LIBRARY_INVOKED);
    }

    /**
    * Set the properties present in json file.
    * @param metadata  The name of the json object containing properties to send
    */
    @ReactMethod
    public void initialize(String token, boolean optOutTrackingDefault, ReadableMap metadata, Promise promise) throws JSONException {
        JSONObject sendProperties = ReactNativeHelper.reactToJSON(metadata);
        AutomaticProperties.setAutomaticProperties(sendProperties);

        MixpanelAPI mpInstance = MixpanelAPI.getInstance(this.mReactContext, token, optOutTrackingDefault);
        if (mpInstance == null) {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            promise.resolve(true);
        }
    }

   /**
    * Set the properties present in json file.
    * @param metadata  The name of the json object containing properties to send
    */
    @ReactMethod
    public void setMetadata(ReadableMap metadata) throws JSONException {
        JSONObject sendProperties = ReactNativeHelper.reactToJSON(metadata);
        AutomaticProperties.setAutomaticProperties(sendProperties);
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
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        } else {
            promise.resolve(true);
        }
    }

    /**
     * This method Will return true if the user has opted out from tracking.
     */
    @ReactMethod
    public void hasOptedOutTracking(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                promise.resolve(instance.hasOptedOutTracking());
            }
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
    public void optInTracking(final String token, final String distinctId, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONObject eventProperties = ReactNativeHelper.reactToJSON(properties);
                AutomaticProperties.appendLibraryProperties(eventProperties);
                instance.optInTracking(distinctId, eventProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * By calling this method user opted out from tracking and before calling this method
     * call flush() if you want to send all the events or updates to Mixpanel otherwise it will be deleted.
     */
    @ReactMethod
    public void optOutTracking(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.optOutTracking();
                promise.resolve(null);
            }
        }
    }

    /**
     * Identify the user uniquely by providing the user distinct id, so all the event, update ,track call
     * will manipulate the data only for identified users profile.
     * This call does not identify the user for People Analytics to do that you have to call
     * MixpanelAPI.People.identify(String) method.
     */
    @ReactMethod
    public void identify(final String token, final String distinctId, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.identify(distinctId);
                instance.getPeople().identify(distinctId);
                promise.resolve(null);
            }
        }
    }

    /**
     * Returns the string id currently being used to uniquely identify the user associated with events.
     */
    @ReactMethod
    public void getDistinctId(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                promise.resolve(instance.getDistinctId());
            }
        }
    }

    /**
     * Use for Track an event.
     * Every call to track eventually results in a data point sent to Mixpanel.
     * These data points are what are measured, counted, and broken down to create your Mixpanel reports.
     * Events have a string name, and an optional set of name/value pairs that describe the properties of that event.
     */
    @ReactMethod
    public void track(final String token, final String eventName, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONObject eventProperties = ReactNativeHelper.reactToJSON(properties);
                AutomaticProperties.appendLibraryProperties(eventProperties);
                instance.track(eventName, eventProperties);
                promise.resolve(null);
            }
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
    public void trackMap(final String token, String eventName, ReadableMap properties, Promise promise) {
        Map eventProperties = ReactNativeHelper.toMap(properties);
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.trackMap(eventName, eventProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * registerSuperProperties will store a new superProperty and possibly overwriting any existing superProperty with the same name.
     * Register properties that will be sent with every subsequent call to track().
     */
    @ReactMethod
    public void registerSuperProperties(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONObject superProperties = ReactNativeHelper.reactToJSON(properties);
                instance.registerSuperProperties(superProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * Register super properties for events, only if no other super property with the same names has already been registered.
     * Calling registerSuperPropertiesOnce will never overwrite existing properties.
     */
    @ReactMethod
    public void registerSuperPropertiesOnce(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONObject superProperties = ReactNativeHelper.reactToJSON(properties);
                instance.registerSuperPropertiesOnce(superProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * registerSuperPropertiesMap will store a new superProperty and possibly overwriting any existing superProperty with the same name.
     * Register properties that will be sent with every subsequent call to track().
     *
     * @param properties A Map containing super properties to register
     */
    @ReactMethod
    public void registerSuperPropertiesMap(final String token, ReadableMap properties, Promise promise) {
        Map superProperties = ReactNativeHelper.toMap(properties);
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.registerSuperPropertiesMap(superProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * Register super properties for events, only if no other super property with the same names has already been registered.
     * Calling registerSuperPropertiesOnce will never overwrite existing properties.
     *
     * @param properties A Map containing the super properties to register.
     */
    @ReactMethod
    public void registerSuperPropertiesOnceMap(final String token, ReadableMap properties, Promise promise) {
        Map superProperties = ReactNativeHelper.toMap(properties);
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.registerSuperPropertiesOnceMap(superProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * Remove a single superProperty, so that it will not be sent with future calls to track(String, JSONObject).
     * If there is a superProperty registered with the given name, it will be permanently removed from the existing superProperties.
     */
    @ReactMethod
    public void unregisterSuperProperty(final String token, String superPropertyName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.unregisterSuperProperty(superPropertyName);
                promise.resolve(null);
            }
        }
    }

    /**
     * Adds values to a list-valued property only if they are not already present in the list.
     * If the property does not currently exist,
     * it will be created with the given list as it's value.
     * If the property exists and is not list-valued, the union will be ignored.
     */
    @ReactMethod
    public void union(final String token, String name, ReadableArray value, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if(instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONArray propertyValue = ReactNativeHelper.reactToJSON(value);
                instance.getPeople().union(name, propertyValue);
                promise.resolve(null);
            }
        }
    }

    /**
     * Returns a json object of the user's current super properties
     * SuperProperties are a collection of properties that will be sent with every event to Mixpanel,
     * and persist beyond the lifetime of your application.
     */
    @ReactMethod
    public void getSuperProperties(final String token, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                promise.resolve(ReactNativeHelper.convertJsonToMap(instance.getSuperProperties()));
            }
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
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.clearSuperProperties();
                promise.resolve(null);
            }
        }
    }

    /**
     * use this for set the group this user belongs to.
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupID  The group the user belongs to.
     */
    @ReactMethod
    public void setGroup(final String token, final String groupKey, ReadableMap groupID, Promise promise) throws JSONException {
        JSONObject groupValue = ReactNativeHelper.reactToJSON(groupID);
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null || groupValue == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.setGroup(groupKey, groupValue);
                promise.resolve(Constant.SET_GROUP_SUCCESS);
            }
        }
    }

    /**
     * Use this for set the groups this user belongs to.
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupIDs The list of groups the user belongs to.
     */
    @ReactMethod
    public void setGroup(final String token, String groupKey, ReadableArray groupIDs, Promise promise) throws JSONException {
        JSONArray groupValue = ReactNativeHelper.reactToJSON(groupIDs);
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null || groupValue == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.setGroup(groupKey, groupValue);
                promise.resolve(Constant.SET_GROUP_SUCCESS);
            }
        }
    }

    /**
     * Add a group to this user's membership for a particular group key
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupID  The new group the user belongs to.
     */
    @ReactMethod
    public void addGroup(final String token, final String groupKey, ReadableMap groupID, Promise promise) throws JSONException {
        JSONObject groupValue = ReactNativeHelper.reactToJSON(groupID);
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null || groupValue == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.addGroup(groupKey, groupValue);
                promise.resolve(Constant.ADD_GROUP_SUCCESS);
            }
        }
    }

    /**
     * Remove a group from this user's membership for a particular group key
     *
     * @param groupKey The property name associated with this group type (must already have been set up).
     * @param groupID  The group value to remove.
     */
    @ReactMethod
    public void removeGroup(final String token, final String groupKey, ReadableMap groupID, Promise promise) throws JSONException {
        JSONObject groupValue = ReactNativeHelper.reactToJSON(groupID);
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null || groupValue == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.removeGroup(groupKey, groupValue);
                promise.resolve(Constant.REMOVE_GROUP_SUCCESS);
            }
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
    public void alias(final String token, String alias, String original, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.alias(alias, original);
                promise.resolve(null);
            }
        }
    }

    /**
     * Clears tweaks and all distinct_ids, superProperties, and push registrations from persistent storage. Will not clear referrer information.
     */
    @ReactMethod
    public void reset(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.reset();
                promise.resolve(null);
            }
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
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.flush();
                promise.resolve(null);
            }
        }
    }

    /**
     * Begin timing of an event. Calling timeEvent("EventName") will not send an event, but
     * when you eventually call track("EventName"), your tracked event will be sent with a
     * "$duration"property, representing the number of seconds between your calls.
     *
     * @param eventName the name of the event to track with timing.
     */
    @ReactMethod
    public void timeEvent(final String token, final String eventName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.timeEvent(eventName);
                promise.resolve(null);
            }
        }
    }

    /**
     * Retrieves the time elapsed for the named event since timeEvent() was called.
     */
    @ReactMethod
    public void eventElapsedTime(final String token, final String eventName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                promise.resolve(instance.eventElapsedTime(eventName));
            }
        }
    }

    /**
     * Checks if the people profile is identified or not.
     *
     * @return boolean value Whether the current user is identified or not.
     */
    @ReactMethod
    public void isIdentified(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.resolve(Constant.INSTANCE_NOT_FOUND_ERROR);
            } else {
                promise.resolve(instance.getPeople().isIdentified());
            }
        }
    }

    /**
     * Set a collection of properties on the identified user all at once.
     */
    @ReactMethod
    public void set(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONObject sendProperties = ReactNativeHelper.reactToJSON(properties);
                AutomaticProperties.appendLibraryProperties(sendProperties);
                instance.getPeople().set(sendProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * Sets a single property with the given name and value for this user.
     * The given name and value will be assigned to the user in Mixpanel People Analytics,
     * possibly overwriting an existing property with the same name.
     */
    @ReactMethod
    public void setPropertyTo(final String token, String propertyName, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONObject sendProperties = ReactNativeHelper.reactToJSON(properties);
                AutomaticProperties.appendLibraryProperties(sendProperties);
                instance.getPeople().set(propertyName, sendProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * permanently removes the property with the given name from the user's profile
     */
    @ReactMethod
    public void unset(final String token, String propertyName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.getPeople().unset(propertyName);
                promise.resolve(null);
            }
        }
    }

    /**
     * Sets a single property with the given name and value for this user.
     * The given name and value will be assigned to the user in Mixpanel People Analytics,
     * it will not overwrite existing property with same name.
     */
    @ReactMethod
    public void setOnce(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONObject sendProperties = ReactNativeHelper.reactToJSON(properties);
                AutomaticProperties.appendLibraryProperties(sendProperties);
                instance.getPeople().setOnce(sendProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * Track a revenue transaction for the identified people profile.
     *
     * @param charge     - the amount of money exchanged. Positive amounts represent purchases or income from the customer, negative amounts represent refunds or payments to the customer.
     * @param properties - an optional collection of properties to associate with this transaction.
     */
    @ReactMethod
    public void trackCharge(final String token, double charge, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONObject transactionValue = ReactNativeHelper.reactToJSON(properties);
                instance.getPeople().trackCharge(charge, transactionValue);
                promise.resolve(null);
            }
        }
    }

    /**
     * It will permanently clear the whole transaction history for the identified people profile.
     */
    @ReactMethod
    public void clearCharges(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.getPeople().clearCharges();
                promise.resolve(null);
            }
        }
    }

    /**
     * Add the given amount to an existing property on the identified user. If the user does not already
     * have the associated property, the amount will be added to zero. To reduce a property,
     * provide a negative number for the value.
     */
    @ReactMethod
    public void incrementPropertyBy(final String token, String name, double incrementValue, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.resolve(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.getPeople().increment(name, incrementValue);
                promise.resolve(null);
            }
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
    public void increment(final String token, ReadableMap properties, Promise promise) {
        Map incrementProperties = ReactNativeHelper.toMap(properties);
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.getPeople().increment(incrementProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * Appends a value to a list-valued property. If the property does not currently exist, it will be created as a list of one element.
     * If the property does exist and doesn't currently have a list value, the append will be ignored.
     */
    @ReactMethod
    public void append(final String token, String name, ReadableArray properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONArray sendProperties = ReactNativeHelper.reactToJSON(properties);
                instance.getPeople().append(name, sendProperties);
                promise.resolve(null);
            }
        }
    }

    /**
     * Permanently deletes the identified user's record from People Analytics.
     * Calling deleteUser deletes an entire record completely.
     * Any future calls to People Analytics using the same distinct id will create and store new values.
     */
    @ReactMethod
    public void deleteUser(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.getPeople().deleteUser();
                promise.resolve(null);
            }
        }
    }

    /**
     * Merge a given JSONObject into the object-valued property named name.
     * If the user does not already have the associated property, an new property will be created with the value of the given updates.
     * If the user already has a value for the given property, the updates will be merged into the existing value
     */
    @ReactMethod
    public void merge(final String token, String propertyName, ReadableMap updates, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONObject properties = ReactNativeHelper.reactToJSON(updates);
                instance.getPeople().merge(propertyName, properties);
                promise.resolve(null);
            }
        }
    }

    /***
     Remove value from a list-valued property only if they are already present in the list.
     If the property does not currently exist, the remove will be ignored.
     If the property exists and is not list-valued, the remove will be ignored.
     */
    @ReactMethod
    public void remove(final String token, String name, ReadableArray properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                JSONArray sendProperties = ReactNativeHelper.reactToJSON(properties);
                instance.getPeople().remove(name, sendProperties);
                promise.resolve(null);
            }
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
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.getPeople().setPushRegistrationId(deviceToken);
                promise.resolve(null);
            }
        }
    }

    /**
     * Retrieves current Firebase Cloud Messaging token.
     * getPushRegistrationId() should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void getPushRegistrationId(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                promise.resolve(instance.getPeople().getPushRegistrationId());
            }
        }
    }

    /**
     * Manually clear all current Firebase Cloud Messaging tokens from Mixpanel.
     * clearPushRegistrationId() should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void clearPushRegistrationId(final String token, String registrationId, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.getPeople().clearPushRegistrationId(registrationId);
                promise.resolve(null);
            }
        }
    }

    /**
     * Manually clear all current Firebase Cloud Messaging tokens from Mixpanel.
     * clearPushRegistrationId() should only be called after identify(String) has been called.
     */
    @ReactMethod
    public void clearAllPushRegistrationId(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        synchronized (instance)
        {
            if (instance == null) {
                promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
            } else {
                instance.getPeople().clearPushRegistrationId();
                promise.resolve(null);
            }
        }
    }
}
