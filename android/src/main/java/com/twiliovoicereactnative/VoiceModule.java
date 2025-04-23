package com.twiliovoicereactnative;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class VoiceModule extends ReactContextBaseJavaModule {

  public VoiceModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "VoiceModule";
  }

  @ReactMethod
  public void voice_register(String token, Promise promise) {
    try {
      VoiceApplicationProxy.getInstance(getReactApplicationContext()).getVoiceServiceAPI().register(token);
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject("register_error", e);
    }
  }

  @ReactMethod
  public void voice_unregister(String token, Promise promise) {
    try {
      VoiceApplicationProxy.getInstance(getReactApplicationContext()).getVoiceServiceAPI().unregister(token);
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject("unregister_error", e);
    }
  }
} 