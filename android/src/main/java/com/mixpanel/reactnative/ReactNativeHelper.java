package com.mixpanel.reactnative;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.google.gson.Gson;

public class ReactNativeHelper {
    public static JSONObject reactToJSON(ReadableMap value) throws JSONException {
        JSONObject properties = new JSONObject();
        ReadableMapKeySetIterator iterator = value.keySetIterator();

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableType valueType = value.getType(key);
            
            switch (valueType) {
                case Null:
                    properties.put(key, JSONObject.NULL);
                    break;
                case Boolean:
                    properties.put(key, value.getBoolean(key));
                    break;
                case Number:
                    properties.put(key, value.getDouble(key));
                    break;
                case String:
                    properties.put(key, value.getString(key));
                    break;
                case Map:
                    properties.put(key, reactToJSON(value.getMap(key)));
                    break;
                case Array:
                    properties.put(key, reactToJSON(value.getArray(key)));
                    break;
                default:
                    throw new IllegalArgumentException(Constant.UNSUPPORTED_TYPE + valueType);
            }
        }
        return properties;
    }

    public static JSONArray reactToJSON(ReadableArray value) throws JSONException {
        JSONArray properties = new JSONArray();

        for (int i = 0; i < value.size(); i++) {
            ReadableType valueType = value.getType(i);

            switch (valueType) {
                case Null:
                    properties.put(JSONObject.NULL);
                    break;
                case Boolean:
                    properties.put(value.getBoolean(i));
                    break;
                case Number:
                    properties.put(value.getDouble(i));
                    break;
                case String:
                    properties.put(value.getString(i));
                    break;
                case Map:
                    properties.put(reactToJSON(value.getMap(i)));
                    break;
                case Array:
                    properties.put(reactToJSON(value.getArray(i)));
                    break;
                default:
                    throw new IllegalArgumentException(Constant.UNSUPPORTED_TYPE + valueType);
            }
        }
        return properties;
    }

    public static Map<String, Object> toMap(ReadableMap value) {
        Map<String, Object> mapProperties = new HashMap<>();
        ReadableMapKeySetIterator iterator = value.keySetIterator();

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableType type = value.getType(key);

            switch (type) {
                case Null:
                    mapProperties.put(key, null);
                    break;
                case Boolean:
                    mapProperties.put(key, value.getBoolean(key));
                    break;
                case Number:
                    mapProperties.put(key, value.getDouble(key));
                    break;
                case String:
                    mapProperties.put(key, value.getString(key));
                    break;
                case Map:
                    mapProperties.put(key, toMap(value.getMap(key)));
                    break;
                case Array:
                    mapProperties.put(key, toArray(value.getArray(key)));
                    break;
            }
        }
        return mapProperties;
    }

    public static Object[] toArray(ReadableArray value) {
        Object[] propertyList = new Object[value.size()];

        for (int i = 0; i < value.size(); i++) {
            ReadableType type = value.getType(i);
            
            switch (type) {
                case Null:
                    propertyList[i] = null;
                    break;
                case Boolean:
                    propertyList[i] = value.getBoolean(i);
                    break;
                case Number:
                    propertyList[i] = value.getDouble(i);
                    break;
                case String:
                    propertyList[i] = value.getString(i);
                    break;
                case Map:
                    propertyList[i] = toMap(value.getMap(i));
                    break;
                case Array:
                    propertyList[i] = toArray(value.getArray(i));
                    break;
            }
        }
        return propertyList;
    }

    public static WritableMap convertJsonToMap(JSONObject properties) throws JSONException {
        WritableMap mapProperties = new WritableNativeMap();
        Iterator<String> iterator = properties.keys();

        while (iterator.hasNext()) {
            String key = iterator.next();
            Object value = properties.get(key);

            if (value instanceof JSONObject) {
                mapProperties.putMap(key, convertJsonToMap((JSONObject) value));
            } else if (value instanceof JSONArray) {
                mapProperties.putArray(key, convertJsonToArray((JSONArray) value));
            } else if (value instanceof Boolean) {
                mapProperties.putBoolean(key, (Boolean) value);
            } else if (value instanceof Integer) {
                mapProperties.putInt(key, (Integer) value);
            } else if (value instanceof Double) {
                mapProperties.putDouble(key, (Double) value);
            } else if (value instanceof String) {
                mapProperties.putString(key, (String) value);
            } else {
                mapProperties.putString(key, value.toString());
            }
        }
        return mapProperties;
    }

    public static WritableArray convertJsonToArray(JSONArray properties) throws JSONException {
        WritableArray propertyList = new WritableNativeArray();

        for (int i = 0; i < properties.length(); i++) {
            Object value = properties.get(i);

            if (value instanceof JSONObject) {
                propertyList.pushMap(convertJsonToMap((JSONObject) value));
            } else if (value instanceof JSONArray) {
                propertyList.pushArray(convertJsonToArray((JSONArray) value));
            } else if (value instanceof Boolean) {
                propertyList.pushBoolean((Boolean) value);
            } else if (value instanceof Integer) {
                propertyList.pushInt((Integer) value);
            } else if (value instanceof Double) {
                propertyList.pushDouble((Double) value);
            } else if (value instanceof String) {
                propertyList.pushString((String) value);
            } else {
                propertyList.pushString(value.toString());
            }
        }
        return propertyList;
    }

    public static JSONObject toJsonObject(Object value) throws JSONException {
        return (new JSONObject((new Gson()).toJson(value)));
    }

    public static void appendLibraryProperties(JSONObject properties) throws JSONException {
        if (properties == null) {
            properties = new JSONObject();
        }
        properties.put("mp_lib", "react-native");
        properties.put("$lib_version", "1.0.0");
    }
}
