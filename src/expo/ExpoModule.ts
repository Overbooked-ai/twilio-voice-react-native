import { NativeModules, Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

import type { CallInvite } from '../CallInvite';

// --- Inlined Types (Workaround for TS2307/build issue) ---
// Common
export type Uuid = string;

// AudioDevice
export declare namespace NativeAudioDevice {
  export enum Type {
    Earpiece = 'earpiece',
    Speaker = 'speaker',
    Bluetooth = 'bluetooth',
    WiredHeadset = 'wired_headset', // Ensured this is present
  }
}
export interface NativeAudioDeviceInfo {
  uuid: Uuid;
  type: NativeAudioDevice.Type;
  name: string;
}
export interface NativeAudioDevicesInfo {
  selectedDevice?: NativeAudioDeviceInfo;
  audioDevices: NativeAudioDeviceInfo[];
}

// Call
export declare namespace NativeCall {
  export enum State {
    Connected = 'connected',
    Connecting = 'connecting',
    Disconnected = 'disconnected',
    Ringing = 'ringing',
    Reconnecting = 'reconnecting',
  }
}
export type NativeCallInfo = {
  uuid: Uuid;
  customParameters: { [key: string]: string };
  from: string;
  isMuted: boolean;
  isOnHold: boolean;
  state: NativeCall.State;
  to: string;
  sid: string;
  initialConnectedTimestamp?: number;
  fromDisplayName?: string;
  toDisplayName?: string;
  callQualityWarnings?: NativeCallQualityWarning[];
  callFeedbackIssues?: NativeCallFeedbackIssue[];
  callFeedbackScore?: NativeCallFeedbackScore;
};
export enum NativeCallFeedbackScore {
  NotReported = 0,
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
}
export enum NativeCallFeedbackIssue {
  AudioLatency = 'audio-latency',
  ChoppyAudio = 'choppy-audio',
  DroppedCall = 'dropped-call',
  Echo = 'echo',
  NoisyCall = 'noisy-call',
  NotReported = 'not-reported',
  OneWayAudio = 'one-way-audio',
}

// CallInvite
export type NativeCallInviteInfo = {
  uuid: Uuid;
  callSid: string;
  customParameters: Record<string, string>;
  to: string;
  from: string;
};

// RTCStats
export declare namespace RTCStats {
  export type StatsReport = Record<string, any>; // Simplified
}

// Call Message
export interface NativeCallMessageInfo {
  sid: string;
  messageType: string;
  contentType: string;
  content: string;
  voiceEventSid?: string;
}

// Quality Warnings
export type NativeCallQualityWarning = string;

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
    twimlParams: Record<string, any>,
    notificationDisplayName: string | undefined
  ): Promise<NativeCallInfo>;
  voice_connect_ios(
    token: string,
    twimlParams: Record<string, any>,
    contactHandle: string
  ): Promise<NativeCallInfo>;
  voice_initializePushRegistry(): Promise<void>;
  voice_setCallKitConfiguration(
    configuration: Record<string, any>
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
// --- End Inlined Types ---

// Interface for the Expo native module (Android)
// This defines the methods EXPOSED BY ExpoModule.kt
interface TwilioVoiceExpoModule {
  getVersion(): Promise<string>;
  initialize(options: Record<string, any>): Promise<boolean>;
  connect(
    accessToken: string,
    options: Record<string, any>
  ): Promise<NativeCallInfo>;
  getDeviceToken(): Promise<string>;
  getCalls(): Promise<NativeCallInfo[]>;
  getCallInvites(): Promise<NativeCallInviteInfo[]>;
  getAudioDevices(): Promise<NativeAudioDevicesInfo>;
  selectAudioDevice(uuid: Uuid): Promise<void>;
  register(accessToken: string, fcmToken: string): Promise<void>; // Expects FCM token
  unregister(accessToken: string, fcmToken: string): Promise<void>; // Expects FCM token
  handleEvent(remoteMessage: Record<string, string>): Promise<boolean>;
  call_disconnect(callUuid: Uuid): Promise<void>;
  call_getStats(callUuid: Uuid): Promise<Record<string, any>>; // Returns placeholder Map
  call_hold(callUuid: Uuid, hold: boolean): Promise<boolean>;
  call_isOnHold(callUuid: Uuid): Promise<boolean>;
  call_isMuted(callUuid: Uuid): Promise<boolean>;
  call_mute(callUuid: Uuid, mute: boolean): Promise<boolean>;
  call_postFeedback(
    callUuid: Uuid,
    score: string,
    issue: string
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
    acceptOptions: Record<string, any>
  ): Promise<NativeCallInfo>; // Expects Map
  callInvite_reject(callUuid: Uuid): Promise<void>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

// Ensure the original Native Module is available
const RNTwilioVoice =
  NativeModules.TwilioVoiceReactNative as TwilioVoiceReactNative;

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
  }
}

