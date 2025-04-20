package com.twiliovoicereactnative;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Keep;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;

/**
 * Activity lifecycle listener that hooks into the Expo activity lifecycle
 * to handle Twilio Voice SDK activity events.
 */
@Keep
public class ExpoActivityLifecycleListener implements ReactActivityLifecycleListener {
    private VoiceActivityProxy voiceActivityProxy;

    /**
     * Called when the activity is created
     * @param activity The activity instance
     * @param savedInstanceState The saved instance state
     */
    @Override
    public void onCreate(Activity activity, Bundle savedInstanceState) {
        if (activity == null) return;
        
        this.voiceActivityProxy = new VoiceActivityProxy(
            activity,
            VoiceApplicationProxy.getPushRegistry(),
            VoiceApplicationProxy.getCallRecordDatabase()
        );
        this.voiceActivityProxy.onCreate(savedInstanceState);
    }

    /**
     * Called when the activity receives a new intent
     * @param intent The new intent
     * @return Whether the intent was handled
     */
    @Override
    public boolean onNewIntent(Intent intent) {
        if (this.voiceActivityProxy != null) {
            return this.voiceActivityProxy.onNewIntent(intent);
        }
        return false;
    }

    /**
     * Called when the activity is destroyed
     * @param activity The activity instance
     */
    @Override
    public void onDestroy(Activity activity) {
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onDestroy();
        }
    }

    /**
     * Called when the activity is resumed
     * @param activity The activity instance
     */
    @Override
    public void onResume(Activity activity) {
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onResume();
        }
    }

    /**
     * Called when the activity is paused
     * @param activity The activity instance
     */
    @Override
    public void onPause(Activity activity) {
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onPause();
        }
    }
} 