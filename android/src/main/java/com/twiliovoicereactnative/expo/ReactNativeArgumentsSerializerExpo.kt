package com.twiliovoicereactnative.expo

import android.content.Context
import androidx.core.os.bundleOf
import com.twilio.audioswitch.AudioDevice // Import needed for AudioDeviceInfo
import com.twilio.voice.*
import com.twiliovoicereactnative.CallRecordDatabase
import com.twiliovoicereactnative.CommonConstants
import com.twiliovoicereactnative.ReactNativeArgumentsSerializer // Use original for structure
import com.twiliovoicereactnative.SDKLog
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.util.*
import com.twilio.voice.Call.Score // Import Score enum
import com.twilio.voice.Call.Issue // Import Issue enum
import com.twilio.voice.CallMessage
import com.twilio.voice.CallException // Needed for reconnecting event
import com.twilio.voice.Call.Warnings // Needed for warnings event

/**
 * Helper for serializing Voice SDK objects into formats suitable for Expo events/promises (Map/Bundle).
 */
object ReactNativeArgumentsSerializerExpo {

    private val logger = SDKLog(ReactNativeArgumentsSerializerExpo::class.java)

    // Convert CallRecord to a Map suitable for Expo
    fun serializeCallExpo(callRecord: CallRecordDatabase.CallRecord): Map<String, Any?> {
        val call = callRecord.voiceCall
        val callInvite = callRecord.callInvite
        val initialConnectedTimestamp = callRecord.initialConnectedTimestamp?.time // Get time in milliseconds

        val map = mutableMapOf<String, Any?>(
            "uuid" to callRecord.uuid.toString(),
            // Provide state accurately based on whether it's an active call or pending invite
            "state" to call?.state?.name?.lowercase() ?: "pending", 
            "to" to call?.to ?: callInvite?.to,
            "from" to call?.from ?: callInvite?.from,
            "sid" to call?.sid ?: callInvite?.callSid,
            "isMuted" to call?.isMuted, // Reflects current state
            "isOnHold" to call?.isOnHold, // Reflects current state
            "initialConnectedTimestamp" to initialConnectedTimestamp?.toDouble() // Send as Double/Number
            // TODO: Add customParameters if needed from callInvite?
        )
        // Remove nulls before sending to JS
        return map.filterValues { it != null }
    }
    
    // Convert VoiceException to Map
    fun serializeVoiceExceptionExpo(exception: VoiceException): Map<String, Any?> {
         return mapOf(
            "code" to exception.errorCode,
            "message" to exception.message,
            // Add more details if needed (e.g., explanation for RegistrationException)
        )
    }

    // Convert AudioDevice info to Map
    fun serializeAudioDeviceInfoExpo(audioDevices: Map<String, AudioDevice>, selectedDeviceUuid: String?, selectedDevice: AudioDevice?): Map<String, Any?> {
        val serializedDevices = audioDevices.values.map { serializeAudioDevice(it) }
        val serializedSelectedDevice = selectedDevice?.let { serializeAudioDevice(it) }

        return mapOf(
            "selectedDevice" to serializedSelectedDevice, // Can be null
            "audioDevices" to serializedDevices
        )
    }

    private fun serializeAudioDevice(audioDevice: AudioDevice): Map<String, Any?> {
        // Mapping Twilio AudioDevice type to our JS type string
        val typeString = when (audioDevice) {
            is AudioDevice.Earpiece -> "earpiece"
            is AudioDevice.Speakerphone -> "speaker" // Note: Twilio SDK uses Speakerphone
            is AudioDevice.WiredHeadset -> "wired_headset" // Need to add this type to JS if not present
            is AudioDevice.BluetoothHeadset -> "bluetooth"
            else -> "unknown" // Handle potential future types
        }
        return mapOf(
            "uuid" to audioDevice.hashCode().toString(), // Use hashCode as a stable UUID? Or generate one?
            "type" to typeString,
            "name" to audioDevice.name
            // Add other relevant fields if available/needed
        )
    }

    // Convert CallInvite info to Map
    fun serializeCallInviteExpo(callRecord: CallRecordDatabase.CallRecord): Map<String, Any?> {
        val callInvite = callRecord.callInvite ?: return emptyMap() // Should not happen if called correctly
        return mapOf(
            "uuid" to callRecord.uuid.toString(),
            "callSid" to callInvite.callSid,
            "to" to callInvite.to,
            "from" to callInvite.from,
            "customParameters" to callInvite.customParameters // Assuming this is already Map<String, String>
        ).filterValues { it != null }
    }

