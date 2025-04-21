package com.twiliovoicereactnative.expo

import android.content.Context
import android.os.Handler
import android.os.Looper
import androidx.core.os.bundleOf
import com.facebook.react.bridge.ReadableMap // Still needed for param parsing? Expo uses Maps/Dictionaries
import com.google.firebase.messaging.FirebaseMessaging
import com.twilio.audioswitch.AudioDevice
import com.twilio.voice.Call
import com.twilio.voice.ConnectOptions
import com.twilio.voice.LogLevel
import com.twilio.voice.RegistrationException
import com.twilio.voice.RegistrationListener
import com.twilio.voice.UnregistrationListener
import com.twilio.voice.Voice
import com.twiliovoicereactnative.* // Import necessary classes from original package
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.HashMap
import java.util.UUID

// Define event names consistent with the original module and add call events
private const val VOICE_EVENT_ERROR = "error"
private const val VOICE_EVENT_REGISTERED = "registered"
private const val VOICE_EVENT_UNREGISTERED = "unregistered"
private const val VOICE_EVENT_AUDIO_DEVICES_UPDATED = "audioDevicesUpdated"
private const val CALL_EVENT_CONNECT_FAILURE = "callConnectFailure"
private const val CALL_EVENT_CONNECTED = "callConnected"
private const val CALL_EVENT_DISCONNECTED = "callDisconnected"
private const val CALL_EVENT_RINGING = "callRinging"
// TODO: Add other Call event constants (Reconnecting, Reconnected, QualityWarningsChanged)
// TODO: Add CallInvite event constants

class ExpoModule : Module() {
  private val mainHandler = Handler(Looper.getMainLooper())
  private val logger = SDKLog(ExpoModule::class.java)

  // Accessing context and proxies - requires careful handling
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val voiceApplicationProxy: VoiceApplicationProxy?
    // How to get this reliably? Maybe through ExpoPackage or static access?
    // Need to investigate best practice for accessing shared state between module and listeners.
    get() = VoiceApplicationProxy.getInstance() // Assuming a static accessor exists/can be created

  private val audioSwitchManager: AudioSwitchManager?
    get() = voiceApplicationProxy?.audioSwitchManager

