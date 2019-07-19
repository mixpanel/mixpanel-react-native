
package com.mp;

import com.facebook.common.references.SharedReference;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import com.facebook.react.bridge.WritableMap;
import com.mixpanel.android.mpmetrics.MixpanelAPI;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import com.google.gson.Gson;

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


    //region React Native Methods

    @ReactMethod
    public void getInformation(Promise promise)
    {
        promise.resolve(Constant.LIBRARY_INVOKED);
    }

    /*
    Get the instance of MixpanelAPI with providing your project token.
    This instance of MixpanelAPI you can use to send events and updates to Mixpanel.
    */
    @ReactMethod
    public void getInstance(String mpToken, Promise promise)
    {
        getInstance(mpToken,false, promise);

    }

    /*
    Get the instance of MixpanelAPI with providing your project token
    and boolean value for opting out tracking,  default value for optOutTrackingDefault is
    false by setting it to true will prevent data from being collected by default
    This instance of MixpanelAPI you can use to send events and updates to Mixpanel.
    */
    @ReactMethod
    public void getInstance(String mpToken, boolean optOutTrackingDefault, Promise promise)
    {
        MixpanelAPI mpInstance = MixpanelAPI.getInstance(this.mReactContext, mpToken, optOutTrackingDefault);
        if(mpInstance == null)
        {
            throw new SharedReference.NullReferenceException();
        }
        else
        {
            mInstance = mpInstance;
            promise.resolve(Constant.GET_INSTANCE_SUCCESS);
        }
    }

    /*
    This method Will return true if the user has opted out from tracking.
    */
    @ReactMethod
    public void hasOptedOutTracking(Promise promise)
    {
        if(mInstance == null)
        {
            throw new SharedReference.NullReferenceException();
        }
        else
        {
            promise.resolve(mInstance.hasOptedOutTracking());
        }
    }


    /*
    Identify the user uniquely by providing the user distinct id, so all the event, update ,track call
    will manipulate the data only for identified users profile.
    This call does not identify the user for People Analytics to do that you have to call
    MixpanelAPI.People.identify(String) method.
    */
    @ReactMethod
    public void identify(final String distinctId, Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.identify(distinctId);
            mInstance.getPeople().identify(distinctId);
            promise.resolve(Constant.IDENTIFIED_SUCCESS);
        }
    }

    /*
    Returns the string id currently being used to uniquely identify the user associated with events.
    */
    @ReactMethod
    public void getDistinctId(Promise promise)
        {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            promise.resolve(mInstance.getDistinctId());
        }
    }

    /*
    Use this method to opt-in an already opted-out user from tracking.
    People updates and track calls will be sent to Mixpanel after using this method.
    This method will internally track an opt-in event to your project.
    */
    @ReactMethod
    public void optInTracking(Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.optInTracking();
            promise.resolve(Constant.OPT_IN_SUCCESS);
        }
    }

    /*
    Use this method to opt-in an already opted-out user from tracking.
    String to use as the distinct ID for events. This will call identify(String).
    People updates and track calls will be sent to Mixpanel after using this method.
    This method will internally track an opt-in event to your project.
    */
    @ReactMethod
    public void optInTracking(final String distinctId, Promise promise)
    {
       if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.optInTracking(distinctId);
            promise.resolve(Constant.OPT_IN_SUCCESS);
        }
    }
    /*
    Use this method to opt-in an already opted-out user from tracking.
    String to use as the distinct ID for events. This will call identify(String).
    Optional JSONObject that could be passed to add properties to the opt-in event that is sent to Mixpanel.
    People updates and track calls will be sent to Mixpanel after using this method.
    This method will internally track an opt-in event to your project.
    */
    @ReactMethod
    public void optInTracking(final String distinctId, ReadableMap properties, Promise promise) {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(properties);
        }
        catch (JSONException e)
        {
            e.printStackTrace();
        }
        if (mInstance == null || jsonObject == null) {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {
            mInstance.optInTracking(distinctId, jsonObject);
            promise.resolve(Constant.OPT_IN_SUCCESS);
        }
    }
    /*
    By calling this method user opted out from tracking and before calling this method
    call flush() if you want to send all the events or updates to Mixpanel otherwise it will be deleted.
    */
    @ReactMethod
    public void optOutTracking(Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.optOutTracking();
            promise.resolve(Constant.OPT_OUT_SUCCESS);
        }
    }

    /*
    Use for Track an event.
    Every call to track eventually results in a data point sent to Mixpanel.
    These data points are what are measured, counted, and broken down to create your Mixpanel reports.
    Events have a string name with event get logged into the Mixpanel.
    */
    @ReactMethod
    public void track(final String eventName, Promise promise)
    {

        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.track(eventName);
            promise.resolve(Constant.EVENT_TRACK_SUCCESS);
        }

    }

    /*
    Use for Track an event.
    Every call to track eventually results in a data point sent to Mixpanel.
    These data points are what are measured, counted, and broken down to create your Mixpanel reports.
    Events have a string name, and an optional set of name/value pairs that describe the properties of that event.
    */
    @ReactMethod
    public void track(final String eventName, ReadableMap properties, Promise promise) throws JSONException {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(properties);
        }
        catch (JSONException e)
        {
            e.printStackTrace();
        }
        if (mInstance== null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {

            mInstance.track(eventName, jsonObject);
            promise.resolve(Constant.EVENT_TRACK_SUCCESS);
        }
    }

    /*
    Track an event.

    Every call to track eventually results in a data point sent to Mixpanel.
    These data points are what are measured, counted, and broken down to create your Mixpanel reports.
    Events have a string name, and an optional set of name/value pairs that describe the properties of
    that event.

    @param eventName The name of the event to send
    @param properties A Map containing the key value pairs of the properties to include in this event.
    Pass null if no extra properties exist.
    */
    @ReactMethod
    public void trackMap(String eventName, ReadableMap properties, Promise promise)
    {
        Map map = ReactNativeHelper.toMap(properties);
        if(mInstance == null ||map == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.trackMap(eventName, map);
            promise.resolve(Constant.EVENT_TRACK_SUCCESS);
        }
    }
    /*
    registerSuperProperties will store a new superProperty and possibly overwriting any existing superProperty with the same name.
    Register properties that will be sent with every subsequent call to track().
    */

    @ReactMethod
    public void registerSuperProperties(ReadableMap properties, Promise promise)
    {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(properties);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }
        if(mInstance == null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {
            mInstance.registerSuperProperties(jsonObject);
            promise.resolve(Constant.REGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }

    /*
    Register super properties for events, only if no other super property with the same names has already been registered.
    Calling registerSuperPropertiesOnce will never overwrite existing properties.
    */
    @ReactMethod
    public void registerSuperPropertiesOnce(ReadableMap properties, Promise promise)
    {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(properties);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }
        if(mInstance == null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {
            mInstance.registerSuperPropertiesOnce(jsonObject);
            promise.resolve(Constant.REGISTER_SUPER_PROPERTY_SUCCESS);
        }

    }
    /*
    registerSuperPropertiesMap will store a new superProperty and possibly overwriting any existing superProperty with the same name.
    Register properties that will be sent with every subsequent call to track().
    @param superProperties    A Map containing super properties to register
    */
    @ReactMethod
    public void registerSuperPropertiesMap(ReadableMap superProperties, Promise promise)
    {
        Map map = ReactNativeHelper.toMap(superProperties);
        if(mInstance == null || map == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.registerSuperPropertiesMap(map);
            promise.resolve(Constant.REGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }

    /*
    Register super properties for events, only if no other super property with the same names has already been registered.
    Calling registerSuperPropertiesOnce will never overwrite existing properties.
    @param superProperties A Map containing the super properties to register.
    */
    @ReactMethod
    public void registerSuperPropertiesOnceMap(ReadableMap superProperties, Promise promise)
    {
        Map map = ReactNativeHelper.toMap(superProperties);
        if(mInstance == null || map == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.registerSuperPropertiesOnceMap(map);
            promise.resolve(Constant.REGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }
    /*
    Remove a single superProperty, so that it will not be sent with future calls to track(String, JSONObject).
    If there is a superProperty registered with the given name, it will be permanently removed from the existing superProperties.
    */
    @ReactMethod
    public void unregisterSuperProperty(String superPropertyName, Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {
            mInstance.unregisterSuperProperty(superPropertyName);
            promise.resolve(Constant.UNREGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }
    /*
    Returns a json object of the user's current super properties
    SuperProperties are a collection of properties that will be sent with every event to Mixpanel,
    and persist beyond the lifetime of your application.
    */

    @ReactMethod
    public void getSuperProperties(String propertyName, Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else {
            try
            {
                JSONObject currentProperties = mInstance.getSuperProperties();
                promise.resolve(currentProperties.getString(propertyName));
            }
            catch (JSONException e)
            {
                promise.reject(e);
            }
        }

    }
    /*
    Erase all currently registered superProperties.
    Future tracking calls to Mixpanel will not contain the specific
    superProperties registered before the clearSuperProperties method was called.
    */
    @ReactMethod
    public void clearSuperProperties(final String mpToken, Promise promise)
    {

        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.clearSuperProperties();
            promise.resolve(Constant.CLEAR_SUPER_PROPERTY_SUCCESS);
        }
    }

    /*
    use this for set the group this user belongs to.
    @param groupKey The property name associated with this group type (must already have been set up).
    @param groupID The group the user belongs to.
    */
    @ReactMethod
    public void setGroup(final String groupKey, ReadableMap groupID, Promise promise)
    {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(groupID);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }
        if(mInstance == null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.setGroup(groupKey, jsonObject);
            promise.resolve(Constant.SET_GROUP_SUCCESS);
        }
    }

    /*
    Use this for set the groups this user belongs to.
    @param groupKey The property name associated with this group type (must already have been set up).
    @param groupIDs The list of groups the user belongs to.
    */
    @ReactMethod
    public void setGroup(String groupKey, ReadableArray groupIDs, Promise promise)
    {
        JSONArray jsonArray = null;
        try
        {
            jsonArray = ReactNativeHelper.reactToJSON(groupIDs);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }
        if(mInstance == null || jsonArray == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.setGroup(groupKey, jsonArray);
            promise.resolve(Constant.SET_GROUP_SUCCESS);
        }
    }

    /*
    Add a group to this user's membership for a particular group key
    @param groupKey The property name associated with this group type (must already have been set up).
    @param groupID The new group the user belongs to.
    */
    @ReactMethod
    public void addGroup(final String groupKey, ReadableMap groupID, Promise promise)
    {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(groupID);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }
        if(mInstance == null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.addGroup(groupKey, jsonObject);
            promise.resolve(Constant.ADD_GROUP_SUCCESS);
        }
    }

    /*
    Remove a group from this user's membership for a particular group key
    @param groupKey The property name associated with this group type (must already have been set up).
    @param groupID The group value to remove.
    */

    @ReactMethod
    public void removeGroup(final String groupKey, ReadableMap groupID, Promise promise)
    {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(groupID);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }
        if(mInstance == null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.removeGroup(groupKey, jsonObject);
            promise.resolve(Constant.REMOVE_GROUP_SUCCESS);
        }
    }

    /*
    This function creates a distinct_id alias from alias to original. If original is null, then it will create an alias
    to the current events distinct_id, which may be the distinct_id randomly generated by the Mixpanel library
    before {@link #identify(String)} is called.
        This call does not identify the user after. You must still call both {@link #identify(String)} and
    {@link People#identify(String)} if you wish the new alias to be used for Events and People.
    @param alias the new distinct_id that should represent original.
    @param original the old distinct_id that alias will be mapped to.
    */
    @ReactMethod
    public void  alias(String alias, String original,Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.alias(alias,original);
            promise.resolve(Constant.ALIAS_SUCCESS);
        }
    }

    /*
    Begin timing of an event. Calling timeEvent("EventName") will not send an event, but
    when you eventually call track("EventName"), your tracked event will be sent with a
    "$duration"property, representing the number of seconds between your calls.
    @param eventName the name of the event to track with timing.
    */
    @ReactMethod
    public void timeEvent(final String event, Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.timeEvent(event);
            promise.resolve(Constant.TIME_EVENT_SUCCESS);
        }
    }

    @ReactMethod
    public void eventElapsedTime(final String eventName, Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.eventElapsedTime(eventName);
            promise.resolve(Constant.EVENT_ELAPSED_TIME_SUCCESS);
        }
    }

    @ReactMethod
    public void reset(Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.reset();
            promise.resolve(Constant.RESET_SUCCESS);
        }
    }

    /*
    Push all queued Mixpanel events and People Analytics changes to Mixpanel servers.
    Events and People messages are pushed gradually throughout the lifetime of your application.
    This means that to ensure that all messages are sent to Mixpanel
    when your application is shut down, you will need to call flush()
    to let the Mixpanel library know it should send all remaining messages to the server.
    */

    @ReactMethod
    public void flush(Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.flush();
        }
        promise.resolve(null);
    }

     /*
    Checks if the people profile is identified or not.
    @return boolean value Whether the current user is identified or not.
    */
    @ReactMethod
    public void isIdentified(Promise promise)
    {
        if(mInstance == null)
        {
            promise.resolve(Constant.INSTANCE_NOT_FOUND_ERROR);
        }
        else
        {
            promise.resolve(mInstance.getPeople().isIdentified());
        }
    }

    /*
    Set a collection of properties on the identified user all at once.
    */
    @ReactMethod
    public void set(ReadableMap properties, Promise promise)
    {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(properties);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }

        if(mInstance == null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {

            mInstance.getPeople().set(jsonObject);
            promise.resolve(Constant.SET_SUCCESS);
        }

    }
    /*
    Sets a single property with the given name and value for this user.
    The given name and value will be assigned to the user in Mixpanel People Analytics,
    possibly overwriting an existing property with the same name.
    */
    @ReactMethod
    public void set(String propertyName, ReadableMap properties, Promise promise)
    {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(properties);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }

        if(mInstance == null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {

            mInstance.getPeople().set(propertyName, jsonObject);
            promise.resolve(Constant.SET_SUCCESS);
        }

    }
    /*
    Sets a single property with the given name and value for this user.
    The given name and value will be assigned to the user in Mixpanel People Analytics,
    it will not overwrite existing property with same name.
    */
    @ReactMethod
    public void setOnce(ReadableMap properties, Promise promise)
    {

        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(properties);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }
        if(mInstance == null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {
            mInstance.getPeople().setOnce(jsonObject);
            promise.resolve(Constant.SET_SUCCESS);
        }

    }
    /*
    Track a revenue transaction for the identified people profile.
    @param charge - the amount of money exchanged. Positive amounts represent purchases or income from the customer, negative amounts represent refunds or payments to the customer.
    @param properties - an optional collection of properties to associate with this transaction.
    */
    @ReactMethod
    public void trackCharge(double charge, ReadableMap properties, Promise promise)
    {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(properties);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }
        if(mInstance == null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {
            mInstance.getPeople().trackCharge(charge, jsonObject);
            promise.resolve(Constant.TRACK_CHARGE_SUCCESS);
        }
    }

    /*
    It will permanently clear the whole transaction history for the identified people profile.
    */

    @ReactMethod
    public void clearCharges(Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.getPeople().clearCharges();
            promise.resolve(Constant.CLEAR_CHARGE_SUCCESS);
        }
    }

    /*
    Add the given amount to an existing property on the identified user. If the user does not already
    have the associated property, the amount will be added to zero. To reduce a property,
    provide a negative number for the value.
    */

    @ReactMethod
    public void increment(String name, double incrementValue, Promise promise)
    {
        if(mInstance == null)
        {
            promise.resolve(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.getPeople().increment(name,incrementValue);
            promise.resolve(Constant.INCREMENT_SUCCESS);
        }
    }


   /*
    Change the existing values of multiple People Analytics properties at once.

    If the user does not already have the associated property, the amount will
    be added to zero. To reduce a property, provide a negative number for the value.

    @param properties A map of String properties names to Long amounts. Each
    property associated with a name in the map will have its value changed by the given amount.
    */

    @ReactMethod
    public void increment(ReadableMap properties, Promise promise)
    {
        Map map = ReactNativeHelper.toMap(properties);

        if(mInstance == null || map == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.getPeople().increment(map);
            promise.resolve(Constant.INCREMENT_SUCCESS);
        }
    }

    @ReactMethod
    public void append(String name, ReadableArray properties, Promise promise)
    {
        JSONArray jsonArray = null;
        try
        {
            jsonArray = ReactNativeHelper.reactToJSON(properties);
        }
        catch(JSONException e)
        {
            e.printStackTrace();
        }

        if(mInstance == null || jsonArray == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {
            mInstance.getPeople().append(name, jsonArray);
            promise.resolve(Constant.APPEND_SUCCESS);
        }
    }

    @ReactMethod
    public void deleteUser(Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.getPeople().deleteUser();
            promise.resolve(Constant.DELETE_SUCCESS);
        }
    }

    @ReactMethod
    public void merge(String propertyName, ReadableMap updates, Promise promise)
    {
        JSONObject jsonObject = null;
        try
        {
            jsonObject = ReactNativeHelper.reactToJSON(updates);
        }
        catch (JSONException e)
        {
            e.printStackTrace();
        }
        if(mInstance == null || jsonObject == null)
        {
            promise.reject(new Throwable(Constant.NULL_EXCEPTION));
        }
        else
        {
            mInstance.getPeople().merge(propertyName,jsonObject);
            promise.resolve(Constant.MERGE_SUCCESS);
        }
    }

    @ReactMethod
    public void setPushRegistrationId(String token, Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.getPeople().setPushRegistrationId(token);
            promise.resolve(Constant.SET_PUSH_REGISTRATION_ID_SUCCESS);
        }
    }

    @ReactMethod
    public void getPushRegistrationId(Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            promise.resolve(mInstance.getPeople().getPushRegistrationId());
        }
    }

    @ReactMethod
    public void clearPushRegistrationId(String registrationId, Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.getPeople().clearPushRegistrationId(registrationId);
            promise.resolve(Constant.ClEAR_PUSH_REGISTRATION_ID_SUCCESS);
        }
    }

    @ReactMethod
    public void clearPushRegistrationId(Promise promise)
    {
        if(mInstance == null)
        {
            promise.reject(new Throwable(Constant.INSTANCE_NOT_FOUND_ERROR));
        }
        else
        {
            mInstance.getPeople().clearPushRegistrationId();
            promise.resolve(Constant.ClEAR_ALL_PUSH_REGISTRATION_ID_SUCCESS);
        }
    }


    //endregion


   


}