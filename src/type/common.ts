/**
 * Common types used across the Twilio Voice React Native SDK
 * @public
 */

import type { Constants } from '../../lib/constants';
import type { Call } from '../../lib';

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
export type CustomParameters = Record<string, string>;

export type Uuid = string;

export enum NativeCallFeedbackIssue {
  AudioLatency = 'audio-latency',
  ChoppyAudio = 'choppy-audio',
  DroppedCall = 'dropped-call',
  Echo = 'echo',
  NoisyCall = 'noisy-call',
  NotReported = 'not-reported',
  OneWayAudio = 'one-way-audio',
}

export enum NativeCallFeedbackScore {
  NotReported = 0,
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
}

export interface NativeCallInfo {
  uuid: Uuid;
  customParameters?: CustomParameters;
  from?: string;
  [Constants.CallInfoInitialConnectedTimestamp]?: string;
  isMuted?: boolean;
  isOnHold?: boolean;
  sid?: string;
  state?: Call.State;
  to?: string;
}
