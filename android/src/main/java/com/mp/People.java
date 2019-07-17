package com.mp;

import com.facebook.common.references.SharedReference;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.mixpanel.android.mpmetrics.MixpanelAPI;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;


public class People {
    private final MixpanelAPI mInstance;

    public People(MixpanelAPI instance)
    {
        this.mInstance = instance;
    }

    //region React Native Methods

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
    Associate future calls to set(JSONObject), increment(Map), append(String, Object), etc... with a particular People Analytics user.
    All future calls to the People object will rely on this value to assign and increment properties.
    The user identification will persist across restarts of your application. We recommend calling People.
    identify as soon as you know the distinct id of the user.
    */
    @ReactMethod
    public void identify(final String distinctId, Promise promise)
    {
        if(mInstance == null)
        {
            promise.resolve(Constant.INSTANCE_NOT_FOUND_ERROR);
        }
        else
        {
            mInstance.getPeople().identify(distinctId);
            promise.resolve(Constant.IDENTIFIED_SUCCESS);
        }
    }

    /*
    Sets a single property with the given name and value for this user.
    The given name and value will be assigned to the user in Mixpanel People Analytics,
    possibly overwriting an existing property with the same name.
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
    public void increment(String name, Double incrementValue, Promise promise)
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

    //endregion
    
}