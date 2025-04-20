package com.twiliovoicereactnative;

import android.content.Context;
import androidx.annotation.Keep;
import expo.modules.core.interfaces.ApplicationLifecycleListener;
import expo.modules.core.interfaces.Package;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;
import java.util.Collections;
import java.util.List;

/**
 * Expo Package that declares the lifecycle listeners for Twilio Voice
 */
@Keep
public class ExpoPackage implements Package {
    /**
     * Creates application lifecycle listeners
     * @param applicationContext The application context
     * @return A list containing the application lifecycle listener
     */
    @Override
    public List<? extends ApplicationLifecycleListener> createApplicationLifecycleListeners(Context applicationContext) {
        return Collections.singletonList(new ExpoApplicationLifecycleListener());
    }

    /**
     * Creates activity lifecycle listeners
     * @param activityContext The activity context
     * @return A list containing the activity lifecycle listener
     */
    @Override
    public List<? extends ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
        return Collections.singletonList(new ExpoActivityLifecycleListener());
    }
} 