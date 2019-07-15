
package com.mp;

import android.provider.SyncStateContract;

import com.facebook.common.references.SharedReference;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.mixpanel.android.mpmetrics.MixpanelAPI;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class MixpanelModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext mReactContext;
    private People mPeople;
    private MixpanelAPI mInstance;
    public MixpanelModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "Mixpanel";
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

    //endregion

    public People getPeople()
    {
        if(mPeople == null)
             mPeople = new People(mInstance);
        return mPeople;
    }


   


}