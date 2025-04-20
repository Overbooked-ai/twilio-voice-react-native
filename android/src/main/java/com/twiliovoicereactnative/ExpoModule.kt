package com.twiliovoicereactnative

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.twilio.voice.Call
import com.twilio.voice.CallListener
import com.twilio.voice.ConnectOptions
import com.twilio.voice.Voice
import java.util.UUID

class ExpoModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("TwilioVoice")

        Function("voice_connect") { accessToken: String ->
            val context = appContext.reactContext
            if (context == null) {
                return@Function
            }

            val connectOptions = ConnectOptions.Builder(accessToken).build()
            val uuid = UUID.randomUUID()
            val callListenerProxy = CallListenerProxy(uuid, context)
            
            val callRecord = CallRecordDatabase.CallRecord(
                uuid,
                Voice.connect(context, connectOptions, callListenerProxy),
                "Callee",
                HashMap(),
                CallRecord.Direction.Outgoing,
                "Display Name"
            )

            VoiceApplicationProxy.getCallRecordDatabase.add(callRecord)
        }

        Function("voice_disconnect") { callSid: String ->
            val context = appContext.reactContext
            if (context == null) {
                return@Function
            }

            Voice.disconnect(context, callSid)
        }

        Function("voice_accept") { callSid: String ->
            val context = appContext.reactContext
            if (context == null) {
                return@Function
            }

            Voice.accept(context, callSid)
        }

        Function("voice_reject") { callSid: String ->
            val context = appContext.reactContext
            if (context == null) {
                return@Function
            }

            Voice.reject(context, callSid)
        }
    }
} 