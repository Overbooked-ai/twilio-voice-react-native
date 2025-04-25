package com.twiliovoicereactnative.expo;

import android.app.Application;
import expo.modules.core.interfaces.ApplicationLifecycleListener;
import com.twiliovoicereactnative.VoiceApplicationProxy;

public class ExpoApplicationLifecycleListener implements ApplicationLifecycleListener {
  private VoiceApplicationProxy voiceApplicationProxy;

  @Override
  public void onCreate(Application application) {
    this.voiceApplicationProxy = VoiceApplicationProxy.getInstance(application);
    this.voiceApplicationProxy.onCreate();
  }

  @Override
  public void onConfigurationChanged(Application application) {
    if (voiceApplicationProxy != null) {
      voiceApplicationProxy.onConfigurationChanged();
    }
  }
} 