import { EventEmitter } from 'eventemitter3';
import { Call } from './Call';
import { NativeModule, Platform } from './common';
import { InvalidStateError } from './error';
import type { TwilioError } from './error';
import { UnsupportedPlatformError } from './error';
import { constructTwilioError } from './error/utility';
import type { NativeCallInviteInfo } from './type';
import type { CustomParameters, Uuid } from './type';

export class CallInvite extends EventEmitter {
  private _uuid: Uuid;
  private _state: CallInvite.State;
  private _callSid: string;
  private _customParameters: CustomParameters;
  private _from: string;
  private _to: string;

  constructor(
    { uuid, callSid, customParameters, from, to }: NativeCallInviteInfo,
    state: CallInvite.State
  ) {
    super();
    this._uuid = uuid;
    this._callSid = callSid;
    this._customParameters = { ...customParameters };
    this._from = from;
    this._to = to;
    this._state = state;
  }

  async accept(options: CallInvite.AcceptOptions = {}): Promise<Call> {
    if (this._state !== CallInvite.State.Pending) {
      throw new InvalidStateError(
        `Call in state "${this._state}", ` +
          `expected state "${CallInvite.State.Pending}".`
      );
    }

    const acceptResult = await NativeModule.callInvite_accept(
      this._uuid,
      options as Record<string, unknown>
    )
      .then((callInfo) => {
        return { type: 'ok', callInfo } as const;
      })
      .catch((error) => {
        const code = error.userInfo.code;
        const message = error.userInfo.message;
        return { type: 'err', message, code } as const;
      });

    if (acceptResult.type === 'err') {
      throw constructTwilioError(acceptResult.message, acceptResult.code);
    }

    return new Call(acceptResult.callInfo);
  }

  async reject(): Promise<void> {
    if (this._state !== CallInvite.State.Pending) {
      throw new InvalidStateError(
        `Call in state "${this._state}", ` +
          `expected state "${CallInvite.State.Pending}".`
      );
    }

    await NativeModule.callInvite_reject(this._uuid);
  }

  async isValid(): Promise<boolean> {
    return NativeModule.callInvite_isValid(this._uuid);
  }

  getCallSid(): string {
    return this._callSid;
  }

  getCustomParameters(): CustomParameters {
    return this._customParameters;
  }

  getFrom(): string {
    return this._from;
  }

  getState(): CallInvite.State {
    return this._state;
  }

  getTo(): string {
    return this._to;
  }

  async updateCallerHandle(newHandle: string): Promise<void> {
    switch (Platform.OS) {
      case 'ios':
        return NativeModule.callInvite_updateCallerHandle(this._uuid, newHandle);
      default:
        throw new UnsupportedPlatformError(
          `Unsupported platform "${Platform.OS}". This method is only supported on iOS.`
        );
    }
  }
}

export namespace CallInvite {
  export interface AcceptOptions extends Record<string, unknown> {}

  export enum State {
    Pending = 'pending',
    Accepted = 'accepted',
    Rejected = 'rejected',
    Cancelled = 'cancelled',
  }

  export enum Event {
    Accepted = 'accepted',
    Rejected = 'rejected',
    Cancelled = 'cancelled',
    NotificationTapped = 'notificationTapped',
    MessageReceived = 'messageReceived',
  }

  export namespace Listener {
    export type Accepted = (call: Call) => void;
    export type Rejected = () => void;
    export type Cancelled = (error?: TwilioError) => void;
    export type NotificationTapped = () => void;
    export type MessageReceived = (incomingCallMessage: any) => void;
    export type Generic = (...args: unknown[]) => void;
  }
} 