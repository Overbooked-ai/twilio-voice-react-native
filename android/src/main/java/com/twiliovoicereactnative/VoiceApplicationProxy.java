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
  private final Context context;
  private final CallRecordDatabase callRecordDatabase;
  private final AudioSwitchManager audioSwitchManager;
  private final MediaPlayerManager mediaPlayerManager;
  private final JSEventEmitter jsEventEmitter;
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
    if (null != instance) {
      Log.e(TAG, "Voice application proxy already created!");
    }
    instance = this;
    this.context = reactNativeHost.getAssociatedApplication();
    this.callRecordDatabase = new CallRecordDatabase();
    this.audioSwitchManager = new AudioSwitchManager(context);
    this.mediaPlayerManager = new MediaPlayerManager(context);
    this.jsEventEmitter = new JSEventEmitter();
  }

  // Constructor for Expo
  public VoiceApplicationProxy(Context context) {
    if (null != instance) {
      Log.e(TAG, "Voice application proxy already created!");
    }
    instance = this;
    this.context = context;
    this.callRecordDatabase = new CallRecordDatabase();
    this.audioSwitchManager = new AudioSwitchManager(context);
    this.mediaPlayerManager = new MediaPlayerManager(context);
    this.jsEventEmitter = new JSEventEmitter();
  }

  public static synchronized VoiceApplicationProxy getInstance(Context context) {
    if (instance == null) {
      instance = new VoiceApplicationProxy(context);
    }
    return instance;
  }

  public void onCreate() {
    if (isInitialized) {
      return;
    }
    Log.d(TAG, "Initializing VoiceApplicationProxy");
    audioSwitchManager.start();
    mediaPlayerManager.start();
    isInitialized = true;
    // launch and bind to voice call service
    context.bindService(
      new Intent(context, VoiceService.class),
      voiceServiceObserver,
      Context.BIND_AUTO_CREATE);
  }

  public void onTerminate() {
    if (!isInitialized) {
      return;
    }
    Log.d(TAG, "Terminating VoiceApplicationProxy");
    audioSwitchManager.stop();
    mediaPlayerManager.stop();
    // shutdown notificaiton channels
    NotificationUtility.destroyNotificationChannels(context);
    // verify that no call records are leaked
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

  public static CallRecordDatabase getCallRecordDatabase() {
    return VoiceApplicationProxy.instance.callRecordDatabase;
  }

  public static AudioSwitchManager getAudioSwitchManager() {
    return VoiceApplicationProxy.instance.audioSwitchManager;
  }

  public static MediaPlayerManager getMediaPlayerManager() {
    return VoiceApplicationProxy.instance.mediaPlayerManager;
  }

  public static JSEventEmitter getJSEventEmitter() {
    return VoiceApplicationProxy.instance.jsEventEmitter;
  }

  public boolean isInitialized() {
    return isInitialized;
  }

  static Context getApplicationContext() {
    return VoiceApplicationProxy.instance.context;
  }

  static Class<?> getMainActivityClass() {
    Context context = VoiceApplicationProxy.instance.context;
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

  static VoiceService.VoiceServiceAPI getVoiceServiceApi() {
    if (null == VoiceApplicationProxy.instance.voiceServiceApi) {
      Log.e(TAG, "Voice Service not bound!");
    }
    return VoiceApplicationProxy.instance.voiceServiceApi;
  }
}
