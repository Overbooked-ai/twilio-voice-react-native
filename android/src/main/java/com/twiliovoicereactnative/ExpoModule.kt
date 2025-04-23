package com.twiliovoicereactnative

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Context
import com.twiliovoicereactnative.VoiceApplicationProxy

class ExpoModule : Module() {
  private var voiceApplicationProxy: VoiceApplicationProxy? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoTwilioVoice")

    OnCreate {
      val context = appContext.reactContext ?: return@OnCreate
      voiceApplicationProxy = VoiceApplicationProxy.getInstance(context)
      voiceApplicationProxy?.onCreate()
    }

    OnDestroy {
      voiceApplicationProxy?.onTerminate()
      voiceApplicationProxy = null
    }

    // ... rest of the module definition ...
  }
} 