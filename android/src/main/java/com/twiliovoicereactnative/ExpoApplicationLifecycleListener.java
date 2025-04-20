package com.twiliovoicereactnative;

import android.app.Application;
import androidx.annotation.Keep;
import expo.modules.core.interfaces.ApplicationLifecycleListener;

/**
 * Application lifecycle listener that hooks into the Expo application lifecycle
 * to initialize the Twilio Voice SDK.
 */
@Keep
public class ExpoApplicationLifecycleListener implements ApplicationLifecycleListener {
    private VoiceApplicationProxy voiceApplicationProxy;

    /**
     * Called when the application is created
     * @param application The application instance
     */
    @Override
    public void onCreate(Application application) {
        this.voiceApplicationProxy = new VoiceApplicationProxy(application);
        this.voiceApplicationProxy.onCreate();
    }

    /**
     * Called when the application is destroyed
     */
    @Override
    public void onDestroy() {
        if (this.voiceApplicationProxy != null) {
            this.voiceApplicationProxy.onDestroy();
        }
    }
} 