// Wrapper implementation that delegates based on platform
// Implements the unified TwilioVoiceReactNative interface
const NativeModuleWrapper: TwilioVoiceReactNative = {
  addListener: (eventName: string) => {
    if (Platform.OS === 'android') {
      ExpoTwilioVoice?.addListener(eventName);
    } else {
      RNTwilioVoice.addListener(eventName);
    }
  },
  removeListeners: (count: number) => {
    if (Platform.OS === 'android') {
      ExpoTwilioVoice?.removeListeners(count);
    } else {
      RNTwilioVoice.removeListeners(count);
    }
  },

  // Call methods
  call_disconnect: (uuid: Uuid): Promise<void> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.call_disconnect(uuid),
      ios: () => RNTwilioVoice.call_disconnect(uuid),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  call_getStats: (uuid: Uuid): Promise<RTCStats.StatsReport> =>
    Platform.select({
      android: () =>
        ExpoTwilioVoice!.call_getStats(uuid) as Promise<RTCStats.StatsReport>,
      ios: () => RNTwilioVoice.call_getStats(uuid),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  call_hold: (uuid: Uuid, hold: boolean): Promise<boolean> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.call_hold(uuid, hold),
      ios: () => RNTwilioVoice.call_hold(uuid, hold),
      default: () => Promise.reject(false),
    })!(),
  call_isOnHold: (uuid: Uuid): Promise<boolean> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.call_isOnHold(uuid),
      ios: () => RNTwilioVoice.call_isOnHold(uuid),
      default: () => Promise.reject(false),
    })!(),
  call_isMuted: (uuid: Uuid): Promise<boolean> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.call_isMuted(uuid),
      ios: () => RNTwilioVoice.call_isMuted(uuid),
      default: () => Promise.reject(false),
    })!(),
  call_mute: (uuid: Uuid, mute: boolean): Promise<boolean> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.call_mute(uuid, mute),
      ios: () => RNTwilioVoice.call_mute(uuid, mute),
      default: () => Promise.reject(false),
    })!(),
  call_postFeedback: (
    uuid: Uuid,
    score: NativeCallFeedbackScore | string,
    issue: NativeCallFeedbackIssue | string
  ): Promise<void> =>
    Platform.select({
      android: () =>
        ExpoTwilioVoice!.call_postFeedback(uuid, String(score), String(issue)),
      ios: () =>
        RNTwilioVoice.call_postFeedback(
          uuid,
          score as NativeCallFeedbackScore,
          issue as NativeCallFeedbackIssue
        ),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  call_sendDigits: (uuid: Uuid, digits: string): Promise<void> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.call_sendDigits(uuid, digits),
      ios: () => RNTwilioVoice.call_sendDigits(uuid, digits),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  call_sendMessage: (
    uuid: Uuid,
    content: string,
    contentType: string,
    messageType: string
  ): Promise<string> =>
    Platform.select({
      android: () =>
        ExpoTwilioVoice!.call_sendMessage(
          uuid,
          content,
          contentType,
          messageType
        ),
      ios: () =>
        RNTwilioVoice.call_sendMessage(uuid, content, contentType, messageType),
      default: () => Promise.reject('Unsupported platform'),
    })!(),

  // Call Invite methods
  callInvite_accept: (
    uuid: Uuid,
    options: CallInvite.AcceptOptions
  ): Promise<NativeCallInfo> =>
    Platform.select({
      android: () =>
        ExpoTwilioVoice!.callInvite_accept(
          uuid,
          options as Record<string, any>
        ),
      ios: () => RNTwilioVoice.callInvite_accept(uuid, options),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  callInvite_isValid: (_uuid: Uuid): Promise<boolean> => {
    // TODO: Implement in ExpoModule.kt if needed
    return Promise.resolve(true); // Placeholder
  },
  callInvite_reject: (uuid: Uuid): Promise<void> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.callInvite_reject(uuid),
      ios: () => RNTwilioVoice.callInvite_reject(uuid),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  callInvite_updateCallerHandle: (
    _uuid: Uuid,
    _handle: string
  ): Promise<void> => {
    // TODO: Implement in ExpoModule.kt if needed
    return Promise.resolve(); // Placeholder
  },

  // Voice methods
  voice_connect_android: (
    token: string,
    params: Record<string, any>,
    displayName: string | undefined
  ): Promise<NativeCallInfo> => {
    if (Platform.OS === 'android' && ExpoTwilioVoice) {
      return ExpoTwilioVoice.connect(token, {
        params,
        notificationDisplayName: displayName,
      });
    } else {
      return Promise.reject(
        'voice_connect_android called on non-Android or module not found'
      );
    }
  },
  voice_connect_ios: (
    token: string,
    params: Record<string, any>,
    contactHandle: string
  ): Promise<NativeCallInfo> => {
    if (Platform.OS === 'ios') {
      return RNTwilioVoice.voice_connect_ios(token, params, contactHandle);
    } else {
      return Promise.reject('voice_connect_ios called on non-iOS');
    }
  },
  voice_initializePushRegistry: (): Promise<void> => {
    if (Platform.OS === 'ios') {
      return RNTwilioVoice.voice_initializePushRegistry();
    } else {
      return Promise.resolve();
    }
  },
  voice_setCallKitConfiguration: (
    configuration: Record<string, any>
  ): Promise<void> => {
    if (Platform.OS === 'ios') {
      return RNTwilioVoice.voice_setCallKitConfiguration(configuration);
    } else {
      return Promise.resolve();
    }
  },
  voice_setIncomingCallContactHandleTemplate: (
    template?: string
  ): Promise<void> => {
    if (Platform.OS === 'ios') {
      return RNTwilioVoice.voice_setIncomingCallContactHandleTemplate(template);
    } else {
      return Promise.resolve();
    }
  },
  voice_getAudioDevices: (): Promise<NativeAudioDevicesInfo> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.getAudioDevices(),
      ios: () => RNTwilioVoice.voice_getAudioDevices(),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  voice_getCalls: (): Promise<NativeCallInfo[]> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.getCalls(),
      ios: () => RNTwilioVoice.voice_getCalls(),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  voice_getCallInvites: (): Promise<NativeCallInviteInfo[]> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.getCallInvites(),
      ios: () => RNTwilioVoice.voice_getCallInvites(),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  voice_getDeviceToken: (): Promise<string> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.getDeviceToken(),
      ios: () => RNTwilioVoice.voice_getDeviceToken(),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  voice_getVersion: (): Promise<string> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.getVersion(),
      ios: () => RNTwilioVoice.voice_getVersion(),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  voice_handleEvent: (message: Record<string, string>): Promise<boolean> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.handleEvent(message),
      ios: () => RNTwilioVoice.voice_handleEvent(message),
      default: () => Promise.reject(false),
    })!(),
  voice_register: (token: string, fcmToken?: string): Promise<void> => {
    if (Platform.OS === 'android') {
      if (!fcmToken)
        return Promise.reject('FCM token required for registration on Android');
      return ExpoTwilioVoice!.register(token, fcmToken);
    } else {
      return RNTwilioVoice.voice_register(token);
    }
  },
  voice_selectAudioDevice: (uuid: Uuid): Promise<void> =>
    Platform.select({
      android: () => ExpoTwilioVoice!.selectAudioDevice(uuid),
      ios: () => RNTwilioVoice.voice_selectAudioDevice(uuid),
      default: () => Promise.reject('Unsupported platform'),
    })!(),
  voice_showNativeAvRoutePicker: (): Promise<void> => {
    if (Platform.OS === 'ios') {
      return RNTwilioVoice.voice_showNativeAvRoutePicker();
    } else {
      return Promise.resolve();
    }
  },
  voice_unregister: (token: string, fcmToken?: string): Promise<void> => {
    if (Platform.OS === 'android') {
      if (!fcmToken)
        return Promise.reject(
          'FCM token required for unregistration on Android'
        );
      return ExpoTwilioVoice!.unregister(token, fcmToken);
    } else {
      return RNTwilioVoice.voice_unregister(token);
    }
  },
};

// Export the wrapper as the native module implementation
export default NativeModuleWrapper;