  // --- Module Definition ---
  override fun definition() = ModuleDefinition { 
    Name("TwilioVoiceReactNativeExpo")

    Events(
      VOICE_EVENT_ERROR,
      VOICE_EVENT_REGISTERED,
      VOICE_EVENT_UNREGISTERED,
      VOICE_EVENT_AUDIO_DEVICES_UPDATED,
      CALL_EVENT_CONNECT_FAILURE,
      CALL_EVENT_CONNECTED,
      CALL_EVENT_DISCONNECTED,
      CALL_EVENT_RINGING
      // TODO: Add other events
    )

    // Initialization - analogous to constructor logic in original module
    OnCreate { 
      logger.log("Creating TwilioVoiceReactNative Expo Module")
      System.setProperty(CommonConstants.GLOBAL_ENV, CommonConstants.ReactNativeVoiceSDK)
      System.setProperty(CommonConstants.SDK_VERSION, CommonConstants.ReactNativeVoiceSDKVer)
      // Use application context for initialization if possible
      val appContext = appContext.reactContext?.applicationContext ?: throw Exceptions.AppContextLost()
      VoiceApplicationProxy.getInstance(appContext) // Ensure initialized

      Voice.setLogLevel(if (BuildConfig.DEBUG) LogLevel.DEBUG else LogLevel.ERROR)

      // Setup JSEventEmitter equivalent for Expo
      // The `sendEvent` method provided by ModuleDefinition handles this.
      // We need to ensure our CallListenerProxy etc. can trigger these events.

      // Initialize AudioSwitchManager and listener
      audioSwitchManager?.setListener { audioDevices, selectedDeviceUuid, selectedDevice ->
         try {
            // Use placeholder serializer
            // val audioDeviceInfoMap = ReactNativeArgumentsSerializerExpo.serializeAudioDeviceInfoExpo(audioDevices, selectedDeviceUuid, selectedDevice)
            // sendEvent(VOICE_EVENT_AUDIO_DEVICES_UPDATED, audioDeviceInfoMap)
         } catch (e: Exception) {
             logger.error("Error sending audioDevicesUpdated event: ${e.message}")
         }
      }
    }

    // --- Voice Module Functions ---

    AsyncFunction("getVersion") { 
      return@AsyncFunction Voice.getVersion()
    }

    AsyncFunction("initialize") { options: Map<String, Any>, promise: Promise ->
      logger.log("initialize called (Expo)")
      // TODO: Implement full initialization logic, potentially combining with register?
      // For now, resolve as basic setup is done in OnCreate
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

                // TODO: Implement ExpoCallMessageListenerProxy
                // connectOptionsBuilder.callMessageListener(ExpoCallMessageListenerProxy(this))

                val uuid = UUID.randomUUID()
                // Use placeholder Expo proxy
                val callListenerProxy = ExpoCallListenerProxy(uuid, context, this@ExpoModule)
                val connectOptions = connectOptionsBuilder.build()

                val voiceServiceApi = voiceApplicationProxy?.voiceServiceApi ?: run {
                    promise.reject(CodedException("E_VOICE_INIT", "Voice service not available", null))
                    return@post
                }

                val call = voiceServiceApi.connect(connectOptions, callListenerProxy)
                val callRecipient = twimlParams["to"] ?: "Unknown"
                val notificationDisplayName = options["notificationDisplayName"] as? String ?: "Incoming Call"

                val callRecord = CallRecordDatabase.CallRecord(
                    uuid, call, callRecipient, twimlParams,
                    CallRecordDatabase.CallRecord.Direction.OUTGOING, notificationDisplayName
                )
                // Use getInstance with context for database access
                CallRecordDatabase.getInstance(context).add(callRecord)

                // Use placeholder serializer
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
            if (!task.isSuccessful) {
                val errorMsg = "Fetching FCM registration token failed: ${task.exception?.message}"
                logger.warning(errorMsg)
                promise.reject(CodedException("E_FCM_TOKEN", errorMsg, task.exception))
                return@addOnCompleteListener
            }
            val fcmToken = task.result
            if (fcmToken == null) {
                val errorMsg = "FCM token is null"
                logger.warning(errorMsg)
                promise.reject(CodedException("E_FCM_TOKEN_NULL", errorMsg, null))
            } else {
                promise.resolve(fcmToken)
            }
        }
    }

