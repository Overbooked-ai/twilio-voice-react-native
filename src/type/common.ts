/**
 * Call custom parameters. If custom parameters are present for a call, then
 * it will have this typing.
 *
 * @remarks
 *  - `Call`s will have a method to access custom parameters, see
 *    {@link (Call:class).getCustomParameters}.
 *  - `CallInvite`s will have a method to access custom parameters for the call
 *    that is associated with the invite, see
 *    {@link (CallInvite:class).getCustomParameters}.
 *
 * @public
 */
export type CustomParameters = { [key: string]: string };

export type Uuid = string;

// Call Feedback types
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

// Call State types
export enum NativeCallState {
  Connected = 'connected',
  Connecting = 'connecting',
  Disconnected = 'disconnected',
  Ringing = 'ringing',
  Reconnecting = 'reconnecting',
}

// Audio Device types
export enum NativeAudioDeviceType {
  Earpiece = 'earpiece',
  Speaker = 'speaker',
  Bluetooth = 'bluetooth',
  WiredHeadset = 'wired_headset',
}

export interface NativeAudioDeviceInfo {
  uuid: Uuid;
  type: NativeAudioDeviceType;
  name: string;
}

export interface NativeAudioDevicesInfo {
  selectedDevice?: NativeAudioDeviceInfo;
  audioDevices: NativeAudioDeviceInfo[];
}

// Call Info types
export interface NativeCallInfo {
  uuid: Uuid;
  customParameters: CustomParameters;
  from: string;
  isMuted: boolean;
  isOnHold: boolean;
  state: NativeCallState;
  to: string;
  sid: string;
  initialConnectedTimestamp?: number;
  fromDisplayName?: string;
  toDisplayName?: string;
  callQualityWarnings?: string[];
  callFeedbackIssues?: NativeCallFeedbackIssue[];
  callFeedbackScore?: NativeCallFeedbackScore;
  voiceEventSid?: string;
}

// Call Invite types
export interface NativeCallInviteInfo {
  uuid: Uuid;
  callSid: string;
  customParameters: CustomParameters;
  to: string;
  from: string;
}

// RTC Stats types
export declare namespace RTCStats {
  export type StatsReport = Record<string, any>;
}

// Call Message types
export interface NativeCallMessageInfo {
  sid: string;
  messageType: string;
  contentType: string;
  content: string;
  voiceEventSid?: string;
}

// Quality Warnings type
export type NativeCallQualityWarning = string;
