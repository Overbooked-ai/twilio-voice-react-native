import { NativeModules, Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

import type { CallInvite } from '../CallInvite';
import type {
  NativeAudioDevicesInfo,
  NativeCallInfo,
  NativeCallFeedbackIssue,
  NativeCallFeedbackScore,
  NativeCallInviteInfo,
  Uuid,
  RTCStats,
  TwilioVoiceReactNative, // Import the original interface
} from '../type/index'; // Explicitly point to index

// ... (interface TwilioVoiceExpoModule remains the same) ...

// Ensure the original Native Module is available
const RNTwilioVoice = NativeModules.TwilioVoiceReactNative as TwilioVoiceReactNative;

// Load the Expo module for Android
let ExpoTwilioVoice: TwilioVoiceExpoModule | null = null;
if (Platform.OS === 'android') {
  try {
    ExpoTwilioVoice = requireNativeModule('TwilioVoiceReactNativeExpo');
  } catch (error) {
    console.error(
      'Expo module TwilioVoiceReactNativeExpo not found. Ensure you have installed the library correctly and run expo prebuild.',
      error
    );
    // Fallback or error handling could be added here
  }
}

// Wrapper implementation that delegates based on platform
const NativeModuleWrapper: TwilioVoiceReactNative = {
  addListener: (eventName: string) => { // Add type
    // Both modules should support this for events
    if (Platform.OS === 'android' && ExpoTwilioVoice) {
      ExpoTwilioVoice.addListener(eventName);
    } else {
      RNTwilioVoice.addListener(eventName);
    }
  },
  removeListeners: (count: number) => { // Add type
    if (Platform.OS === 'android' && ExpoTwilioVoice) {
      ExpoTwilioVoice.removeListeners(count);
    } else {
      RNTwilioVoice.removeListeners(count);
    }
  },

  // Call methods - delegate
  call_disconnect: (uuid: Uuid) => // Add type
    Platform.select({
      android: () => ExpoTwilioVoice!.call_disconnect(uuid),
      ios: () => RNTwilioVoice.call_disconnect(uuid),
      default: () => Promise.reject('Unsupported platform')
    })(),
  call_getStats: (uuid: Uuid) => // Add type
    Platform.select({
      android: () => ExpoTwilioVoice!.call_getStats(uuid),
      ios: () => RNTwilioVoice.call_getStats(uuid),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  call_hold: (uuid: Uuid, hold: boolean) => // Add types
    Platform.select({
      android: () => ExpoTwilioVoice!.call_hold(uuid, hold),
      ios: () => RNTwilioVoice.call_hold(uuid, hold),
      default: () => Promise.reject(false),
    })(),
  call_isOnHold: (uuid: Uuid) => // Add type
    Platform.select({
      android: () => ExpoTwilioVoice!.call_isOnHold(uuid),
      ios: () => RNTwilioVoice.call_isOnHold(uuid),
      default: () => Promise.reject(false),
    })(),
  call_isMuted: (uuid: Uuid) => // Add type
    Platform.select({
      android: () => ExpoTwilioVoice!.call_isMuted(uuid),
      ios: () => RNTwilioVoice.call_isMuted(uuid),
      default: () => Promise.reject(false),
    })(),
  call_mute: (uuid: Uuid, mute: boolean) => // Add types
    Platform.select({
      android: () => ExpoTwilioVoice!.call_mute(uuid, mute),
      ios: () => RNTwilioVoice.call_mute(uuid, mute),
      default: () => Promise.reject(false),
    })(),
  call_postFeedback: (uuid: Uuid, score: NativeCallFeedbackScore, issue: NativeCallFeedbackIssue) => // Add types
    Platform.select({
      android: () => ExpoTwilioVoice!.call_postFeedback(uuid, score, issue),
      ios: () => RNTwilioVoice.call_postFeedback(uuid, score, issue),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  call_sendDigits: (uuid: Uuid, digits: string) => // Add types
    Platform.select({
      android: () => ExpoTwilioVoice!.call_sendDigits(uuid, digits),
      ios: () => RNTwilioVoice.call_sendDigits(uuid, digits),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  call_sendMessage: (uuid: Uuid, content: string, contentType: string, messageType: string) => // Add types
    Platform.select({
      android: () => ExpoTwilioVoice!.call_sendMessage(uuid, content, contentType, messageType),
      ios: () => RNTwilioVoice.call_sendMessage(uuid, content, contentType, messageType),
      default: () => Promise.reject('Unsupported platform'),
    })(),

  // Call Invite methods - delegate
  callInvite_accept: (uuid: Uuid, options: CallInvite.AcceptOptions) => // Add types
    Platform.select({
      android: () => ExpoTwilioVoice!.callInvite_accept(uuid, options),
      ios: () => RNTwilioVoice.callInvite_accept(uuid, options),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  callInvite_isValid: (uuid: Uuid) => Promise.resolve(true), // Add type (Placeholder)
  callInvite_reject: (uuid: Uuid) => // Add type
    Platform.select({
      android: () => ExpoTwilioVoice!.callInvite_reject(uuid),
      ios: () => RNTwilioVoice.callInvite_reject(uuid),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  callInvite_updateCallerHandle: (uuid: Uuid, handle: string) => Promise.resolve(), // Add types (Placeholder)

  // Voice methods - delegate, handle platform differences
  voice_connect_android: (token: string, params: Record<string, any>, displayName: string | undefined) => { // Add types
    if (Platform.OS === 'android') {
      return ExpoTwilioVoice!.connect(token, { params, notificationDisplayName: displayName });
    } else {
      return Promise.reject('voice_connect_android called on iOS');
    }
  },
  voice_connect_ios: (token: string, params: Record<string, any>, contactHandle: string) => { // Add types
    if (Platform.OS === 'ios') {
      return RNTwilioVoice.voice_connect_ios(token, params, contactHandle);
    } else {
      return Promise.reject('voice_connect_ios called on Android');
    }
  },
  voice_initializePushRegistry: () => {
    if (Platform.OS === 'ios') {
      return RNTwilioVoice.voice_initializePushRegistry();
    } else {
      return Promise.resolve(); // No-op on Android
    }
  },
  voice_setCallKitConfiguration: (configuration: Record<string, any>) => { // Add type
     if (Platform.OS === 'ios') {
      return RNTwilioVoice.voice_setCallKitConfiguration(configuration);
    } else {
      return Promise.resolve(); // No-op on Android
    }
  },
  voice_setIncomingCallContactHandleTemplate: (template?: string) => { // Add type
     if (Platform.OS === 'ios') {
      return RNTwilioVoice.voice_setIncomingCallContactHandleTemplate(template);
    } else {
      return Promise.resolve(); // No-op on Android (handled differently?)
    }
  },
  voice_getAudioDevices: () =>
    Platform.select({
      android: () => ExpoTwilioVoice!.getAudioDevices(),
      ios: () => RNTwilioVoice.voice_getAudioDevices(),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  voice_getCalls: () =>
    Platform.select({
      android: () => ExpoTwilioVoice!.getCalls(),
      ios: () => RNTwilioVoice.voice_getCalls(),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  voice_getCallInvites: () =>
    Platform.select({
      android: () => ExpoTwilioVoice!.getCallInvites(),
      ios: () => RNTwilioVoice.voice_getCallInvites(),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  voice_getDeviceToken: () =>
    Platform.select({
      android: () => ExpoTwilioVoice!.getDeviceToken(),
      ios: () => RNTwilioVoice.voice_getDeviceToken(),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  voice_getVersion: () =>
    Platform.select({
      android: () => ExpoTwilioVoice!.getVersion(),
      ios: () => RNTwilioVoice.voice_getVersion(),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  voice_handleEvent: (message: Record<string, string>) => // Add type
    Platform.select({
      android: () => ExpoTwilioVoice!.handleEvent(message),
      ios: () => RNTwilioVoice.voice_handleEvent(message),
      default: () => Promise.reject(false),
    })(),
  voice_register: (token: string) => // Add type
    Platform.select({
      android: () => ExpoTwilioVoice!.register(token),
      ios: () => RNTwilioVoice.voice_register(token),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  voice_selectAudioDevice: (uuid: Uuid) => // Add type
    Platform.select({
      android: () => ExpoTwilioVoice!.selectAudioDevice(uuid),
      ios: () => RNTwilioVoice.voice_selectAudioDevice(uuid),
      default: () => Promise.reject('Unsupported platform'),
    })(),
  voice_showNativeAvRoutePicker: () => {
    if (Platform.OS === 'ios') {
      return RNTwilioVoice.voice_showNativeAvRoutePicker();
    } else {
      return Promise.resolve(); // No-op on Android
    }
  },
  voice_unregister: (token: string) => // Add type
    Platform.select({
      android: () => ExpoTwilioVoice!.unregister(token),
      ios: () => RNTwilioVoice.voice_unregister(token),
      default: () => Promise.reject('Unsupported platform'),
    })(),
};

// Export the wrapper as the native module implementation
export default NativeModuleWrapper;
