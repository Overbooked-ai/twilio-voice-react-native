package com.twiliovoicereactnative.expo

// Expo Module Imports
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.exception.UnexpectedException
import expo.modules.kotlin.AppContext // Import AppContext

// Standard Android/Java Imports
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.os.bundleOf
import java.util.HashMap
import java.util.UUID

// Firebase Imports
import com.google.firebase.messaging.FirebaseMessaging

// Twilio Voice SDK Imports
import com.twilio.voice.Call
import com.twilio.voice.ConnectOptions
import com.twilio.voice.LogLevel
import com.twilio.voice.RegistrationException
import com.twilio.voice.RegistrationListener
import com.twilio.voice.UnregistrationListener
import com.twilio.voice.Voice
import com.twilio.voice.CallMessageListener
import com.twilio.voice.StatsListener
import com.twilio.voice.StatsReport

// Twilio AudioSwitch Imports
import com.twilio.audioswitch.AudioDevice

// Local Project Imports (assuming they are in the same module or accessible)
import com.twiliovoicereactnative.* // Import necessary classes from original package

// Define event names consistent with the original module and add call events
private const val VOICE_EVENT_ERROR = "error"
private const val VOICE_EVENT_REGISTERED = "registered"
private const val VOICE_EVENT_UNREGISTERED = "unregistered"
private const val VOICE_EVENT_AUDIO_DEVICES_UPDATED = "audioDevicesUpdated"
private const val CALL_EVENT_CONNECT_FAILURE = "callConnectFailure"
private const val CALL_EVENT_CONNECTED = "callConnected"
private const val CALL_EVENT_DISCONNECTED = "callDisconnected"
private const val CALL_EVENT_RINGING = "callRinging"
private const val CALL_EVENT_RECONNECTING = "callReconnecting"
private const val CALL_EVENT_RECONNECTED = "callReconnected"
private const val CALL_EVENT_QUALITY_WARNINGS_CHANGED = "callQualityWarningsChanged"
private const val CALL_EVENT_MESSAGE_RECEIVED = "callMessageReceived"
// Call Invite Events
private const val CALL_INVITE_EVENT_ACCEPTED = "callInviteAccepted" // Example, check JS side
private const val CALL_INVITE_EVENT_REJECTED = "callInviteRejected" // Example, check JS side
private const val CALL_INVITE_EVENT_CANCELLED = "callInviteCancelled" // Example, check JS side
private const val CALL_INVITE_EVENT_NOTIFICATION_TAPPED = "callInviteNotificationTapped" // Example, check JS side

// Define missing call state constants if needed for event payloads
private const val CALL_STATE_CONNECTING = "connecting"
private const val CALL_STATE_RINGING = "ringing"
private const val CALL_STATE_CONNECTED = "connected"
private const val CALL_STATE_RECONNECTING = "reconnecting"
private const val CALL_STATE_RECONNECTED = "reconnected"
private const val CALL_STATE_DISCONNECTED = "disconnected"

class ExpoModule : Module() {
  private val mainHandler = Handler(Looper.getMainLooper())
  private val logger = SDKLog(ExpoModule::class.java)

  // Accessing context - Use appContext provided by Expo Module
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()
  private val applicationContext: Context
    get() = appContext.reactContext?.applicationContext ?: throw Exceptions.AppContextLost()

  // Access VoiceApplicationProxy via static instance (ensure initialized in OnCreate)
  private val voiceApplicationProxy: VoiceApplicationProxy
    get() = VoiceApplicationProxy.getInstance(applicationContext)

  private val audioSwitchManager: AudioSwitchManager
    get() = voiceApplicationProxy.audioSwitchManager

  private val voiceServiceApi: VoiceServiceApi
    get() = voiceApplicationProxy.voiceServiceApi

  private val callRecordDatabase: CallRecordDatabase
    get() = CallRecordDatabase.getInstance(applicationContext)

