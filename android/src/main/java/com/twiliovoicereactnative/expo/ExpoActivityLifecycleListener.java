package com.twiliovoicereactnative.expo;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;
import com.twiliovoicereactnative.VoiceActivityProxy;

public class ExpoActivityLifecycleListener implements ReactActivityLifecycleListener {
  private VoiceActivityProxy voiceActivityProxy;

  @Override
  public void onCreate(Activity activity, Bundle savedInstanceState) {
    this.voiceActivityProxy = new VoiceActivityProxy(activity);
    this.voiceActivityProxy.onCreate(savedInstanceState);
  }

  @Override
  public void onNewIntent(Intent intent) {
    if (voiceActivityProxy != null) {
      voiceActivityProxy.onNewIntent(intent);
    }
  }

  @Override
  public void onDestroy(Activity activity) {
    if (voiceActivityProxy != null) {
      voiceActivityProxy.onDestroy();
    }
  }
} 