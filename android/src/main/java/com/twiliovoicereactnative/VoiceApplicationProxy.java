package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.CallRecordDatabase.CallRecord;

import java.util.List;
import java.util.Objects;

import android.app.Application;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.twilio.audioswitch.AudioSwitch;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.RegistrationException;
import com.twilio.voice.RegistrationListener;
import com.twilio.voice.UnregistrationListener;
import com.twilio.voice.Voice;
import com.google.firebase.messaging.FirebaseMessaging;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

public class VoiceApplicationProxy {
  private static final String TAG = "VoiceApplicationProxy";
  private static VoiceApplicationProxy instance = null;
  private static final Object lock = new Object();
  private final Context context;
  private CallRecordDatabase callRecordDatabase;
  private AudioSwitchManager audioSwitchManager;
  private MediaPlayerManager mediaPlayerManager;
  private JSEventEmitter jsEventEmitter;
  private boolean isInitialized = false;
  private final ServiceConnection voiceServiceObserver = new ServiceConnection() {
    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
      if (name.getClassName().equals(VoiceService.class.getName()))
        voiceServiceApi = (VoiceService.VoiceServiceAPI)service;
    }
    @Override
    public void onServiceDisconnected(ComponentName name) {
      voiceServiceApi = null;
    }
  };
  private VoiceService.VoiceServiceAPI voiceServiceApi = null;

  public abstract static class VoiceReactNativeHost extends ReactNativeHost {
    public VoiceReactNativeHost(Application application) {
      super(application);
    }
    @Override
    protected List<ReactPackage> getPackages() {
      return List.of(new TwilioVoiceReactNativePackage());
    }
    public Application getAssociatedApplication() {
      return super.getApplication();
    }
  }

  // Constructor for standard React Native
  public VoiceApplicationProxy(VoiceReactNativeHost reactNativeHost) {
    synchronized (lock) {
      if (null != instance) {
        Log.e(TAG, "Voice application proxy already created!");
      }
      instance = this;
      this.context = reactNativeHost.getAssociatedApplication();
      initialize();
    }
  }

  // Constructor for Expo
  public VoiceApplicationProxy(Context context) {
    synchronized (lock) {
      if (null != instance) {
        Log.e(TAG, "Voice application proxy already created!");
      }
      instance = this;
      this.context = context;
      initialize();
    }
  }

  public static synchronized VoiceApplicationProxy getInstance(Context context) {
    synchronized (lock) {
      if (instance == null) {
        instance = new VoiceApplicationProxy(context);
        instance.onCreate(); // Initialize immediately after creation
      }
      return instance;
    }
  }

  public static synchronized VoiceApplicationProxy getInstance() {
    synchronized (lock) {
      if (instance == null) {
        throw new IllegalStateException("VoiceApplicationProxy not initialized. Call getInstance(Context) first.");
      }
      return instance;
    }
  }

  public synchronized CallRecordDatabase getCallRecordDatabase() {
    if (!isInitialized) {
      Log.e(TAG, "VoiceApplicationProxy not initialized");
      return null;
    }
    return callRecordDatabase;
  }

  public synchronized AudioSwitchManager getAudioSwitchManager() {
    if (!isInitialized) {
      Log.e(TAG, "VoiceApplicationProxy not initialized");
      return null;
    }
    return audioSwitchManager;
  }

  public synchronized MediaPlayerManager getMediaPlayerManager() {
    if (!isInitialized) {
      Log.e(TAG, "VoiceApplicationProxy not initialized");
      return null;
    }
    return mediaPlayerManager;
  }

  public synchronized JSEventEmitter getJSEventEmitter() {
    if (!isInitialized) {
      Log.e(TAG, "VoiceApplicationProxy not initialized");
      return null;
    }
    return jsEventEmitter;
  }

  public synchronized VoiceService.VoiceServiceAPI getVoiceServiceAPI() {
    if (!isInitialized) {
      Log.e(TAG, "VoiceApplicationProxy not initialized");
      return null;
    }
    return voiceServiceApi;
  }

  private void initialize() {
    if (isInitialized) {
      return;
    }

    callRecordDatabase = new CallRecordDatabase();
    audioSwitchManager = new AudioSwitchManager(context);
    mediaPlayerManager = new MediaPlayerManager(context);
    jsEventEmitter = new JSEventEmitter();
    
    isInitialized = true;
  }

  public void onCreate() {
    if (isInitialized) {
      return;
    }
    Log.d(TAG, "Initializing VoiceApplicationProxy");

    // Initialize components in order
    audioSwitchManager.start();
    // No need to call play() or start() here since it should be called with specific sounds when needed

    // Bind to voice service
    context.bindService(
      new Intent(context, VoiceService.class),
      voiceServiceObserver,
      Context.BIND_AUTO_CREATE);

    isInitialized = true;
  }

  public void onTerminate() {
    if (!isInitialized) {
      return;
    }
    Log.d(TAG, "Terminating VoiceApplicationProxy");

    // Unbind service first
    try {
      context.unbindService(voiceServiceObserver);
    } catch (IllegalArgumentException e) {
      Log.w(TAG, "Service was not bound", e);
    }

    // Stop components in reverse order
    mediaPlayerManager.stop();
    audioSwitchManager.stop();

    // Clean up notification channels
    NotificationUtility.destroyNotificationChannels(context);

    // Verify no call records are leaked
    for (CallRecord callRecord: callRecordDatabase.getCollection()) {
      Log.w(TAG,
        String.format(
          "Call Record leaked: { uuid: %s callSid: %s }",
          (null != callRecord.getUuid()) ? callRecord.getUuid() : "null",
          (null != callRecord.getCallSid()) ? callRecord.getCallSid() : "null"));
    }
    callRecordDatabase.clear();

    isInitialized = false;
  }

  public boolean isInitialized() {
    return isInitialized;
  }

  static Context getApplicationContext() {
    if (instance == null) {
      Log.e(TAG, "VoiceApplicationProxy not initialized!");
      return null;
    }
    return instance.context;
  }

  static Class<?> getMainActivityClass() {
    if (instance == null) {
      Log.e(TAG, "VoiceApplicationProxy not initialized!");
      return null;
    }
    Context context = instance.context;
    String packageName = context.getPackageName();
    Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
    ComponentName componentName = Objects.requireNonNull(launchIntent).getComponent();
    try {
      return Class.forName(Objects.requireNonNull(componentName).getClassName());
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }
}