  // --- Module Definition ---
  override fun definition() = ModuleDefinition {
    Name("ExpoTwilioVoice")

    // Define all events that can be emitted to JavaScript
    Events(
      VOICE_EVENT_ERROR,
      VOICE_EVENT_REGISTERED,
      VOICE_EVENT_UNREGISTERED,
      VOICE_EVENT_AUDIO_DEVICES_UPDATED,
      CALL_EVENT_CONNECT_FAILURE,
      CALL_EVENT_CONNECTED,
      CALL_EVENT_DISCONNECTED,
      CALL_EVENT_RINGING,
      CALL_EVENT_RECONNECTING,
      CALL_EVENT_RECONNECTED,
      CALL_EVENT_QUALITY_WARNINGS_CHANGED,
      CALL_EVENT_MESSAGE_RECEIVED,
      CALL_INVITE_EVENT_ACCEPTED,
      CALL_INVITE_EVENT_REJECTED,
      CALL_INVITE_EVENT_CANCELLED,
      CALL_INVITE_EVENT_NOTIFICATION_TAPPED
    )

    // Module Lifecycle: OnCreate
    OnCreate {
      val reactContext = appContext.reactContext
      if (reactContext == null) {
        Log.e(TAG, "React context is null")
        return@OnCreate
      }

      // Initialize VoiceApplicationProxy - this will also call onCreate()
      VoiceApplicationProxy.getInstance(reactContext)

      // Set log level for Voice SDK
      Voice.setLogLevel(LogLevel.DEBUG)

      // Now it's safe to access components
      VoiceApplicationProxy.getAudioSwitchManager()?.let { audioSwitchManager ->
        audioSwitchManager.setListener(object : AudioSwitchManager.Listener {
          override fun onAudioDeviceChanged(selectedAudioDevice: AudioDevice?) {
            val event = Arguments.createMap().apply {
              putString("name", selectedAudioDevice?.name ?: "unknown")
              putString("type", selectedAudioDevice?.type?.name ?: "unknown")
              putBoolean("selected", selectedAudioDevice != null)
            }
            sendEvent("audioDeviceChanged", event)
          }

          override fun onError(error: String) {
            Log.e(TAG, "Audio switch error: $error")
            val event = Arguments.createMap().apply {
              putString("error", error)
            }
            sendEvent("audioDeviceError", event)
          }
        })
      } ?: run {
        Log.e(TAG, "AudioSwitchManager not initialized")
      }
    }

    OnDestroy {
      VoiceApplicationProxy.getInstance().onTerminate()
    }

    // --- Voice Module Functions ---

    AsyncFunction("getVersion") { 
      return@AsyncFunction Voice.getVersion()
    }

    // `initialize` seems redundant if registration handles necessary setup.
    // Keeping it simple for now, resolving immediately.
    AsyncFunction("initialize") { options: Map<String, Any>, promise: Promise ->
      logger.log("initialize called (Expo) - No-op, setup in OnCreate/register")
      promise.resolve(true)
    }

    AsyncFunction("connect") { accessToken: String, options: Map<String, Any>, promise: Promise ->
        logger.debug("connect called (Expo)")
        mainHandler.post {
            try {
                val connectOptionsBuilder = ConnectOptions.Builder(accessToken)
                val twimlParams = HashMap<String, String>()
                val paramsFromOptions = options["params"] as? Map<*, *>
                paramsFromOptions?.forEach { (key, value) ->
                    if (key is String && value != null) {
                        twimlParams[key.toString()] = value.toString()
                    }
                }
                connectOptionsBuilder.params(twimlParams)
                connectOptionsBuilder.enableDscp(true)

                val uuid = UUID.randomUUID()
                // Pass `this@ExpoModule` so the proxy can call sendEvent
                val callListenerProxy = ExpoCallListenerProxy(uuid, applicationContext, this@ExpoModule)
                val messageListenerProxy = ExpoCallMessageListenerProxy(uuid, applicationContext, this@ExpoModule)
                connectOptionsBuilder.callMessageListener(messageListenerProxy)
                
                val connectOptions = connectOptionsBuilder.build()

                // Get voiceServiceApi via property getter
                val call = voiceServiceApi.connect(connectOptions, callListenerProxy)
                val callRecipient = twimlParams["to"] ?: "Unknown"
                val notificationDisplayName = options["notificationDisplayName"] as? String ?: "Incoming Call"

                val callRecord = CallRecordDatabase.CallRecord(
                    uuid, call, callRecipient, twimlParams,
                    CallRecordDatabase.CallRecord.Direction.OUTGOING, notificationDisplayName
                )
                // Use property getter for database
                callRecordDatabase.add(callRecord)

                // Use the new serializer
                promise.resolve(ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord))

            } catch (e: SecurityException) {
                promise.reject(CodedException("E_SECURITY_PERMISSION", "Missing RECORD_AUDIO permission?", e))
            } catch (e: Exception) {
                promise.reject(CodedException("E_CONNECT_FAILED", e.message ?: "Connection failed", e))
            }
        }
    }

