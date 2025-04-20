package com.twiliovoicereactnative

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.util.Log
import com.twilio.voice.Call
import com.twilio.voice.CallException
import com.twilio.voice.CallInvite
import com.twilio.voice.ConnectOptions
import com.twilio.voice.Voice
import java.util.UUID
import com.facebook.react.bridge.ReactApplicationContext

class ExpoModule : Module() {
    private val TAG = "TwilioVoiceExpoModule"

    override fun definition() = ModuleDefinition {
        Name("TwilioVoice")

        OnCreate {
            try {
                Log.d(TAG, "Initializing TwilioVoice Expo Module")
                val reactContext = appContext.reactContext
                if (reactContext is ReactApplicationContext) {
                    val emitter = VoiceApplicationProxy.getJSEventEmitter()
                    if (emitter != null) {
                        emitter.setContext(reactContext)
                        Log.d(TAG, "Successfully set context for JSEventEmitter")
                    } else {
                        Log.e(TAG, "Error: JSEventEmitter is null - could not set context")
                    }
                } else {
                    Log.e(TAG, "Error: Could not get ReactApplicationContext")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error initializing TwilioVoice Expo Module: ${e.message}", e)
            }
        }

        Function("voice_connect") { accessToken: String ->
            try {
                Log.d(TAG, "Attempting to make outgoing call with access token")
                val context = appContext.reactContext
                if (context == null) {
                    Log.e(TAG, "Error: React context is null")
                    throw IllegalStateException("React context is null")
                }

                val connectOptions = ConnectOptions.Builder(accessToken)
                    .enableInsights(true)
                    .build()
                    
                val uuid = UUID.randomUUID()
                val callListenerProxy = CallListenerProxy(uuid, context)
                
                val call = Voice.connect(context, connectOptions, callListenerProxy)
                
                // Store the call record in the database
                val callRecord = CallRecordDatabase.CallRecord(
                    uuid,
                    call,
                    "Outgoing Call", // This could be parameterized in the future
                    HashMap(),
                    CallRecord.Direction.Outgoing,
                    "Outgoing Call" // This could be parameterized in the future
                )

                VoiceApplicationProxy.getCallRecordDatabase.add(callRecord)
                Log.d(TAG, "Successfully initiated outgoing call with UUID: $uuid")
                
                return@Function uuid.toString()
            } catch (e: CallException) {
                Log.e(TAG, "Error making outgoing call: ${e.message}", e)
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected error making outgoing call: ${e.message}", e)
                throw e
            }
        }

        Function("voice_disconnect") { callSid: String ->
            try {
                Log.d(TAG, "Attempting to disconnect call with SID: $callSid")
                val context = appContext.reactContext
                if (context == null) {
                    Log.e(TAG, "Error: React context is null")
                    throw IllegalStateException("React context is null")
                }

                val result = Voice.disconnect(context, callSid)
                Log.d(TAG, "Call disconnect result: $result")
                return@Function result
            } catch (e: Exception) {
                Log.e(TAG, "Error disconnecting call: ${e.message}", e)
                throw e
            }
        }

        Function("voice_accept") { callSid: String ->
            try {
                Log.d(TAG, "Attempting to accept incoming call with SID: $callSid")
                val context = appContext.reactContext
                if (context == null) {
                    Log.e(TAG, "Error: React context is null")
                    throw IllegalStateException("React context is null")
                }

                val result = Voice.accept(context, callSid)
                Log.d(TAG, "Call accept result: $result")
                return@Function result
            } catch (e: Exception) {
                Log.e(TAG, "Error accepting call: ${e.message}", e)
                throw e
            }
        }

        Function("voice_reject") { callSid: String ->
            try {
                Log.d(TAG, "Attempting to reject incoming call with SID: $callSid")
                val context = appContext.reactContext
                if (context == null) {
                    Log.e(TAG, "Error: React context is null")
                    throw IllegalStateException("React context is null")
                }

                val result = Voice.reject(context, callSid)
                Log.d(TAG, "Call reject result: $result")
                return@Function result
            } catch (e: Exception) {
                Log.e(TAG, "Error rejecting call: ${e.message}", e)
                throw e
            }
        }
        
        Function("register_for_calls") { accessToken: String ->
            try {
                Log.d(TAG, "Attempting to register for calls with access token")
                val context = appContext.reactContext
                if (context == null) {
                    Log.e(TAG, "Error: React context is null")
                    throw IllegalStateException("React context is null")
                }
                
                Voice.register(accessToken, null, context)
                Log.d(TAG, "Successfully registered for calls")
                return@Function true
            } catch (e: Exception) {
                Log.e(TAG, "Error registering for calls: ${e.message}", e)
                throw e
            }
        }
        
        Function("unregister_for_calls") { accessToken: String ->
            try {
                Log.d(TAG, "Attempting to unregister from calls")
                val context = appContext.reactContext
                if (context == null) {
                    Log.e(TAG, "Error: React context is null")
                    throw IllegalStateException("React context is null")
                }
                
                Voice.unregister(accessToken, null, context)
                Log.d(TAG, "Successfully unregistered from calls")
                return@Function true
            } catch (e: Exception) {
                Log.e(TAG, "Error unregistering from calls: ${e.message}", e)
                throw e
            }
        }
    }
} 