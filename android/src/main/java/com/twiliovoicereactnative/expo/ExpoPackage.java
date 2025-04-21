package com.twiliovoicereactnative.expo;

import android.content.Context;

import expo.modules.core.interfaces.Package;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;
import expo.modules.core.interfaces.ApplicationLifecycleListener;
import expo.modules.core.interfaces.SingletonModule;

import java.util.Collections;
import java.util.List;

public class ExpoPackage implements Package {

  // We need instances of the listeners to return them.
  // It might be better to manage these instances centrally if they need shared state.
  private ExpoActivityLifecycleListeners activityLifecycleListener;
  private ExpoApplicationLifecycleListeners applicationLifecycleListener;

  @Override
  public List<? extends ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
    if (activityLifecycleListener == null) {
        activityLifecycleListener = new ExpoActivityLifecycleListeners();
    }
    // This listener will receive activity lifecycle events (onCreate, onNewIntent, onDestroy, etc.)
    return Collections.singletonList(activityLifecycleListener);
  }

  @Override
  public List<? extends ApplicationLifecycleListener> createApplicationLifecycleListeners(Context applicationContext) {
    if (applicationLifecycleListener == null) {
        applicationLifecycleListener = new ExpoApplicationLifecycleListeners();
    }
    // This listener will receive application lifecycle events (onCreate, onTerminate)
    return Collections.singletonList(applicationLifecycleListener);
  }

  // We also need to register the ExpoModule itself. This is done in expo-module.config.json,
  // but Expo's Package interface also allows registering modules programmatically if needed.
  // For now, relying on expo-module.config.json is sufficient.
  /*
  @Override
  public List<SingletonModule> createSingletonModules(Context context) {
      // If ExpoModule needed to be a SingletonModule, register it here.
      return Collections.emptyList();
  }
  */

  // Method to potentially pass the Application Proxy to the Module if needed
  // This approach is cleaner than static access but requires careful lifecycle management.
  public ExpoApplicationLifecycleListeners getApplicationLifecycleListener() {
      return applicationLifecycleListener;
  }
} 