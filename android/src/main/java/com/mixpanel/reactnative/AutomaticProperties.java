package com.mixpanel.reactnative;

import org.json.JSONException;
import org.json.JSONObject;

public class AutomaticProperties {
    private static final String MP_LIB_KEY ="mp_lib";
    private static final String MP_LIB_VALUE="react-native";
    private static final String VERSION_KEY="$lib_version";
    private static final String VERSION_VALUE="1.0.0";

    public static void appendLibraryProperties(JSONObject properties) throws JSONException {
        if (properties == null){
            properties = new JSONObject();
        }
        properties.put(MP_LIB_KEY,MP_LIB_VALUE);
        properties.put(VERSION_KEY,VERSION_VALUE);
    }
}