    // Convert StatsReport to Map (More Detailed, focusing on common audio stats)
    fun serializeStatsReportExpo(statsReport: StatsReport): Map<String, Any?> {
        logger.debug("Serializing StatsReport...")
        val reportMap = mutableMapOf<String, Any?>()
        
        // --- Extract Key Metrics --- 
        // Note: Keys and availability might differ across SDK versions.
        
        // ICE Candidate Pair Stats (Transport Information)
        val candidatePairStats = statsReport.iceCandidatePairStats.firstOrNull { it.nominated == true }
        if (candidatePairStats != null) {
            reportMap["rtt"] = candidatePairStats.currentRoundTripTime // Round Trip Time (ms)
            reportMap["availableOutgoingBitrate"] = candidatePairStats.availableOutgoingBitrate
            reportMap["availableIncomingBitrate"] = candidatePairStats.availableIncomingBitrate
            // Add more transport stats if needed (bytesSent, bytesReceived, etc.)
        }

        // Local Audio Track Stats (Outbound)
        val localAudioTrackStats = statsReport.localAudioTrackStats.firstOrNull()
        if (localAudioTrackStats != null) {
            val localStatsMap = mutableMapOf<String, Any?>(
                "trackSid" to localAudioTrackStats.trackSid,
                "packetsSent" to localAudioTrackStats.packetsSent,
                "bytesSent" to localAudioTrackStats.bytesSent,
                "codec" to localAudioTrackStats.codec,
                "audioLevel" to localAudioTrackStats.audioLevel,
                "jitter" to localAudioTrackStats.jitter
                // Add more local stats if needed
            )
            reportMap["localAudioTrackStats"] = localStatsMap.filterValues { it != null }
        }

        // Remote Audio Track Stats (Inbound)
        val remoteAudioTrackStats = statsReport.remoteAudioTrackStats.firstOrNull()
        if (remoteAudioTrackStats != null) {
             val remoteStatsMap = mutableMapOf<String, Any?>(
                "trackSid" to remoteAudioTrackStats.trackSid,
                "packetsReceived" to remoteAudioTrackStats.packetsReceived,
                "packetsLost" to remoteAudioTrackStats.packetsLost,
                "bytesReceived" to remoteAudioTrackStats.bytesReceived,
                "codec" to remoteAudioTrackStats.codec,
                "audioLevel" to remoteAudioTrackStats.audioLevel,
                "jitter" to remoteAudioTrackStats.jitter,
                "mos" to remoteAudioTrackStats.mos // Mean Opinion Score (if available)
                // Add more remote stats if needed
            )
             reportMap["remoteAudioTrackStats"] = remoteStatsMap.filterValues { it != null }
        }
        
        // Add Peer Connection Stats if needed (e.g., dataChannelsOpened)
        // reportMap["peerConnectionId"] = statsReport.peerConnectionId

        logger.debug("StatsReport serialization complete.")
        return reportMap
    }

    // Convert CallMessage to Map
    fun serializeCallMessage(callMessage: CallMessage): Map<String, Any?> {
        return mapOf(
            "sid" to callMessage.sid,
            "messageType" to callMessage.type.name, // e.g., "APPLICATION_MESSAGE"
            "contentType" to callMessage.contentType,
            "content" to callMessage.content
        ).filterValues { it != null }
    }

    // Convert Quality Warnings Set to List of Strings
    fun serializeQualityWarnings(warnings: Set<Call.Warnings>): List<String> {
        return warnings.map { it.name.lowercase().replace("_", "-") } // e.g., high_jitter -> high-jitter
    }

    // --- Feedback Helpers ---
    // Based on maps in original TwilioVoiceReactNativeModule.java

    private val scoreMap = mapOf(
        "not_reported" to Score.NOT_REPORTED,
        "1" to Score.ONE,
        "2" to Score.TWO,
        "3" to Score.THREE,
        "4" to Score.FOUR,
        "5" to Score.FIVE
    )

    private val issueMap = mapOf(
        "audio_latency" to Issue.AUDIO_LATENCY,
        "choppy_audio" to Issue.CHOPPY_AUDIO,
        "dropped_call" to Issue.DROPPED_CALL,
        "echo" to Issue.ECHO,
        "noisy_call" to Issue.NOISY_CALL,
        "not_reported" to Issue.NOT_REPORTED,
        "one_way_audio" to Issue.ONE_WAY_AUDIO
    )

    fun getScoreFromString(score: String?): Score {
        return scoreMap[score?.lowercase()] ?: Score.NOT_REPORTED
    }

