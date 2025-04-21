package com.twiliovoicereactnative

import android.content.Context
import android.media.AudioManager
import android.os.Bundle
import androidx.annotation.Keep
import com.twilio.voice.Call
import com.twilio.voice.ConnectOptions
import com.twilio.voice.Voice
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.*
import kotlin.collections.HashMap

/**
 * Expo module that exposes Twilio Voice SDK functionality to JavaScript.
 */
@Keep
class ExpoModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("TwilioVoiceModule")

        /**
         * Make an outgoing call with Twilio Voice
         * @param accessToken JWT token used to authenticate with Twilio
         * @param from Optional from parameter for the TwiML
         * @param to Required parameter indicating who to call
         * @param displayName Optional display name for the call shown in notifications
         * @return UUID of the created call
         */
        Function("voice_connect") { accessToken: String, params: Map<String, String>?, displayName: String? ->
            val context = appContext.reactContext ?: return@Function null

            // Create the connect options with the provided access token
            val connectOptionsBuilder = ConnectOptions.Builder(accessToken)
            
            // Add any additional parameters if provided
            if (params != null) {
                connectOptionsBuilder.params(params)
            }

            val connectOptions = connectOptionsBuilder.build()

            // Generate a UUID for this call
            val uuid = UUID.randomUUID()
            
            // Create a call listener to handle call events
            val callListenerProxy = CallListenerProxy(uuid, context)
            
            // Make the call using the Voice API
            val call = Voice.connect(context, connectOptions, callListenerProxy)
            
            // Create a record of the call
            val callDisplayName = displayName ?: params?.get("to") ?: "Unknown"
            val callParams = params ?: HashMap()
            
            val callRecord = CallRecordDatabase.CallRecord(
                uuid,
                call,
                callDisplayName,
                callParams,
                CallRecord.Direction.OUTGOING,
                callDisplayName
            )
            
            // Add the call to the database
            VoiceApplicationProxy.getCallRecordDatabase().add(callRecord)
            
            // Return the UUID as a string
            uuid.toString()
        }

        /**
         * Disconnect a specific call by its UUID
         * @param callUuid The UUID of the call to disconnect
         */
        Function("voice_disconnect") { callUuid: String ->
            try {
                val uuid = UUID.fromString(callUuid)
                val callRecord = VoiceApplicationProxy.getCallRecordDatabase().get(uuid)
                
                callRecord?.call?.disconnect()
                true
            } catch (e: Exception) {
                false
            }
        }

        /**
         * Mute or unmute a specific call
         * @param callUuid The UUID of the call to mute/unmute
         * @param isMuted Whether the call should be muted
         */
        Function("voice_mute") { callUuid: String, isMuted: Boolean ->
            try {
                val uuid = UUID.fromString(callUuid)
                val callRecord = VoiceApplicationProxy.getCallRecordDatabase().get(uuid)
                
                callRecord?.call?.mute(isMuted)
                true
            } catch (e: Exception) {
                false
            }
        }

        /**
         * Send DTMF tones on a specific call
         * @param callUuid The UUID of the call
         * @param digits The DTMF digits to send
         */
        Function("voice_send_digits") { callUuid: String, digits: String ->
            try {
                val uuid = UUID.fromString(callUuid)
                val callRecord = VoiceApplicationProxy.getCallRecordDatabase().get(uuid)
                
                callRecord?.call?.sendDigits(digits)
                true
            } catch (e: Exception) {
                false
            }
        }

        /**
         * Hold or unhold a specific call
         * @param callUuid The UUID of the call
         * @param onHold Whether the call should be on hold
         */
        Function("voice_hold") { callUuid: String, onHold: Boolean ->
            try {
                val uuid = UUID.fromString(callUuid)
                val callRecord = VoiceApplicationProxy.getCallRecordDatabase().get(uuid)
                
                callRecord?.call?.hold(onHold)
                true
            } catch (e: Exception) {
                false
            }
        }

        /**
         * Gets the current call state for a specific call
         * @param callUuid The UUID of the call
         * @return The call state or null if the call doesn't exist
         */
        Function("voice_get_call_state") { callUuid: String ->
            try {
                val uuid = UUID.fromString(callUuid)
                val callRecord = VoiceApplicationProxy.getCallRecordDatabase().get(uuid)
                
                callRecord?.call?.state?.name
            } catch (e: Exception) {
                null
            }
        }

        /**
         * Register for push notifications with Twilio Voice
         * @param accessToken JWT token used to authenticate with Twilio
         * @param fcmToken FCM token for push notifications
         */
        Function("voice_register") { accessToken: String, fcmToken: String? ->
            val context = appContext.reactContext ?: return@Function false
            
            try {
                // If FCM token is provided, register for push notifications
                if (fcmToken != null) {
                    Voice.register(accessToken, Voice.RegistrationChannel.FCM, fcmToken, context)
                }
                true
            } catch (e: Exception) {
                false
            }
        }

        /**
         * Unregister from push notifications with Twilio Voice
         * @param accessToken JWT token used to authenticate with Twilio
         * @param fcmToken FCM token for push notifications
         */
        Function("voice_unregister") { accessToken: String, fcmToken: String? ->
            val context = appContext.reactContext ?: return@Function false
            
            try {
                // If FCM token is provided, unregister from push notifications
                if (fcmToken != null) {
                    Voice.unregister(accessToken, Voice.RegistrationChannel.FCM, fcmToken, context)
                }
                true
            } catch (e: Exception) {
                false
            }
        }

        /**
         * Handle an incoming call push notification
         * @param payload The push notification payload
         */
        Function("voice_handle_notification") { payload: Map<String, Any> ->
            val context = appContext.reactContext ?: return@Function false
            
            try {
                // Convert the payload to a Bundle
                val bundle = Bundle()
                payload.forEach { (key, value) ->
                    when (value) {
                        is String -> bundle.putString(key, value)
                        is Int -> bundle.putInt(key, value)
                        is Boolean -> bundle.putBoolean(key, value)
                        // Add more type conversions if needed
                    }
                }

                // Process the notification using the Voice SDK
                Voice.handleMessage(context, bundle)
                true
            } catch (e: Exception) {
                false
            }
        }

        /**
         * Check if a push notification is a valid Twilio Voice notification
         * @param payload The push notification payload
         * @return Whether the notification is a valid Twilio Voice notification
         */
        Function("voice_is_twilio_notification") { payload: Map<String, Any> ->
            // Convert the payload to a Bundle
            val bundle = Bundle()
            payload.forEach { (key, value) ->
                when (value) {
                    is String -> bundle.putString(key, value)
                    is Int -> bundle.putInt(key, value)
                    is Boolean -> bundle.putBoolean(key, value)
                    // Add more type conversions if needed
                }
            }

            // Check if the notification is a valid Twilio Voice notification
            Voice.isValidMessage(bundle)
        }
        
        /**
         * Set speaker phone mode
         * @param enabled Whether to enable or disable speaker phone
         * @return Whether the operation was successful
         */
        Function("voice_set_speaker_phone") { enabled: Boolean ->
            val context = appContext.reactContext ?: return@Function false
            
            try {
                val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
                audioManager.isSpeakerphoneOn = enabled
                true
            } catch (e: Exception) {
                false
            }
        }
        
        /**
         * Get the device FCM token (if available)
         * @return The FCM token or null if not available
         */
        Function("voice_get_device_token") {
            try {
                // This should be implemented in the application using Firebase messaging
                // For this module, we can't directly get the token, so we return null
                null
            } catch (e: Exception) {
                null
            }
        }
        
        /**
         * Accept an incoming call
         * @param callSid The SID of the call to accept
         * @return Whether the call was successfully accepted
         */
        Function("voice_accept") { callSid: String ->
            try {
                // Find the call invite by SID
                val callInvites = VoiceApplicationProxy.getPushRegistry().callInvites
                val callInvite = callInvites.find { it.callSid == callSid }
                
                if (callInvite != null) {
                    val context = appContext.reactContext ?: return@Function false
                    val uuid = UUID.randomUUID()
                    val callInviteListener = CallListenerProxy(uuid, context)
                    
                    callInvite.accept(context, callInviteListener)
                    true
                } else {
                    false
                }
            } catch (e: Exception) {
                false
            }
        }
        
        /**
         * Reject an incoming call
         * @param callSid The SID of the call to reject
         * @return Whether the call was successfully rejected
         */
        Function("voice_reject") { callSid: String ->
            try {
                // Find the call invite by SID
                val callInvites = VoiceApplicationProxy.getPushRegistry().callInvites
                val callInvite = callInvites.find { it.callSid == callSid }
                
                if (callInvite != null) {
                    callInvite.reject()
                    true
                } else {
                    false
                }
            } catch (e: Exception) {
                false
            }
        }
    }
} 