    AsyncFunction("getDeviceToken") { promise: Promise ->
        logger.debug("getDeviceToken called (Expo)")
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (!task.isSuccessful || task.result == null) {
                val errorMsg = "Fetching FCM registration token failed: ${task.exception?.message}"
                logger.warning(errorMsg)
                promise.reject(CodedException("E_FCM_TOKEN", errorMsg, task.exception))
            } else {
                promise.resolve(task.result)
            }
        }
    }

    // Combined register function (assuming fcmToken is always required on Android)
    AsyncFunction("register") { accessToken: String, promise: Promise ->
        logger.debug("register called (Expo)")
        mainHandler.post {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (!task.isSuccessful || task.result == null) {
                    val errorMsg = "Fetching FCM registration token failed: ${task.exception?.message}"
                    logger.warning(errorMsg)
                    promise.reject(CodedException("E_FCM_TOKEN", errorMsg, task.exception))
                    return@addOnCompleteListener
                }

                val fcmToken = task.result
                val registrationListener = createRegistrationListener(promise)
                Voice.register(accessToken, Voice.RegistrationChannel.FCM, fcmToken, registrationListener)
            }
        }
    }

    // Combined unregister function
    AsyncFunction("unregister") { accessToken: String, promise: Promise ->
        logger.debug("unregister called (Expo)")
        mainHandler.post {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (!task.isSuccessful || task.result == null) {
                    val errorMsg = "Fetching FCM registration token failed: ${task.exception?.message}"
                    logger.warning(errorMsg)
                    promise.reject(CodedException("E_FCM_TOKEN", errorMsg, task.exception))
                    return@addOnCompleteListener
                }

                val fcmToken = task.result
                val unregistrationListener = createUnregistrationListener(promise)
                Voice.unregister(accessToken, Voice.RegistrationChannel.FCM, fcmToken, unregistrationListener)
            }
        }
    }

    // --- Call Invite Methods ---
    // Renamed from "accept" to align with JS wrapper "callInvite_accept"
    AsyncFunction("callInvite_accept") { callInviteUuid: String, options: Map<String, Any>, promise: Promise ->
        logger.debug("callInvite_accept called (Expo) for $callInviteUuid")
        mainHandler.post {
             try {
                val uuid = UUID.fromString(callInviteUuid)
                val callRecord = validateCallInviteRecord(uuid, promise) ?: return@post
                
                val callListenerProxy = ExpoCallListenerProxy(uuid, applicationContext, this@ExpoModule)
                val messageListenerProxy = ExpoCallMessageListenerProxy(uuid, applicationContext, this@ExpoModule)
                voiceServiceApi.acceptCall(callRecord, callListenerProxy, messageListenerProxy)
                
                // Send accepted event (optional, if JS needs it)
                // sendEvent(CALL_INVITE_EVENT_ACCEPTED, bundleOf("uuid" to callInviteUuid))

                promise.resolve(ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord))

            } catch (e: IllegalArgumentException) {
                 promise.reject(CodedException("E_INVALID_UUID", "Invalid Call Invite UUID format", e))
            } catch (e: SecurityException) {
                promise.reject(CodedException("E_SECURITY_PERMISSION", "Missing permission for accept?", e))
            } catch (e: Exception) {
                promise.reject(UnexpectedException(e))
            }
        }
    }

    // Renamed from "reject" to align with JS wrapper "callInvite_reject"
    AsyncFunction("callInvite_reject") { callInviteUuid: String, promise: Promise ->
        logger.debug("callInvite_reject called (Expo) for $callInviteUuid")
        mainHandler.post {
             try {
                val uuid = UUID.fromString(callInviteUuid)
                val callRecord = validateCallInviteRecord(uuid, promise) ?: return@post

                voiceServiceApi.rejectCall(callRecord)
                callRecordDatabase.remove(callRecord)

                // Send rejected event (optional)
                // sendEvent(CALL_INVITE_EVENT_REJECTED, bundleOf("uuid" to callInviteUuid))
                promise.resolve(null) // Indicate successful rejection

            } catch (e: IllegalArgumentException) {
                 promise.reject(CodedException("E_INVALID_UUID", "Invalid Call Invite UUID format", e))
            } catch (e: Exception) {
                promise.reject(UnexpectedException(e))
            }
        }
    }

    // Renamed from "disconnect" to align with JS wrapper "call_disconnect"
    AsyncFunction("call_disconnect") { callUuid: String, promise: Promise ->
        logger.debug("call_disconnect called (Expo) for $callUuid")
        mainHandler.post {
            try {
                val uuid = UUID.fromString(callUuid)
                val callRecord = validateCallRecord(uuid, promise) ?: return@post

                voiceServiceApi.disconnect(callRecord)
                // Call record is removed in CallListenerProxy.onDisconnected
                promise.resolve(null) // Indicate disconnect initiated

            } catch (e: IllegalArgumentException) {
                 promise.reject(CodedException("E_INVALID_UUID", "Invalid Call UUID format", e))
            } catch (e: Exception) {
                promise.reject(UnexpectedException(e))
            }
        }
    }

    // Renamed from "handleEvent" to align with JS wrapper "voice_handleEvent"
    AsyncFunction("handleEvent") { messageData: Map<String, String>, promise: Promise ->
        logger.debug("handleEvent called (Expo)")
        mainHandler.post {
            val isInternalFcmEnabled = ConfigurationProperties.isFirebaseServiceEnabled(applicationContext)
            if (isInternalFcmEnabled) {
                 val errorMsg = "handleEvent cannot be used when internal FCM listener is enabled."
                 logger.warning(errorMsg)
                 promise.reject(CodedException("E_FCM_ENABLED", errorMsg, null))
                 return@post
            }
            
            // Placeholder for message listener - need to ensure it can send events via ExpoModule
            val messageListener = ExpoCallMessageListenerProxy(null, applicationContext, this@ExpoModule) 
            
            val handled = Voice.handleMessage(
                applicationContext,
                messageData,
                VoiceFirebaseMessagingService.MessageHandler(),
                messageListener
            )
            promise.resolve(handled)
        }
    }

    // --- Call Methods (Matching JS Wrapper names) ---

    AsyncFunction("call_hold") { callUuid: String, hold: Boolean, promise: Promise ->
      logger.debug("call_hold called (Expo) for $callUuid to $hold")
      mainHandler.post {
        try {
            val callRecord = validateCallRecord(UUID.fromString(callUuid), promise) ?: return@post
            callRecord.voiceCall?.hold(hold)
            promise.resolve(callRecord.voiceCall?.isOnHold ?: false)
        } catch (e: IllegalArgumentException) {
            promise.reject(CodedException("E_INVALID_UUID", "Invalid Call UUID format", e))
        } catch (e: Exception) {
            promise.reject(UnexpectedException(e))
        }
      }
    }

    AsyncFunction("call_isOnHold") { callUuid: String, promise: Promise ->
       logger.debug("call_isOnHold called (Expo) for $callUuid")
       mainHandler.post {
           try {
               val callRecord = validateCallRecord(UUID.fromString(callUuid), promise) ?: return@post
               promise.resolve(callRecord.voiceCall?.isOnHold ?: false)
           } catch (e: IllegalArgumentException) {
               promise.reject(CodedException("E_INVALID_UUID", "Invalid Call UUID format", e))
           } catch (e: Exception) {
               promise.reject(UnexpectedException(e))
           }
       }
    }

    AsyncFunction("call_mute") { callUuid: String, mute: Boolean, promise: Promise ->
      logger.debug("call_mute called (Expo) for $callUuid to $mute")
      mainHandler.post {
        try {
            val callRecord = validateCallRecord(UUID.fromString(callUuid), promise) ?: return@post
            callRecord.voiceCall?.mute(mute)
            promise.resolve(callRecord.voiceCall?.isMuted ?: false)
        } catch (e: IllegalArgumentException) {
            promise.reject(CodedException("E_INVALID_UUID", "Invalid Call UUID format", e))
        } catch (e: Exception) {
            promise.reject(UnexpectedException(e))
        }
      }
    }

    AsyncFunction("call_isMuted") { callUuid: String, promise: Promise ->
       logger.debug("call_isMuted called (Expo) for $callUuid")
       mainHandler.post {
            try {
                val callRecord = validateCallRecord(UUID.fromString(callUuid), promise) ?: return@post
                promise.resolve(callRecord.voiceCall?.isMuted ?: false)
            } catch (e: IllegalArgumentException) {
                promise.reject(CodedException("E_INVALID_UUID", "Invalid Call UUID format", e))
            } catch (e: Exception) {
                promise.reject(UnexpectedException(e))
            }
       }
    }

    AsyncFunction("call_sendDigits") { callUuid: String, digits: String, promise: Promise ->
        logger.debug("call_sendDigits called (Expo) for $callUuid")
        mainHandler.post {
            try {
                val callRecord = validateCallRecord(UUID.fromString(callUuid), promise) ?: return@post
                callRecord.voiceCall?.sendDigits(digits)
                promise.resolve(null)
            } catch (e: IllegalArgumentException) {
                promise.reject(CodedException("E_INVALID_UUID", "Invalid Call UUID format", e))
            } catch (e: Exception) {
                promise.reject(UnexpectedException(e))
            }
        }
    }

    AsyncFunction("call_postFeedback") { callUuid: String, score: String, issue: String, promise: Promise ->
        logger.debug("call_postFeedback called (Expo) for $callUuid")
        mainHandler.post {
            try {
                val callRecord = validateCallRecord(UUID.fromString(callUuid), promise) ?: return@post
                // Assuming serializer handles conversion, pass strings directly if possible
                val parsedScore = ReactNativeArgumentsSerializerExpo.getScoreFromString(score)
                val parsedIssue = ReactNativeArgumentsSerializerExpo.getIssueFromString(issue)
                callRecord.voiceCall?.postFeedback(parsedScore, parsedIssue)
                promise.resolve(null)
            } catch (e: IllegalArgumentException) {
                 promise.reject(CodedException("E_INVALID_UUID", "Invalid Call UUID format", e))
            } catch (e: NumberFormatException) {
                 promise.reject(CodedException("E_INVALID_SCORE", "Invalid score format", e))
            } catch (e: Exception) {
                 promise.reject(UnexpectedException(e))
            }
        }
    }

    AsyncFunction("call_getStats") { callUuid: String, promise: Promise ->
        logger.debug("call_getStats called (Expo) for $callUuid")
        mainHandler.post {
            try {
                val callRecord = validateCallRecord(UUID.fromString(callUuid), promise) ?: return@post
                // Use the new ExpoStatsListenerProxy to resolve the promise
                callRecord.voiceCall?.getStats(ExpoStatsListenerProxy(UUID.fromString(callUuid), this@ExpoModule, promise))
                // Promise is resolved by the listener
            } catch (e: IllegalArgumentException) {
                 promise.reject(CodedException("E_INVALID_UUID", "Invalid Call UUID format", e))
            } catch (e: Exception) {
                 promise.reject(UnexpectedException(e))
            }
        }
    }

    AsyncFunction("call_sendMessage") { callUuid: String, content: String, contentType: String, messageType: String, promise: Promise ->
        logger.debug("call_sendMessage called (Expo) for $callUuid")
        mainHandler.post {
            try {
                 val callRecord = validateCallRecord(UUID.fromString(callUuid), promise) ?: return@post
                 val messageSid = callRecord.voiceCall?.sendMessage(content, contentType, messageType)
                 promise.resolve(messageSid)
            } catch (e: IllegalArgumentException) {
                promise.reject(CodedException("E_INVALID_UUID", "Invalid Call UUID format", e))
            } catch (e: Exception) {
                 promise.reject(UnexpectedException(e))
            }
        }
    }

    // --- Audio Methods (Matching JS Wrapper names) ---
    AsyncFunction("getAudioDevices") { promise: Promise -> // Renamed from voice_getAudioDevices
        logger.debug("getAudioDevices called (Expo)")
        try {
            val audioSwitch = audioSwitchManager.audioSwitch
            val availableDevices = audioSwitch.availableAudioDevices
            val selectedDevice = audioSwitch.selectedAudioDevice
            
            val serializedInfo = ReactNativeArgumentsSerializerExpo.serializeAudioDeviceInfoExpo(
                availableDevices, // Pass the list directly
                selectedDevice?.let { it.hashCode().toString() }, // Use hashcode as ID for now
                selectedDevice
            )
            promise.resolve(serializedInfo)
        } catch (e: Exception) {
             promise.reject(CodedException("E_AUDIO_SWITCH", "Error getting audio devices: ${e.message}", e))
        }
    }

    AsyncFunction("selectAudioDevice") { uuid: String, promise: Promise -> // Renamed from voice_selectAudioDevice
        logger.debug("selectAudioDevice called (Expo) for $uuid")
        try {
            val audioSwitch = audioSwitchManager.audioSwitch
            // Find device by hashcode-based UUID
            val deviceToSelect = audioSwitch.availableAudioDevices.find { 
                it.hashCode().toString() == uuid 
            }

            if (deviceToSelect != null) {
                audioSwitch.selectDevice(deviceToSelect)
                promise.resolve(null)
            } else {
                promise.reject(CodedException("E_AUDIO_DEVICE_NOT_FOUND", "Audio device with UUID $uuid not found", null))
            }
        } catch (e: Exception) {
             promise.reject(CodedException("E_AUDIO_SWITCH", "Error selecting audio device: ${e.message}", e))
        }
    }

    // --- Getters for Active Calls/Invites (Matching JS Wrapper names) ---
    AsyncFunction("getCalls") { promise: Promise -> // Renamed from voice_getCalls
      logger.debug("getCalls called (Expo)")
      mainHandler.post {
          try {
              val activeCalls = callRecordDatabase.collection
                  .filter { it.voiceCall != null && it.voiceCall!!.state != Call.State.DISCONNECTED }
                  .map { ReactNativeArgumentsSerializerExpo.serializeCallExpo(it) }
              promise.resolve(activeCalls)
          } catch (e: Exception) {
              promise.reject(UnexpectedException(e))
          }
      }
    }

    AsyncFunction("getCallInvites") { promise: Promise -> // Renamed from voice_getCallInvites
      logger.debug("getCallInvites called (Expo)")
       mainHandler.post {
           try {
               val activeInvites = callRecordDatabase.collection
                   .filter { it.callInvite != null && it.callInviteState == CallRecordDatabase.CallRecord.CallInviteState.ACTIVE }
                   .map { ReactNativeArgumentsSerializerExpo.serializeCallInviteExpo(it) }
               promise.resolve(activeInvites)
           } catch (e: Exception) {
                promise.reject(UnexpectedException(e))
           }
       }
    }

    // Add listener management functions expected by JS
    // These are often no-ops in the new module system if events are defined
    Function("addListener") { eventName: String ->
        // Optional: Log or track listeners if needed
        logger.debug("addListener called for event: $eventName (Expo - No-op)")
    }

    Function("removeListeners") { count: Int ->
        // Optional: Log or track listeners if needed
        logger.debug("removeListeners called with count: $count (Expo - No-op)")
    }

  } // End of definition block

  // --- Helper Functions ---

  // Registration Listener Implementation
  private fun createRegistrationListener(promise: Promise): RegistrationListener {
    return RegistrationListener { error, fcmToken ->
      mainHandler.post {
        if (error != null) {
          logger.error("Registration failed: code=${error.errorCode}, message=${error.message}")
          val errorInfo = bundleOf(
            "message" to error.message,
            "code" to error.errorCode // Use Twilio's error code
          )
          // Send error event and reject promise
          sendEvent(VOICE_EVENT_ERROR, bundleOf("error" to errorInfo))
          promise.reject(CodedException(error.errorCode.toString(), error.message ?: "Registration Error", error))
        } else {
          logger.log("Successfully registered FCM token")
          // Send registered event and resolve promise
          sendEvent(VOICE_EVENT_REGISTERED, bundleOf("accessToken" to "", "fcmToken" to fcmToken)) // Access token not available here
          promise.resolve(null)
        }
      }
    }
  }

  // Unregistration Listener Implementation
  private fun createUnregistrationListener(promise: Promise): UnregistrationListener {
    return UnregistrationListener { error, fcmToken ->
      mainHandler.post {
        if (error != null) {
          logger.error("Unregistration failed: code=${error.errorCode}, message=${error.message}")
           val errorInfo = bundleOf(
            "message" to error.message,
            "code" to error.errorCode
          )
          sendEvent(VOICE_EVENT_ERROR, bundleOf("error" to errorInfo))
          promise.reject(CodedException(error.errorCode.toString(), error.message ?: "Unregistration Error", error))
        } else {
          logger.log("Successfully unregistered FCM token")
          sendEvent(VOICE_EVENT_UNREGISTERED, bundleOf("accessToken" to "", "fcmToken" to fcmToken))
          promise.resolve(null)
        }
      }
    }
  }

  // Validation Helper for Call Records
  private fun validateCallRecord(uuid: UUID, promise: Promise): CallRecordDatabase.CallRecord? {
    val callRecord = callRecordDatabase.get(uuid)
    if (callRecord == null || callRecord.voiceCall == null) {
      val errorMsg = "Call record not found or call not active for UUID: $uuid"
      logger.warning(errorMsg)
      promise.reject(CodedException("E_CALL_NOT_FOUND", errorMsg, null))
      return null
    }
    return callRecord
  }

  // Validation Helper for Call Invite Records
  private fun validateCallInviteRecord(uuid: UUID, promise: Promise): CallRecordDatabase.CallRecord? {
    val callRecord = callRecordDatabase.get(uuid)
    if (callRecord == null || callRecord.callInvite == null || callRecord.callInviteState != CallRecordDatabase.CallRecord.CallInviteState.ACTIVE) {
      val errorMsg = "Call Invite record not found or not active for UUID: $uuid"
      logger.warning(errorMsg)
      promise.reject(CodedException("E_CALL_INVITE_NOT_FOUND", errorMsg, null))
      return null
    }
    return callRecord
  }

} // End of ExpoModule class

