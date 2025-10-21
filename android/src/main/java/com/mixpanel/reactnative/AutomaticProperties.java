package com.mixpanel.reactnative;

import com.mixpanel.android.mpmetrics.MixpanelAPI;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;

public class AutomaticProperties {
    private static JSONObject sAutomaticProperties;

    /**
     * It will set the properties coming from json file.
     */
    public static void setAutomaticProperties(JSONObject properties) {
        sAutomaticProperties = properties;
    }

    /**
     * This method will append fresh super properties to the given properties.
     * Instead of using a stale static cache, it fetches super properties directly from the Android SDK
     * to ensure updated values are used.
     * 
     * @param instance The MixpanelAPI instance to get fresh super properties from
     * @param properties The properties object to append to (must not be null)
     * @throws JSONException If there's an error merging properties
     */
    public static void appendLibraryProperties(MixpanelAPI instance, JSONObject properties) throws JSONException {
        // Get fresh super properties from the Android SDK (not from stale static cache)
        if (instance != null && properties != null)) {
            JSONObject superProperties = instance.getSuperProperties();
            if (superProperties != null) {
                for (Iterator<String> keys = superProperties.keys(); keys.hasNext();) {
                    String key = keys.next();
                    properties.put(key, superProperties.get(key));
                }
            }
        }
    }
}