    AsyncFunction("register") { accessToken: String, promise: Promise ->
        logger.debug("register called (Expo)")
        mainHandler.post {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (!task.isSuccessful || task.result == null) {
                    val errorMsg = "Fetching FCM registration token failed for registration: ${task.exception?.message}"
                    logger.warning(errorMsg)
                    promise.reject(CodedException("E_FCM_TOKEN", errorMsg, task.exception))
                    return@addOnCompleteListener
                }
                val fcmToken = task.result!!
                val registrationListener = createRegistrationListener(promise)
                Voice.register(accessToken, Voice.RegistrationChannel.FCM, fcmToken, registrationListener)
            }
        }
    }

     AsyncFunction("unregister") { accessToken: String, promise: Promise ->
        logger.debug("unregister called (Expo)")
        mainHandler.post {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (!task.isSuccessful || task.result == null) {
                     // Log warning but proceed with unregistration attempt if possible?
                     // Original module rejects here. Let's stick to that for now.
                    val errorMsg = "Fetching FCM registration token failed for unregistration: ${task.exception?.message}"
                    logger.warning(errorMsg)
                    promise.reject(CodedException("E_FCM_TOKEN", errorMsg, task.exception))
                    return@addOnCompleteListener
                }
                val fcmToken = task.result!!
                val unregistrationListener = createUnregistrationListener(promise)
                Voice.unregister(accessToken, Voice.RegistrationChannel.FCM, fcmToken, unregistrationListener)
            }
        }
    }

    AsyncFunction("accept") { callInviteUuid: String, options: Map<String, Any>, promise: Promise ->
        logger.debug("accept called (Expo) for $callInviteUuid")
        mainHandler.post {
            try {
                val uuid = UUID.fromString(callInviteUuid)
                val callRecord = validateCallInviteRecord(uuid, promise) ?: return@post
                
                // Store promise for potential resolution in CallListenerProxy.onConnected?
                // callRecord.setCallAcceptedPromise(promise) // How to handle promise resolution across modules/listeners?
                // For now, resolve immediately after calling accept, assuming it initiates connection.
                // The actual call state updates will come via events.

                val voiceServiceApi = voiceApplicationProxy?.voiceServiceApi ?: run {
                    promise.reject(CodedException("E_VOICE_INIT", "Voice service not available for accept", null))
                    return@post
                }

                // Need to create CallListenerProxy for the upcoming call
                val callListenerProxy = ExpoCallListenerProxy(uuid, context, this@ExpoModule)
                voiceServiceApi.acceptCall(callRecord, callListenerProxy)
                
                // Assuming accept initiates the call, return the current (pending) state.
                // JS layer should rely on events for state changes (connected, disconnected).
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

    AsyncFunction("reject") { callInviteUuid: String, promise: Promise ->
        logger.debug("reject called (Expo) for $callInviteUuid")
        mainHandler.post {
             try {
                val uuid = UUID.fromString(callInviteUuid)
                val callRecord = validateCallInviteRecord(uuid, promise) ?: return@post

                // callRecord.setCallRejectedPromise(promise) // Similar promise handling issue as accept.
                
                val voiceServiceApi = voiceApplicationProxy?.voiceServiceApi ?: run {
                    promise.reject(CodedException("E_VOICE_INIT", "Voice service not available for reject", null))
                    return@post
                }

                voiceServiceApi.rejectCall(callRecord)
                // Remove the record immediately after rejecting
                CallRecordDatabase.getInstance(context).remove(callRecord)
                promise.resolve(null) // Indicate successful rejection

            } catch (e: IllegalArgumentException) {
                 promise.reject(CodedException("E_INVALID_UUID", "Invalid Call Invite UUID format", e))
            } catch (e: Exception) {
                promise.reject(UnexpectedException(e))
            }
        }
    }

    AsyncFunction("disconnect") { callUuid: String, promise: Promise ->
        logger.debug("disconnect called (Expo) for $callUuid")
        mainHandler.post {
            try {
                val uuid = UUID.fromString(callUuid)
                val callRecord = validateCallRecord(uuid, promise) ?: return@post

                 val voiceServiceApi = voiceApplicationProxy?.voiceServiceApi ?: run {
                    promise.reject(CodedException("E_VOICE_INIT", "Voice service not available for disconnect", null))
                    return@post
                }

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

    AsyncFunction("handleEvent") { messageData: Map<String, String>, promise: Promise ->
        logger.debug("handleEvent called (Expo)")
        mainHandler.post {
            // validate embedded firebase module is disabled
            // TODO: How to access the config value set by the plugin (twiliovoicereactnative_firebasemessagingservice_enabled)?
            // This might require reading resources or having the plugin set a build config field.
            val isInternalFcmEnabled = ConfigurationProperties.isFirebaseServiceEnabled(context) // Check original way
            if (isInternalFcmEnabled) {
                 val errorMsg = "handleEvent cannot be used when internal FCM listener is enabled."
                 logger.warning(errorMsg)
                 promise.reject(CodedException("E_FCM_ENABLED", errorMsg, null))
                 return@post
            }
            
            // TODO: Implement ExpoCallMessageListenerProxy
            val messageListener = CallMessageListenerProxy() // Use original proxy placeholder for now
            
            // Data should already be a Map<String, String> from Expo
            val handled = Voice.handleMessage(
                context,
                messageData, // Pass the map directly
                VoiceFirebaseMessagingService.MessageHandler(), // Use original handler logic
                messageListener
            )
            promise.resolve(handled)
        }
    }

    // TODO: Implement other methods:
    // register, unregister, getDeviceToken, getCalls, getCallInvites, 
    // accept, reject, disconnect, hold, mute, sendDigits, postFeedback, getStats,
    // audio device management, etc.

    // Cleanup
    OnDestroy { 
      logger.log("Destroying TwilioVoiceReactNative Expo Module")
      audioSwitchManager?.stop()
      // Other cleanup?
    }
  }

  // --- Listener Helpers ---

  private fun createRegistrationListener(promise: Promise): RegistrationListener {
      return object : RegistrationListener {
          override fun onRegistered(accessToken: String, fcmToken: String) {
              logger.log("Successfully registered FCM")
              sendEvent(VOICE_EVENT_REGISTERED, mapOf()) // Send empty map or specific data?
              promise.resolve(null)
          }

          override fun onError(exception: RegistrationException, accessToken: String, fcmToken: String) {
              val errorMsg = "Registration error: ${exception.errorCode} - ${exception.message}"
              logger.error(errorMsg)
              sendEvent(VOICE_EVENT_ERROR, mapOf("error" to ReactNativeArgumentsSerializerExpo.serializeVoiceExceptionExpo(exception)))
              promise.reject(CodedException(exception.errorCode.toString(), errorMsg, exception))
          }
      }
  }

  private fun createUnregistrationListener(promise: Promise): UnregistrationListener {
      return object : UnregistrationListener {
          override fun onUnregistered(accessToken: String, fcmToken: String) {
              logger.log("Successfully unregistered FCM")
              sendEvent(VOICE_EVENT_UNREGISTERED, mapOf())
              promise.resolve(null)
          }

          override fun onError(exception: RegistrationException, accessToken: String, fcmToken: String) {
              val errorMsg = "Unregistration error: ${exception.errorCode} - ${exception.message}"
              logger.error(errorMsg)
              sendEvent(VOICE_EVENT_ERROR, mapOf("error" to ReactNativeArgumentsSerializerExpo.serializeVoiceExceptionExpo(exception)))
              promise.reject(CodedException(exception.errorCode.toString(), errorMsg, exception))
          }
      }
  }

  // --- Internal Event Sending Helper ---
  // Renamed to avoid conflict with ModuleDefinition's sendEvent
  internal fun sendEvent(eventName: String, params: Map<String, Any?>) {
     try {
        // Convert Map to Bundle for Expo's sendEvent
        val bundle = bundleOf(*params.map { Pair(it.key, it.value) }.toTypedArray())
        this@ExpoModule.sendEvent(eventName, bundle)
     } catch (e: Exception) {
         logger.error("Failed to send event '$eventName': ${e.message}")
         // Optionally send an error event back to JS?
     }
  }

  // --- Validation Helpers ---
  // Placed outside definition but inside class for access to context/logger
  private fun validateCallRecord(uuid: UUID, promise: Promise): CallRecordDatabase.CallRecord? {
    val callRecord = CallRecordDatabase.getInstance(context).get(CallRecordDatabase.CallRecord(uuid))
    if (callRecord?.voiceCall == null) {
        // TODO: Get string resource properly if needed
        val errorMsg = "validateCallRecord Error: Call record or voice call not found for UUID: $uuid"
        logger.error(errorMsg)
        promise.reject(CodedException("E_CALL_NOT_FOUND", errorMsg, null))
        return null
    }
    return callRecord
  }

  private fun validateCallInviteRecord(uuid: UUID, promise: Promise): CallRecordDatabase.CallRecord? {
      val callRecord = CallRecordDatabase.getInstance(context).get(CallRecordDatabase.CallRecord(uuid))
      if (callRecord?.callInvite == null || callRecord.callInviteState != CallRecordDatabase.CallRecord.CallInviteState.ACTIVE) {
          // TODO: Get string resource properly if needed
          val errorMsg = "validateCallInviteRecord Error: Active call invite not found for UUID: $uuid"
           logger.error(errorMsg)
          promise.reject(CodedException("E_CALLINVITE_NOT_FOUND", errorMsg, null))
          return null
      }
      return callRecord
  }
} 