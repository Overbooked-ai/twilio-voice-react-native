/**
 * Common types used across the Twilio Voice React Native SDK
 * @public
 */

import { Constants } from '../constants';
import { Call } from '../Call';

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

export declare enum NativeAudioDeviceType {
  Earpiece = 'earpiece',
  Speaker = 'speaker',
  Bluetooth = 'bluetooth',
  WiredHeadset = 'wired_headset',
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
