package com.twiliovoicereactnative.expo;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.twiliovoicereactnative.VoiceActivityProxy;

import expo.modules.core.interfaces.ReactActivityLifecycleListener;

public class ExpoActivityLifecycleListeners implements ReactActivityLifecycleListener {

  private VoiceActivityProxy voiceActivityProxy;

  @Override
  public void onCreate(@NonNull Activity activity, @Nullable Bundle savedInstanceState) {
    // Assuming VoiceActivityProxy requires activity context
    // We need access to the original TwilioVoiceReactNativeModule instance or a way to get JSEventEmitter
    // This part requires careful handling of dependencies and initialization order.
    // Placeholder: Need to figure out how to correctly instantiate VoiceActivityProxy
    // Option 1: Pass JSEventEmitter instance during initialization.
    // Option 2: Use a static accessor (potentially problematic).
    // Option 3: Refactor VoiceActivityProxy dependency.
    
    // For now, let's assume we can get the context, but JSEventEmitter is tricky.
    // voiceActivityProxy = new VoiceActivityProxy(activity, /* How to get JSEventEmitter? */);
    // if (voiceActivityProxy != null) {
    //     voiceActivityProxy.onCreate(savedInstanceState);
    // }
  }

  @Override
  public void onNewIntent(@NonNull Intent intent) {
    if (voiceActivityProxy != null) {
      voiceActivityProxy.onNewIntent(intent);
    }
  }

  @Override
  public void onDestroy(@NonNull Activity activity) {
    if (voiceActivityProxy != null) {
      // VoiceActivityProxy's onDestroy doesn't take activity
      // voiceActivityProxy.onDestroy(); 
      // Consider if cleanup is needed here or if it's tied to the module's lifecycle
    }
    voiceActivityProxy = null; // Release reference
  }

  // Other lifecycle methods can be added if needed by VoiceActivityProxy
  // e.g., onResume, onPause, onStop, onSaveInstanceState
} 