import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

import type { CallInvite } from '../CallInvite';
import type {
  Uuid,
  NativeCallInfo,
  NativeCallInviteInfo,
  NativeAudioDevicesInfo,
  NativeCallFeedbackScore,
  NativeCallFeedbackIssue,
  RTCStats,
} from '../type';

// Original Interface (Matches updated src/type/NativeModule.ts)
// This defines the unified interface the rest of the library expects.
export interface TwilioVoiceReactNative {
  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
  call_disconnect(callUuid: Uuid): Promise<void>;
  call_getStats(callUuid: Uuid): Promise<RTCStats.StatsReport>;
  call_hold(callUuid: Uuid, hold: boolean): Promise<boolean>;
  call_isOnHold(callUuid: Uuid): Promise<boolean>;
  call_isMuted(callUuid: Uuid): Promise<boolean>;
  call_mute(callUuid: Uuid, mute: boolean): Promise<boolean>;
  call_postFeedback(
    callUuid: Uuid,
    score: NativeCallFeedbackScore | string,
    issue: NativeCallFeedbackIssue | string
  ): Promise<void>;
  call_sendDigits(callUuid: Uuid, digits: string): Promise<void>;
  call_sendMessage(
    callUuid: Uuid,
    content: string,
    contentType: string,
    messageType: string
  ): Promise<string>;
  callInvite_accept(
    callInviteUuid: Uuid,
    acceptOptions: CallInvite.AcceptOptions
  ): Promise<NativeCallInfo>;
  callInvite_isValid(callInviteUuid: Uuid): Promise<boolean>;
  callInvite_reject(callInviteUuid: Uuid): Promise<void>;
  callInvite_updateCallerHandle(
    callInviteUuid: Uuid,
    handle: string
  ): Promise<void>;
  voice_connect_android(
    token: string,
    twimlParams: Record<string, unknown>,
    notificationDisplayName: string | undefined
  ): Promise<NativeCallInfo>;
  voice_connect_ios(
    token: string,
    twimlParams: Record<string, unknown>,
    contactHandle: string
  ): Promise<NativeCallInfo>;
  voice_initializePushRegistry(): Promise<void>;
  voice_setCallKitConfiguration(
    configuration: Record<string, unknown>
  ): Promise<void>;
  voice_setIncomingCallContactHandleTemplate(template?: string): Promise<void>;
  voice_getAudioDevices(): Promise<NativeAudioDevicesInfo>;
  voice_getCalls(): Promise<NativeCallInfo[]>;
  voice_getCallInvites(): Promise<NativeCallInviteInfo[]>;
  voice_getDeviceToken(): Promise<string>;
  voice_getVersion(): Promise<string>;
  voice_handleEvent(remoteMessage: Record<string, string>): Promise<boolean>;
  voice_register(accessToken: string, fcmToken?: string): Promise<void>;
  voice_selectAudioDevice(audioDeviceUuid: Uuid): Promise<void>;
  voice_showNativeAvRoutePicker(): Promise<void>;
  voice_unregister(accessToken: string, fcmToken?: string): Promise<void>;
}

// Interface for the Expo native module (Android & iOS)
interface TwilioVoiceExpoModule {
  // Core Voice functionality
  getVersion(): Promise<string>;
  initialize(options: Record<string, unknown>): Promise<boolean>;
  connect(accessToken: string, options: Record<string, unknown>): Promise<NativeCallInfo>;
  getDeviceToken(): Promise<string>;
  register(accessToken: string): Promise<void>;
  unregister(accessToken: string): Promise<void>;
  handleEvent(remoteMessage: Record<string, string>): Promise<boolean>;

  // Call management
  getCalls(): Promise<NativeCallInfo[]>;
  getCallInvites(): Promise<NativeCallInviteInfo[]>;
  getAudioDevices(): Promise<NativeAudioDevicesInfo>;
  selectAudioDevice(uuid: Uuid): Promise<void>;

