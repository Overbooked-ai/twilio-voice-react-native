package com.twiliovoicereactnative.expo

import android.content.Context
import com.twiliovoicereactnative.JSEventEmitter
import com.twiliovoicereactnative.VoiceApplicationProxy
import com.twiliovoicereactnative.CallListenerProxy
import com.twiliovoicereactnative.CallRecordDatabase
import com.twiliovoicereactnative.CommonConstants
import com.twiliovoicereactnative.ReactNativeArgumentsSerializerExpo
import com.twiliovoicereactnative.SDKLog
import com.twilio.voice.Call
import com.twilio.voice.CallException
import com.twilio.voice.CallInvite
import java.util.UUID

class ExpoCallListenerProxy(
  private val uuid: UUID,
  private val context: Context
) : CallListenerProxy(uuid, context) {

  override fun onConnectFailure(call: Call, callException: CallException) {
    SDKLog.d(TAG, "onConnectFailure: $callException")
    val jsEventEmitter = VoiceApplicationProxy.getJSEventEmitter()
    if (jsEventEmitter != null) {
      val event = ReactNativeArgumentsSerializerExpo.serializeCallException(callException)
      jsEventEmitter.sendEvent(CommonConstants.CallEventConnectFailure, event)
    }
  }

  override fun onConnected(call: Call) {
    SDKLog.d(TAG, "onConnected")
    val jsEventEmitter = VoiceApplicationProxy.getJSEventEmitter()
    if (jsEventEmitter != null) {
      val event = ReactNativeArgumentsSerializerExpo.serializeCall(call)
      jsEventEmitter.sendEvent(CommonConstants.CallEventConnected, event)
    }
  }

  override fun onDisconnected(call: Call, callException: CallException?) {
    SDKLog.d(TAG, "onDisconnected")
    val jsEventEmitter = VoiceApplicationProxy.getJSEventEmitter()
    if (jsEventEmitter != null) {
      val event = ReactNativeArgumentsSerializerExpo.serializeCall(call)
      jsEventEmitter.sendEvent(CommonConstants.CallEventDisconnected, event)
    }
    CallRecordDatabase.getInstance(context).removeCall(uuid)
  }

  override fun onReconnecting(call: Call, callException: CallException) {
    SDKLog.d(TAG, "onReconnecting: $callException")
    val jsEventEmitter = VoiceApplicationProxy.getJSEventEmitter()
    if (jsEventEmitter != null) {
      val event = ReactNativeArgumentsSerializerExpo.serializeCall(call)
      jsEventEmitter.sendEvent(CommonConstants.CallEventReconnecting, event)
    }
  }

  override fun onReconnected(call: Call) {
    SDKLog.d(TAG, "onReconnected")
    val jsEventEmitter = VoiceApplicationProxy.getJSEventEmitter()
    if (jsEventEmitter != null) {
      val event = ReactNativeArgumentsSerializerExpo.serializeCall(call)
      jsEventEmitter.sendEvent(CommonConstants.CallEventReconnected, event)
    }
  }

  override fun onRinging(call: Call) {
    SDKLog.d(TAG, "onRinging")
    val jsEventEmitter = VoiceApplicationProxy.getJSEventEmitter()
    if (jsEventEmitter != null) {
      val event = ReactNativeArgumentsSerializerExpo.serializeCall(call)
      jsEventEmitter.sendEvent(CommonConstants.CallEventRinging, event)
    }
  }

  companion object {
    private const val TAG = "ExpoCallListenerProxy"
  }
} 