package com.twiliovoicereactnative.expo

import android.content.Context
import androidx.core.os.bundleOf
import com.twilio.voice.*
import com.twiliovoicereactnative.CallRecordDatabase
import com.twiliovoicereactnative.CommonConstants
import com.twiliovoicereactnative.ReactNativeArgumentsSerializer // Use original for structure
import com.twiliovoicereactnative.SDKLog
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.util.*

/**
 * Placeholder for serializing Voice SDK objects into formats suitable for Expo events/promises (Map/Bundle).
 * TODO: Implement proper conversion for all necessary types.
 */
object ReactNativeArgumentsSerializerExpo {

    private val logger = SDKLog(ReactNativeArgumentsSerializerExpo::class.java)

    // Example: Convert CallRecord to a Map/Record suitable for Expo
    fun serializeCallExpo(callRecord: CallRecordDatabase.CallRecord): Map<String, Any?> {
        val call = callRecord.voiceCall
        val callInvite = callRecord.callInvite

        val map = mutableMapOf<String, Any?>(
            "uuid" to callRecord.uuid.toString(),
            "state" to call?.state?.name?.lowercase() ?: "pending", // Default for invites?
            "to" to call?.to ?: callInvite?.to,
            "from" to call?.from ?: callInvite?.from,
            "sid" to call?.sid ?: callInvite?.callSid,
            "isMuted" to call?.isMuted,
            "isOnHold" to call?.isOnHold,
            // Add other relevant fields
            // "initialConnectedTimestamp" requires careful handling of Date/Long -> JS Date
        )
        // Remove nulls if necessary, depending on JS expectations
        return map.filterValues { it != null }
    }
    
    // Example: Convert RegistrationException to Map
    fun serializeVoiceExceptionExpo(exception: VoiceException): Map<String, Any?> {
         return mapOf(
            "code" to exception.errorCode,
            "message" to exception.message,
            // Add more details if needed
        )
    }

    // TODO: Add serializers for CallInvite, AudioDeviceInfo, StatsReport, etc.
}

// Placeholder Expo Call Listener Proxy
class ExpoCallListenerProxy(
    private val callUuid: UUID,
    private val context: Context,
    private val module: ExpoModule // Reference to send events
) : Call.Listener {
    private val logger = SDKLog(ExpoCallListenerProxy::class.java)

    override fun onConnectFailure(call: Call, exception: CallException) {
        logger.error("onConnectFailure: ${exception.message}")
        val callRecord = CallRecordDatabase.getInstance(context)[callUuid]
        callRecord?.setVoiceCall(null) // Clear the call object on failure
        module.sendEvent(CommonConstants.CallEventConnectFailure, mapOf(
            "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord!!),
            "error" to ReactNativeArgumentsSerializerExpo.serializeVoiceExceptionExpo(exception)
        ))
    }

    override fun onConnected(call: Call) {
        logger.log("onConnected")
        val callRecord = CallRecordDatabase.getInstance(context)[callUuid]
        // TODO: Handle call acceptance promise resolution if needed
        module.sendEvent(CommonConstants.CallEventConnected, mapOf(
            "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord!!)
        ))
    }
    
    override fun onDisconnected(call: Call, exception: CallException?) {
        logger.log("onDisconnected")
        val callRecord = CallRecordDatabase.getInstance(context)[callUuid]
        val params = mutableMapOf<String, Any?>(
             "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord!!)
        )
        if (exception != null) {
            params["error"] = ReactNativeArgumentsSerializerExpo.serializeVoiceExceptionExpo(exception)
        }
        module.sendEvent(CommonConstants.CallEventDisconnected, params.filterValues { it != null })
        CallRecordDatabase.getInstance(context).remove(callRecord!!)
    }

    override fun onRinging(call: Call) {
        logger.log("onRinging")
        val callRecord = CallRecordDatabase.getInstance(context)[callUuid]
        module.sendEvent(CommonConstants.CallEventRinging, mapOf(
            "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord!!)
        ))
    }

    // TODO: Implement other Call.Listener methods (onReconnecting, onReconnected, onQualityWarningsChanged)
    // and serialize their data appropriately using ReactNativeArgumentsSerializerExpo.
}

// TODO: Implement ExpoCallMessageListenerProxy, ExpoStatsListenerProxy etc. 