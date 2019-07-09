
package com.mp;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;


public class MixpanelReactNativeModule extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;

  public MixpanelReactNativeModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "MixpanelReactNative";
  }

  @ReactMethod
  public void getInformation(Promise promise) {
    promise.resolve("Android worked!!");
  }
}