    fun getIssueFromString(issue: String?): Issue {
        return issueMap[issue?.lowercase()] ?: Issue.NOT_REPORTED
    }
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
        val callRecord = CallRecordDatabase.getInstance(context).get(callUuid) ?: return // Use safe call
        callRecord.setVoiceCall(null) // Clear the call object on failure
        module.sendEvent(CommonConstants.CallEventConnectFailure, mapOf(
            "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord),
            "error" to ReactNativeArgumentsSerializerExpo.serializeVoiceExceptionExpo(exception)
        ))
    }

    override fun onConnected(call: Call) {
        logger.log("onConnected")
        val callRecord = CallRecordDatabase.getInstance(context).get(callUuid) ?: return
        callRecord.initialConnectedTimestamp = Date() // Set timestamp when connected
        module.sendEvent(CommonConstants.CallEventConnected, mapOf(
            // Send updated record with timestamp
            "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord)
        ))
    }
    
    override fun onDisconnected(call: Call, exception: CallException?) {
        logger.log("onDisconnected")
        val callRecord = CallRecordDatabase.getInstance(context).get(callUuid) ?: return
        val params = mutableMapOf<String, Any?>(
             "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord)
        )
        if (exception != null) {
            params["error"] = ReactNativeArgumentsSerializerExpo.serializeVoiceExceptionExpo(exception)
        }
        module.sendEvent(CommonConstants.CallEventDisconnected, params.filterValues { it != null })
        CallRecordDatabase.getInstance(context).remove(callRecord)
    }

    override fun onRinging(call: Call) {
        logger.log("onRinging")
        val callRecord = CallRecordDatabase.getInstance(context).get(callUuid) ?: return
        module.sendEvent(CommonConstants.CallEventRinging, mapOf(
            "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord)
        ))
    }

    override fun onReconnecting(call: Call, callException: CallException) {
        logger.warning("onReconnecting: ${callException.message}")
        val callRecord = CallRecordDatabase.getInstance(context).get(callUuid) ?: return
        module.sendEvent(CommonConstants.CallEventReconnecting, mapOf(
            "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord),
            "error" to ReactNativeArgumentsSerializerExpo.serializeVoiceExceptionExpo(callException)
        ))
    }
    
    override fun onReconnected(call: Call) {
        logger.log("onReconnected")
        val callRecord = CallRecordDatabase.getInstance(context).get(callUuid) ?: return
         module.sendEvent(CommonConstants.CallEventReconnected, mapOf(
            "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord)
        ))
    }
    
    override fun onQualityWarningsChanged(call: Call, currentWarnings: Set<Call.Warnings>, previousWarnings: Set<Call.Warnings>) {
        logger.debug("onQualityWarningsChanged")
        val callRecord = CallRecordDatabase.getInstance(context).get(callUuid) ?: return
        module.sendEvent(CommonConstants.CallEventQualityWarningsChanged, mapOf(
            "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord),
            "currentWarnings" to ReactNativeArgumentsSerializerExpo.serializeQualityWarnings(currentWarnings),
            "previousWarnings" to ReactNativeArgumentsSerializerExpo.serializeQualityWarnings(previousWarnings)
        ))
    }
}

// Expo Stats Listener Proxy
class ExpoStatsListenerProxy(
    private val callUuid: UUID,
    private val module: ExpoModule, // Reference to send events or resolve promise
    private val promise: Promise // Promise to resolve with stats
) : StatsListener {
    private val logger = SDKLog(ExpoStatsListenerProxy::class.java)

    override fun onStats(statsReports: MutableList<StatsReport>) {
        // The SDK provides a list, but typically we might care about the first/primary one?
        // Or serialize the whole list?
        // Original RN module seemed to expect one report for the promise.
        if (statsReports.isNotEmpty()) {
            val reportMap = ReactNativeArgumentsSerializerExpo.serializeStatsReportExpo(statsReports[0])
            promise.resolve(reportMap)
        } else {
            logger.warning("Received empty stats report list for call $callUuid")
            promise.resolve(emptyMap<String, Any?>()) // Resolve with empty map if no reports
        }
    }
}

// Expo Call Message Listener Proxy
class ExpoCallMessageListenerProxy(
    private val callUuid: UUID, // Assuming messages are associated with a Call UUID
    private val context: Context, // May not be needed here
    private val module: ExpoModule // Reference to send events
) : CallMessageListener {
    private val logger = SDKLog(ExpoCallMessageListenerProxy::class.java)

    override fun onCallMessage(call: Call, callMessage: CallMessage) {
        logger.debug("onCallMessage received")
        val callRecord = CallRecordDatabase.getInstance(context).get(callUuid) ?: return
        module.sendEvent(CommonConstants.CallEventMessageReceived, mapOf(
            "call" to ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord),
            "message" to ReactNativeArgumentsSerializerExpo.serializeCallMessage(callMessage)
        ))
    }

    override fun onCallMessageFailure(call: Call, callException: CallException, callMessage: CallMessage) {
        // Is there a specific event for message failure? Original module didn't seem to have one.
        // We can log it or potentially emit a generic error event.
        logger.error("onCallMessageFailure: ${callException.message} for message ${callMessage.sid}")
        // Optionally emit a custom event or a generic error?
        // module.sendEvent("callMessageFailure", mapOf(...))
    }
}

// TODO: Implement ExpoCallMessageListenerProxy, ExpoStatsListenerProxy etc. 