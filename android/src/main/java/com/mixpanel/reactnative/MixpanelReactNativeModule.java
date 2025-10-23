package com.mixpanel.reactnative;

import com.mixpanel.android.mpmetrics.MixpanelAPI;
import com.mixpanel.android.mpmetrics.MixpanelOptions;
import com.mixpanel.android.mpmetrics.MixpanelFlagVariant;
import com.mixpanel.android.mpmetrics.FlagCompletionCallback;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Callback;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.Arrays;

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


    @ReactMethod
    public void initialize(String token, boolean trackAutomaticEvents, boolean optOutTrackingDefault, ReadableMap metadata, String serverURL, boolean useGzipCompression, ReadableMap featureFlagsOptions, Promise promise) throws JSONException {
        JSONObject mixpanelProperties = ReactNativeHelper.reactToJSON(metadata);
        AutomaticProperties.setAutomaticProperties(mixpanelProperties);

        // Handle feature flags options
        boolean featureFlagsEnabled = false;
        JSONObject featureFlagsContext = null;

        if (featureFlagsOptions != null && featureFlagsOptions.hasKey("enabled")) {
            featureFlagsEnabled = featureFlagsOptions.getBoolean("enabled");

            if (featureFlagsOptions.hasKey("context")) {
                featureFlagsContext = ReactNativeHelper.reactToJSON(featureFlagsOptions.getMap("context"));
            }
        }

        // Create Mixpanel instance with feature flags configuration
        MixpanelOptions.Builder optionsBuilder = new MixpanelOptions.Builder()
            .optOutTrackingDefault(optOutTrackingDefault)
            .superProperties(mixpanelProperties)
            .featureFlagsEnabled(featureFlagsEnabled);

        if (featureFlagsContext != null) {
            optionsBuilder.featureFlagsContext(featureFlagsContext);
        }

        MixpanelOptions options = optionsBuilder.build();

        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, trackAutomaticEvents, options);
        instance.setServerURL(serverURL);
        if (useGzipCompression) {
            instance.setShouldGzipRequestPayload(true);
        }
        promise.resolve(null);
    }

    @ReactMethod
    public void setServerURL(final String token, final String serverURL, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.setServerURL(serverURL);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void setUseIpAddressForGeolocation(final String token, boolean useIpAddressForGeolocation, Promise promise)
            throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.setUseIpAddressForGeolocation(useIpAddressForGeolocation);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void setFlushBatchSize(final String token, Integer flushBatchSize, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.setFlushBatchSize(flushBatchSize);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void setLoggingEnabled(final String token, boolean enableLogging, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.setEnableLogging(enableLogging);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void hasOptedOutTracking(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            promise.resolve(instance.hasOptedOutTracking());
        }
    }

    @ReactMethod
    public void optInTracking(final String token, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.optInTracking();
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void optOutTracking(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.optOutTracking();
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void identify(final String token, final String distinctId, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.identify(distinctId);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void getDistinctId(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            promise.resolve(instance.getDistinctId());
        }
    }

    @ReactMethod
    public void getDeviceId(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            promise.resolve(instance.getAnonymousId());
        }
    }

    @ReactMethod
    public void track(final String token, final String eventName, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            JSONObject eventProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(eventProperties);
            instance.track(eventName, eventProperties);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void registerSuperProperties(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            JSONObject superProperties = ReactNativeHelper.reactToJSON(properties);
            instance.registerSuperProperties(superProperties);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void registerSuperPropertiesOnce(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            JSONObject superProperties = ReactNativeHelper.reactToJSON(properties);
            instance.registerSuperPropertiesOnce(superProperties);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void unregisterSuperProperty(final String token, String superPropertyName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.unregisterSuperProperty(superPropertyName);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void union(final String token, String name, ReadableArray value, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            JSONArray propertyValue = ReactNativeHelper.reactToJSON(value);
            instance.getPeople().union(name, propertyValue);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void getSuperProperties(final String token, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            promise.resolve(ReactNativeHelper.convertJsonToMap(instance.getSuperProperties()));
        }
    }

    @ReactMethod
    public void clearSuperProperties(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.clearSuperProperties();
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void alias(final String token, String alias, String original, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.alias(alias, original);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void reset(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.reset();
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void flush(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.flush();
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void timeEvent(final String token, final String eventName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.timeEvent(eventName);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void eventElapsedTime(final String token, final String eventName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            promise.resolve(instance.eventElapsedTime(eventName));
        }
    }

    @ReactMethod
    public void set(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            JSONObject sendProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(sendProperties);
            instance.getPeople().set(sendProperties);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void unset(final String token, String propertyName, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.getPeople().unset(propertyName);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void setOnce(final String token, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            JSONObject sendProperties = ReactNativeHelper.reactToJSON(properties);
            AutomaticProperties.appendLibraryProperties(sendProperties);
            instance.getPeople().setOnce(sendProperties);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void trackCharge(final String token, double charge, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            JSONObject transactionValue = ReactNativeHelper.reactToJSON(properties);
            instance.getPeople().trackCharge(charge, transactionValue);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void clearCharges(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.getPeople().clearCharges();
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void increment(final String token, ReadableMap properties, Promise promise) {
        Map incrementProperties = ReactNativeHelper.toMap(properties);
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.getPeople().increment(incrementProperties);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void append(final String token, String name, Dynamic value, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.getPeople().append(name, ReactNativeHelper.dynamicToObject(value));
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void deleteUser(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.getPeople().deleteUser();
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void remove(final String token, String name, Dynamic value, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.getPeople().remove(name, ReactNativeHelper.dynamicToObject(value));
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void trackWithGroups(final String token, String eventName, ReadableMap properties, ReadableMap groups, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            Map eventProperties = ReactNativeHelper.toMap(properties);
            Map eventGroups = ReactNativeHelper.toMap(groups);
            instance.trackWithGroups(eventName, eventProperties, eventGroups);
            promise.resolve(null);
        }
    }


    @ReactMethod
    public void setGroup(final String token, String groupKey, Dynamic groupID, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.setGroup(groupKey, ReactNativeHelper.dynamicToObject(groupID));
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void setGroups(final String token, String groupKey, ReadableArray groupIDs, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.setGroup(groupKey, Arrays.asList(ReactNativeHelper.toArray(groupIDs)));
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void addGroup(final String token, String groupKey, Dynamic groupID, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.addGroup(groupKey, ReactNativeHelper.dynamicToObject(groupID));
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void removeGroup(final String token, String groupKey, Dynamic groupID, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.removeGroup(groupKey, ReactNativeHelper.dynamicToObject(groupID));
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void deleteGroup(final String token, String groupKey, Dynamic groupID, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.getGroup(groupKey, ReactNativeHelper.dynamicToObject(groupID)).deleteGroup();
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void groupSetProperties(final String token, String groupKey, Dynamic groupID, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            JSONObject sendProperties = ReactNativeHelper.reactToJSON(properties);
            instance.getGroup(groupKey, ReactNativeHelper.dynamicToObject(groupID)).set(sendProperties);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void groupSetPropertyOnce(final String token, String groupKey, Dynamic groupID, ReadableMap properties, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            JSONObject sendProperties = ReactNativeHelper.reactToJSON(properties);
            instance.getGroup(groupKey, ReactNativeHelper.dynamicToObject(groupID)).setOnce(sendProperties);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void groupUnsetProperty(final String token, String groupKey, Dynamic groupID, String propertyName, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.getGroup(groupKey, ReactNativeHelper.dynamicToObject(groupID)).unset(propertyName);
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void groupRemovePropertyValue(final String token, String groupKey, Dynamic groupID, String name, Dynamic value, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.getGroup(groupKey, ReactNativeHelper.dynamicToObject(groupID)).remove(name, ReactNativeHelper.dynamicToObject(value));
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void groupUnionProperty(final String token, String groupKey, Dynamic groupID, String name, ReadableArray values, Promise promise) throws JSONException {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            JSONArray arrayValues = ReactNativeHelper.reactToJSON(values);
            instance.getGroup(groupKey, ReactNativeHelper.dynamicToObject(groupID)).union(name, arrayValues);
            promise.resolve(null);
        }
    }

    // Feature Flags Methods

    @ReactMethod
    public void loadFlags(final String token, Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token);
        if (instance == null) {
            promise.reject("Instance Error", "Failed to get Mixpanel instance");
            return;
        }
        synchronized (instance) {
            instance.getFlags().loadFlags();
            promise.resolve(null);
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public boolean areFlagsReadySync(final String token) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            return false;
        }
        synchronized (instance) {
            return instance.getFlags().areFlagsReady();
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap getVariantSync(final String token, String featureName, ReadableMap fallback) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            return convertVariantToMap(fallback);
        }

        synchronized (instance) {
            MixpanelFlagVariant fallbackVariant = convertMapToVariant(fallback);
            MixpanelFlagVariant variant = instance.getFlags().getVariantSync(featureName, fallbackVariant);
            return convertVariantToWritableMap(variant);
        }
    }

    // Note: For getVariantValueSync, we'll return the full variant and extract value in JS
    // React Native doesn't support returning Dynamic types from synchronous methods
    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap getVariantValueSync(final String token, String featureName, Dynamic fallbackValue) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);

        WritableMap result = new WritableNativeMap();
        if (instance == null) {
            result.putString("type", "fallback");
            // We'll handle the conversion in JavaScript
            return result;
        }

        synchronized (instance) {
            Object value = instance.getFlags().getVariantValueSync(featureName, ReactNativeHelper.dynamicToObject(fallbackValue));
            result.putString("type", "value");

            // Convert value to appropriate type
            if (value == null) {
                result.putNull("value");
            } else if (value instanceof String) {
                result.putString("value", (String) value);
            } else if (value instanceof Boolean) {
                result.putBoolean("value", (Boolean) value);
            } else if (value instanceof Integer) {
                result.putInt("value", (Integer) value);
            } else if (value instanceof Double) {
                result.putDouble("value", (Double) value);
            } else if (value instanceof Float) {
                result.putDouble("value", ((Float) value).doubleValue());
            } else if (value instanceof Long) {
                result.putDouble("value", ((Long) value).doubleValue());
            } else {
                result.putString("value", value.toString());
            }

            return result;
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public boolean isEnabledSync(final String token, String featureName, boolean fallbackValue) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            return fallbackValue;
        }

        synchronized (instance) {
            return instance.getFlags().isEnabledSync(featureName, fallbackValue);
        }
    }

    @ReactMethod
    public void getVariant(final String token, String featureName, ReadableMap fallback, final Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.resolve(convertVariantToMap(fallback));
            return;
        }

        synchronized (instance) {
            MixpanelFlagVariant fallbackVariant = convertMapToVariant(fallback);
            instance.getFlags().getVariant(featureName, fallbackVariant, new FlagCompletionCallback<MixpanelFlagVariant>() {
                @Override
                public void onComplete(MixpanelFlagVariant variant) {
                    promise.resolve(convertVariantToWritableMap(variant));
                }
            });
        }
    }

    @ReactMethod
    public void getVariantValue(final String token, String featureName, Dynamic fallbackValue, final Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.resolve(fallbackValue);
            return;
        }

        synchronized (instance) {
            Object fallbackObj = ReactNativeHelper.dynamicToObject(fallbackValue);
            instance.getFlags().getVariantValue(featureName, fallbackObj, new FlagCompletionCallback<Object>() {
                @Override
                public void onComplete(Object value) {
                    // Convert the value back to a format React Native can handle
                    if (value == null) {
                        promise.resolve(null);
                    } else if (value instanceof String) {
                        promise.resolve((String) value);
                    } else if (value instanceof Boolean) {
                        promise.resolve((Boolean) value);
                    } else if (value instanceof Number) {
                        promise.resolve(((Number) value).doubleValue());
                    } else if (value instanceof JSONObject) {
                        try {
                            WritableMap map = ReactNativeHelper.convertJsonToMap((JSONObject) value);
                            promise.resolve(map);
                        } catch (Exception e) {
                            promise.resolve(value.toString());
                        }
                    } else if (value instanceof JSONArray) {
                        try {
                            WritableArray array = ReactNativeHelper.convertJsonToArray((JSONArray) value);
                            promise.resolve(array);
                        } catch (Exception e) {
                            promise.resolve(value.toString());
                        }
                    } else {
                        promise.resolve(value.toString());
                    }
                }
            });
        }
    }

    @ReactMethod
    public void isEnabled(final String token, String featureName, boolean fallbackValue, final Promise promise) {
        MixpanelAPI instance = MixpanelAPI.getInstance(this.mReactContext, token, true);
        if (instance == null) {
            promise.resolve(fallbackValue);
            return;
        }

        synchronized (instance) {
            instance.getFlags().isEnabled(featureName, fallbackValue, new FlagCompletionCallback<Boolean>() {
                @Override
                public void onComplete(Boolean isEnabled) {
                    promise.resolve(isEnabled);
                }
            });
        }
    }

    // Helper methods for variant conversion
    private MixpanelFlagVariant convertMapToVariant(ReadableMap map) {
        if (map == null) {
            return new MixpanelFlagVariant("", null);
        }

        String key = map.hasKey("key") ? map.getString("key") : "";
        Object value = map.hasKey("value") ? ReactNativeHelper.dynamicToObject(map.getDynamic("value")) : null;
        String experimentID = map.hasKey("experimentID") ? map.getString("experimentID") : null;
        Boolean isExperimentActive = map.hasKey("isExperimentActive") ? map.getBoolean("isExperimentActive") : null;
        Boolean isQATester = map.hasKey("isQATester") ? map.getBoolean("isQATester") : null;

        // Create variant with all properties using the full constructor
        return new MixpanelFlagVariant(key, value, experimentID, isExperimentActive, isQATester);
    }

    private WritableMap convertVariantToMap(ReadableMap source) {
        WritableMap map = new WritableNativeMap();
        if (source != null) {
            map.merge(source);
        }
        return map;
    }

    private WritableMap convertVariantToWritableMap(MixpanelFlagVariant variant) {
        WritableMap map = new WritableNativeMap();

        if (variant != null) {
            map.putString("key", variant.key);

            Object value = variant.value;
            if (value == null) {
                map.putNull("value");
            } else if (value instanceof String) {
                map.putString("value", (String) value);
            } else if (value instanceof Boolean) {
                map.putBoolean("value", (Boolean) value);
            } else if (value instanceof Integer) {
                map.putInt("value", (Integer) value);
            } else if (value instanceof Double) {
                map.putDouble("value", (Double) value);
            } else if (value instanceof Float) {
                map.putDouble("value", ((Float) value).doubleValue());
            } else if (value instanceof Long) {
                map.putDouble("value", ((Long) value).doubleValue());
            } else {
                // For complex objects, convert to string
                map.putString("value", value.toString());
            }

            // Add optional fields if they exist
            if (variant.experimentID != null) {
                map.putString("experimentID", variant.experimentID);
            }
            if (variant.isExperimentActive != null) {
                map.putBoolean("isExperimentActive", variant.isExperimentActive);
            }
            if (variant.isQATester != null) {
                map.putBoolean("isQATester", variant.isQATester);
            }
        }

        return map;
    }
}
