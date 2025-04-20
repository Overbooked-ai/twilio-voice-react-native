package com.twiliovoicereactnative;

import android.content.Context;
import expo.modules.core.BasePackage;
import expo.modules.core.interfaces.ExpoModule;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;
import expo.modules.core.interfaces.ApplicationLifecycleListener;

import java.util.Collections;
import java.util.List;

public class ExpoPackage extends BasePackage {
    @Override
    public List<ExpoModule> createExpoModules(Context context) {
        return Collections.singletonList(new ExpoModule());
    }

    @Override
    public List<ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
        return Collections.singletonList(new ExpoActivityLifecycleListener());
    }

    @Override
    public List<ApplicationLifecycleListener> createApplicationLifecycleListeners(Context applicationContext) {
        return Collections.singletonList(new ExpoApplicationLifecycleListener());
    }
} 