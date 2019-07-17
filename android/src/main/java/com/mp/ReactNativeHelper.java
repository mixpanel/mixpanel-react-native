package com.mp;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ReactNativeHelper {

   public static JSONObject reactToJSON(ReadableMap readableMap) throws JSONException
    {
        JSONObject jsonObject = new JSONObject();
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
        while(iterator.hasNextKey()){
            String key = iterator.nextKey();
            ReadableType valueType = readableMap.getType(key);
            switch (valueType){
                case Null:
                    jsonObject.put(key,JSONObject.NULL);
                    break;
                case Boolean:
                    jsonObject.put(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    jsonObject.put(key, readableMap.getDouble(key));
                    break;
                case String:
                    jsonObject.put(key, readableMap.getString(key));
                    break;
                case Map:
                    jsonObject.put(key, reactToJSON(readableMap.getMap(key)));
                    break;
                case Array:
                    jsonObject.put(key, reactToJSON(readableMap.getArray(key)));
                    break;
                default:
                    throw new IllegalArgumentException(Constant.UNSUPPORTED_TYPE + valueType);

            }
        }

        return jsonObject;
    }

    public static JSONArray reactToJSON(ReadableArray readableArray) throws JSONException {
        JSONArray jsonArray = new JSONArray();
        for(int i=0; i < readableArray.size(); i++) {
            ReadableType valueType = readableArray.getType(i);
            switch (valueType){
                case Null:
                    jsonArray.put(JSONObject.NULL);
                    break;
                case Boolean:
                    jsonArray.put(readableArray.getBoolean(i));
                    break;
                case Number:
                    jsonArray.put(readableArray.getDouble(i));
                    break;
                case String:
                    jsonArray.put(readableArray.getString(i));
                    break;
                case Map:
                    jsonArray.put(reactToJSON(readableArray.getMap(i)));
                    break;
                case Array:
                    jsonArray.put(reactToJSON(readableArray.getArray(i)));
                    break;
                default:
                    throw new IllegalArgumentException(Constant.UNSUPPORTED_TYPE + valueType);
            }
        }
        return jsonArray;
    }

    public static Map<String, Object> toMap(ReadableMap readableMap) {
        Map<String, Object> map = new HashMap<>();
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableType type = readableMap.getType(key);

            switch (type) {
                case Null:
                    map.put(key, null);
                    break;
                case Boolean:
                    map.put(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    map.put(key, readableMap.getDouble(key));
                    break;
                case String:
                    map.put(key, readableMap.getString(key));
                    break;
                case Map:
                    map.put(key, toMap(readableMap.getMap(key)));
                    break;
                case Array:
                    map.put(key, toArray(readableMap.getArray(key)));
                    break;
            }
        }

        return map;
    }
    public static Object[] toArray(ReadableArray readableArray) {
        Object[] array = new Object[readableArray.size()];

        for (int i = 0; i < readableArray.size(); i++) {
            ReadableType type = readableArray.getType(i);

            switch (type) {
                case Null:
                    array[i] = null;
                    break;
                case Boolean:
                    array[i] = readableArray.getBoolean(i);
                    break;
                case Number:
                    array[i] = readableArray.getDouble(i);
                    break;
                case String:
                    array[i] = readableArray.getString(i);
                    break;
                case Map:
                    array[i] = toMap(readableArray.getMap(i));
                    break;
                case Array:
                    array[i] = toArray(readableArray.getArray(i));
                    break;
            }
        }

        return array;
    }
}
