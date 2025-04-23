package com.twiliovoicereactnative

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Context
import com.twiliovoicereactnative.VoiceApplicationProxy
import expo.modules.kotlin.Promise

class ExpoModule : Module() {
  private var voiceApplicationProxy: VoiceApplicationProxy? = null

  override fun definition() = ModuleDefinition {
    Name("TwilioVoiceReactNativeExpo")

    OnCreate {
      val context = appContext.reactContext ?: return@OnCreate
      voiceApplicationProxy = VoiceApplicationProxy.getInstance(context)
      voiceApplicationProxy?.onCreate()
    }

    OnDestroy {
      voiceApplicationProxy?.onTerminate()
      voiceApplicationProxy = null
    }

    AsyncFunction("connect") { accessToken: String, options: Map<String, Any>, promise: Promise ->
      try {
        val params = (options["params"] as? Map<String, Any>) ?: emptyMap()
        val displayName = options["notificationDisplayName"] as? String
        val call = voiceApplicationProxy?.getVoiceServiceAPI()?.connect(accessToken, params, displayName)
        promise.resolve(call)
      } catch (e: Exception) {
        promise.reject("CONNECT_ERROR", e)
      }
    }

    // ... rest of the module definition ...
  }
} 