package com.twiliovoicereactnative.expo;

import android.app.Application;
import androidx.annotation.NonNull;

import com.twiliovoicereactnative.VoiceApplicationProxy;

import expo.modules.core.interfaces.ApplicationLifecycleListener;

public class ExpoApplicationLifecycleListeners implements ApplicationLifecycleListener {

  private VoiceApplicationProxy voiceApplicationProxy;

  @Override
  public void onCreate(@NonNull Application application) {
    // Initialize VoiceApplicationProxy. 
    // This proxy likely manages global state or services needed by the voice SDK.
    voiceApplicationProxy = new VoiceApplicationProxy(application);
    voiceApplicationProxy.onCreate();
  }

  @Override
  public void onTerminate() {
    // Perform cleanup if needed when the application terminates.
    // VoiceApplicationProxy might have resources to release.
    // Currently, VoiceApplicationProxy doesn't seem to have an onTerminate or similar method.
    voiceApplicationProxy = null; // Release reference
  }

  // Expose the proxy if needed by other components (e.g., ExpoModule)
  // This could be a static method or managed via the ExpoPackage
  public VoiceApplicationProxy getVoiceApplicationProxy() {
      return voiceApplicationProxy;
  }
} 