// --- Listener Proxies (Adapted for Expo) ---

// Call Listener Proxy - Needs reference to ExpoModule to send events
internal class ExpoCallListenerProxy(
    private val uuid: UUID,
    private val context: Context,
    private val module: ExpoModule // Reference to the module to send events
) : RNCallListenerProxy(uuid, context, null) { // Pass null for JSEventEmitter

    override fun sendEvent(eventName: String, params: Any?) {
        if (params is Map<*, *>) {
            // Convert Map to Bundle for Expo's sendEvent
            val bundle = bundleOf(*params.map { (k, v) -> k.toString() to v }.toTypedArray())
            module.sendEvent(eventName, bundle)
        } else if (params is Bundle) {
            module.sendEvent(eventName, params)
        } else {
            // Handle other types or log error if necessary
             module.sendEvent(eventName, bundleOf("data" to params.toString()))
        }
    }

     // Override methods to use the Expo sendEvent
    override fun onConnectFailure(call: Call, exception: RegistrationException) {
      logger.error("Call Connect Failure: code=${exception.errorCode} message=${exception.message}")
      val errorInfo = bundleOf(
        "message" to exception.message,
        "code" to exception.errorCode
      )
      sendEvent(CALL_EVENT_CONNECT_FAILURE, bundleOf(
          "callSid" to call.sid,
          "callUuid" to uuid.toString(),
          "error" to errorInfo
      ))
      CallRecordDatabase.getInstance(context).remove(uuid)
    }

    override fun onConnected(call: Call) {
      logger.log("Call Connected: callSid=${call.sid}")
      val callRecord = CallRecordDatabase.getInstance(context).get(uuid)
      if (callRecord != null) {
          callRecord.state = CALL_STATE_CONNECTED
          val map = ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord)
          sendEvent(CALL_EVENT_CONNECTED, map)
      } else {
          logger.warning("Call record not found onConnected for UUID: $uuid")
      }
    }

    override fun onDisconnected(call: Call, error: RegistrationException?) {
      val callRecord = CallRecordDatabase.getInstance(context).get(uuid)
      val map = bundleOf(
          "callSid" to call.sid,
          "callUuid" to uuid.toString(),
      )
      if (error != null) {
          logger.error("Call Disconnected with error: code=${error.errorCode} message=${error.message}")
          map.putBundle("error", bundleOf("message" to error.message, "code" to error.errorCode))
      } else {
          logger.log("Call Disconnected: callSid=${call.sid}")
      }
      sendEvent(CALL_EVENT_DISCONNECTED, map)
      CallRecordDatabase.getInstance(context).remove(uuid)
    }

    override fun onRinging(call: Call) {
      logger.log("Call Ringing: callSid=${call.sid}")
       val callRecord = CallRecordDatabase.getInstance(context).get(uuid)
      if (callRecord != null) {
           callRecord.state = CALL_STATE_RINGING
           val map = ReactNativeArgumentsSerializerExpo.serializeCallExpo(callRecord)
           sendEvent(CALL_EVENT_RINGING, map)
      } else {
           logger.warning("Call record not found onRinging for UUID: $uuid")
      }
    }
    
    override fun onReconnecting(call: Call, error: RegistrationException) {
        logger.warning("Call Reconnecting: callSid=${call.sid}, error code=${error.errorCode}, message=${error.message}")
        val map = bundleOf(
            "callSid" to call.sid,
            "callUuid" to uuid.toString(),
            "error" to bundleOf("message" to error.message, "code" to error.errorCode)
        )
        sendEvent(CALL_EVENT_RECONNECTING, map)
    }

    override fun onReconnected(call: Call) {
        logger.log("Call Reconnected: callSid=${call.sid}")
        val map = bundleOf(
            "callSid" to call.sid,
            "callUuid" to uuid.toString()
        )
        sendEvent(CALL_EVENT_RECONNECTED, map)
    }

    override fun onQualityWarningsChanged(call: Call, currentWarnings: Set<Call.CallQualityWarning>, previousWarnings: Set<Call.CallQualityWarning>) {
        logger.debug("Call Quality Warnings Changed: callSid=${call.sid}")
        val current = currentWarnings.map { it.name }.toList()
        val previous = previousWarnings.map { it.name }.toList()
        val map = bundleOf(
            "callSid" to call.sid,
            "callUuid" to uuid.toString(),
            "currentWarnings" to ArrayList(current),
            "previousWarnings" to ArrayList(previous)
        )
        sendEvent(CALL_EVENT_QUALITY_WARNINGS_CHANGED, map)
    }
}

