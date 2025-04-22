import type { Constants } from '../constants';
import type { NativeErrorInfo } from './Error';

export interface NativeCallMessageInfo {
  content: string;
  contentType: string;
  messageType: string;
  voiceEventSid?: string | boolean;
}

export interface NativeCallMessageEventBase {
  [Constants.VoiceEventSid]: string;
}

export interface NativeCallMessageFailureEvent
  extends NativeCallMessageEventBase {
  type: Constants.CallEventMessageFailure;
  error: NativeErrorInfo;
}

export interface NativeCallMessageSentEvent extends NativeCallMessageEventBase {
  type: Constants.CallEventMessageSent;
}

export type NativeCallMessageEvent =
  | NativeCallMessageFailureEvent
  | NativeCallMessageSentEvent;

export type NativeCallMessageEventType =
  | Constants.CallEventMessageFailure
  | Constants.CallEventMessageSent;
