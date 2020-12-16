package com.mixpanel.reactnative;

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
     * This method will append library properties to the default properties.
     */
    public static void appendLibraryProperties(JSONObject properties) throws JSONException {
        if (properties == null) {
            properties = new JSONObject();
        }

        if (sAutomaticProperties != null) {
            // merge automatic properties
            for (Iterator<String> keys = sAutomaticProperties.keys(); keys.hasNext();) {
                String key = keys.next();
                properties.put(key, sAutomaticProperties.get(key));
            }
        }
    }
}