  // Call operations
  call_disconnect(callUuid: Uuid): Promise<void>;
  call_getStats(callUuid: Uuid): Promise<RTCStats.StatsReport>;
  call_hold(callUuid: Uuid, hold: boolean): Promise<boolean>;
  call_isOnHold(callUuid: Uuid): Promise<boolean>;
  call_isMuted(callUuid: Uuid): Promise<boolean>;
  call_mute(callUuid: Uuid, mute: boolean): Promise<boolean>;
  call_postFeedback(callUuid: Uuid, score: string, issue: string): Promise<void>;
  call_sendDigits(callUuid: Uuid, digits: string): Promise<void>;
  call_sendMessage(
    callUuid: Uuid,
    content: string,
    contentType: string,
    messageType: string
  ): Promise<string>;

  // Call Invite operations
  callInvite_accept(callInviteUuid: Uuid, acceptOptions: Record<string, unknown>): Promise<NativeCallInfo>;
  callInvite_reject(callUuid: Uuid): Promise<void>;
  callInvite_isValid(callUuid: Uuid): Promise<boolean>;
  callInvite_updateCallerHandle(callUuid: Uuid, handle: string): Promise<void>;

  // iOS specific
  voice_initializePushRegistry(): Promise<void>;
  voice_setCallKitConfiguration(configuration: Record<string, unknown>): Promise<void>;
  voice_setIncomingCallContactHandleTemplate(template?: string): Promise<void>;
  voice_showNativeAvRoutePicker(): Promise<void>;

  // Event handling
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

// Create a proxy that maps React Native method names to Expo method names
const createExpoModuleProxy = (module: TwilioVoiceExpoModule) => {
  return {
    // Map React Native method names to Expo method names
    voice_getVersion: module.getVersion,
    voice_connect_android: (token: string, params: Record<string, unknown>, displayName?: string) => 
      module.connect(token, { params, notificationDisplayName: displayName }),
    voice_connect_ios: (token: string, params: Record<string, unknown>, contactHandle: string) =>
      module.connect(token, { params, contactHandle }),
    voice_getDeviceToken: module.getDeviceToken,
    voice_register: module.register,
    voice_unregister: module.unregister,
    voice_handleEvent: module.handleEvent,
    voice_getCalls: module.getCalls,
    voice_getCallInvites: module.getCallInvites,
    voice_getAudioDevices: module.getAudioDevices,
    voice_selectAudioDevice: module.selectAudioDevice,
    voice_initializePushRegistry: module.voice_initializePushRegistry,
    voice_setCallKitConfiguration: module.voice_setCallKitConfiguration,
    voice_setIncomingCallContactHandleTemplate: module.voice_setIncomingCallContactHandleTemplate,
    voice_showNativeAvRoutePicker: module.voice_showNativeAvRoutePicker,

    // Direct pass-through methods (same names)
    call_disconnect: module.call_disconnect,
    call_getStats: module.call_getStats,
    call_hold: module.call_hold,
    call_isOnHold: module.call_isOnHold,
    call_isMuted: module.call_isMuted,
    call_mute: module.call_mute,
    call_postFeedback: module.call_postFeedback,
    call_sendDigits: module.call_sendDigits,
    call_sendMessage: module.call_sendMessage,
    callInvite_accept: module.callInvite_accept,
    callInvite_reject: module.callInvite_reject,
    callInvite_isValid: module.callInvite_isValid,
    callInvite_updateCallerHandle: module.callInvite_updateCallerHandle,

    // Event handling
    addListener: module.addListener,
    removeListeners: module.removeListeners,
  };
};

// Export the native module with platform-specific handling
export default Platform.select({
  android: () => {
    const module = requireNativeModule('ExpoTwilioVoice') as TwilioVoiceExpoModule;
    return createExpoModuleProxy(module);
  },
  ios: () => {
    const module = requireNativeModule('TwilioVoiceReactNative') as TwilioVoiceExpoModule;
    return createExpoModuleProxy(module);
  },
  default: () => {
    throw new Error('Unsupported platform');
  },
})();
