/**
 * TypeScript declarations for Twilio Voice React Native SDK
 * This file augments existing types to fix TypeScript compiler errors
 */

import { Event } from './common';
import { Call } from './Call';
import { CallInvite } from './CallInvite';
import { Voice } from './Voice';
import { TwilioError } from './error/TwilioError';
import { VoiceExpoType } from './types';

// Global TypeScript declarations for Twilio Voice React Native SDK

// Handle Type Extensions for Voice
declare module './Voice' {
  interface EventType {
    CallInvite: string;
    Call: string;
    CallDisconnected: string;
    CallInviteCanceled: string;
    CallConnected: string;
    CallReconnecting: string;
    CallReconnected: string;
    CallQualityWarningsChanged: string;
    CallRinging: string;
    CallRejected: string;
    Unregistered: string;
    Registered: string;
    ConnectionError: string;
  }

  interface Voice {
    // Static properties
    Event: EventType;
    
    // Static methods
    on(event: string, listener: Function): void;
    off(event: string, handler: Function): void;
    connect(token: string, params?: Record<string, string>): Promise<Call>;
    register(token: string): Promise<void>;
    unregister(token: string): Promise<void>;
    handleNotification(payload: Record<string, any>): Promise<boolean>;
    isValidTwilioNotification(payload: Record<string, any>): boolean;
    setSpeakerPhone(enabled: boolean): Promise<void>;
    getDeviceToken(): Promise<string | null>;
  }

  // Extend the exported Voice object to include these methods
  const Voice: Voice;
  export { Voice };
}

// Type Extensions for CallInvite
declare module './CallInvite' {
  interface CallInvite {
    getSid(): string;
    getFrom(): string;
    getTo(): string;
    getState(): string;
    accept(): void;
    reject(): void;
    from: string;
    to: string;
    callSid: string;
    state: string;
  }
}

// Type Extensions for Call
declare module './Call' {
  interface Call {
    getSid(): string;
    getFrom(): string;
    getTo(): string;
    getState(): string;
    disconnect(): void;
    mute(isMuted: boolean): void;
    hold(onHold: boolean): void;
    sendDigits(digits: string): void;
  }
}

// Custom module declarations for Expo
declare module 'expo-modules-core' {
  export function requireNativeModule(name: string): any;
}

// Add module augmentation for tests
declare module 'jest' {
  interface Matchers<R> {
    toBeCalledWith(expected: any): R;
    toBeCalled(): R;
    toMatchObject(object: any): R;
    toHaveBeenCalled(): R;
    toHaveBeenCalledWith(...args: any[]): R;
  }
}

// Declare VoiceExpo interface
declare module './VoiceExpo' {
  export { VoiceExpoType };
} 
declare module 'expo-modules-core';

declare module '@twilio/voice-react-native' {
  export class Voice {
    static Event: {
      CallInvite: string;
      Call: string;
      CallDisconnected: string;
      CallInviteCanceled: string;
    };

    static connect(accessToken: string, params?: Record<string, string>): Promise<Call>;
    static disconnect(call: Call): void;
    static register(accessToken: string): Promise<void>;
    static unregister(accessToken: string): Promise<void>;
    static handleNotification(payload: Record<string, any>): Promise<boolean>;
    static isValidTwilioNotification(payload: Record<string, any>): boolean;
    static setSpeakerPhone(enabled: boolean): void;
    static getDeviceToken(): Promise<string>;
    static on(event: string, callback: (data: any) => void): void;
    static off(event: string, callback: (data: any) => void): void;
  }

  export class Call {
    getSid(): string;
    getState(): string;
    disconnect(): void;
    mute(isMuted: boolean): void;
    hold(onHold: boolean): void;
    sendDigits(digits: string): void;
  }

  export class CallInvite {
    getSid(): string;
    accept(): void;
    reject(): void;
  }
} 