// Call Message Listener Proxy - Needs reference to ExpoModule
internal class ExpoCallMessageListenerProxy(
    private val uuid: UUID?, // Can be null for handleEvent
    private val context: Context,
    private val module: ExpoModule
) : CallMessageListener {
    private val logger = SDKLog(ExpoCallMessageListenerProxy::class.java)

    override fun onMessageReceived(callSid: String, message: String, contentType: String, messageType: String) {
        logger.log("Message received for call $callSid")
        val map = bundleOf(
            "callSid" to callSid,
            "callUuid" to uuid?.toString(), // Include UUID if available
            "message" to message,
            "contentType" to contentType,
            "messageType" to messageType
        )
        module.sendEvent(CALL_EVENT_MESSAGE_RECEIVED, map)
    }
}

// Stats Listener Proxy - Needs reference to ExpoModule and Promise
internal class ExpoStatsListenerProxy(
    private val uuid: UUID,
    private val module: ExpoModule,
    private val promise: Promise // Promise to resolve/reject
) : StatsListener {
    private val logger = SDKLog(ExpoStatsListenerProxy::class.java)

    override fun onStats(statsReports: List<StatsReport>) {
        logger.debug("Stats received for call $uuid")
        try {
            val serializedStats = ReactNativeArgumentsSerializerExpo.serializeStatsReportExpo(statsReports)
            promise.resolve(serializedStats)
        } catch (e: Exception) {
             logger.error("Error serializing stats: ${e.message}")
             promise.reject(CodedException("E_STATS_SERIALIZATION", "Failed to serialize stats report", e))
        }
    }
} 