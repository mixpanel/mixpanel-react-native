package com.mixpanel.reactnative;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;

public class AutomaticProperties {
    private static JSONObject sAutomaticProperties;

    public static void setAutomaticProperties(JSONObject properties) {
        sAutomaticProperties = properties;
    }
    
    public static void appendLibraryProperties(JSONObject properties) throws JSONException {
        if (properties == null) {
            properties = new JSONObject();
        }

        //merge automatic properties
        for(Iterator<String> keys = sAutomaticProperties.keys(); keys.hasNext();) {
            String key = keys.next();
            properties.put(key, sAutomaticProperties.get(key));
        }
    }
}
