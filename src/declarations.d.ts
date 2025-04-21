/**
 * TypeScript declarations for Twilio Voice React Native SDK
 * This file augments existing types to fix TypeScript compiler errors
 */

import { Event } from './common';
import { Call } from './Call';
import { CallInvite } from './CallInvite';
import { Voice } from './Voice';

// Global TypeScript declarations for Twilio Voice React Native SDK

// Handle Type Extensions for Voice
declare module './Voice' {
  interface Voice {
    on(event: string, listener: (data: any) => void): void;
    connect(token: string, params?: Record<string, string>): Promise<any>;
    register(token: string): Promise<any>;
    unregister(token: string): Promise<any>;
    handleNotification(payload: any): Promise<boolean>;
    isValidTwilioNotification(payload: any): boolean;
    setSpeakerPhone(enabled: boolean): Promise<any>;
    getDeviceToken(): Promise<string | null>;
  }

  export interface VoiceStatic {
    new(): Voice;
    on(event: string, listener: (data: any) => void): void;
    connect(token: string, params?: Record<string, string>): Promise<any>;
    register(token: string): Promise<any>;
    unregister(token: string): Promise<any>;
    handleNotification(payload: any): Promise<boolean>;
    isValidTwilioNotification(payload: any): boolean;
    setSpeakerPhone(enabled: boolean): Promise<any>;
    getDeviceToken(): Promise<string | null>;
    Event: typeof Event & {
      Call: string;
      CallInvite: string;
      CallDisconnected: string;
      CallInviteCanceled: string;
    };
  }
}

// Type Extensions for CallInvite
declare module './CallInvite' {
  export interface CallInvite {
    getSid(): string;
    getFrom(): string;
    getTo(): string;
    accept(): void;
    reject(): void;
  }
}

// Custom module declarations for Expo
declare module 'expo-modules-core' {
  export function requireNativeModule(name: string): any;
}

declare module './Call' {
  export interface Call {
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

// Add module augmentation for tests
declare module 'jest' {
  interface Matchers<R> {
    toBeCalledWith(...args: any[]): R;
  }
}

declare module '@twilio/voice-react-native-sdk' {
  // Extend Voice with missing methods
  interface Voice {
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
    
    // Voice static properties
    Event: {
      CallInvite: string;
      Call: string;
      CallDisconnected: string;
      CallInviteCanceled: string;
      CallConnected: string;
      CallRejected: string;
      Unregistered: string;
      Registered: string;
      ConnectionError: string;
    };
    
    // Voice methods
    connect(accessToken: string, params?: Record<string, string>): Promise<Call>;
    register(accessToken: string): Promise<void>;
    unregister(accessToken: string): Promise<void>;
    handleNotification(payload: Record<string, any>): Promise<boolean>;
    isValidTwilioNotification(payload: Record<string, any>): boolean;
    setSpeakerPhone?(enabled: boolean): Promise<void>;
    getDeviceToken?(): Promise<string | null>;
  }
  
  // Extend CallInvite with missing methods
  interface CallInvite {
    getSid(): string;
    accept(): void;
    reject(): void;
    from: string;
    to: string;
    callSid: string;
    state: string;
  }
  
  // Extend Call with missing methods
  interface Call {
    getSid(): string;
    getState(): string;
    disconnect(): void;
    mute(isMuted: boolean): void;
    hold(onHold: boolean): void;
    sendDigits(digits: string): void;
  }
  
  // Add VoiceExpo interface
  interface VoiceExpoType {
    connect(accessToken: string, params?: Record<string, string>, displayName?: string): Promise<string>;
    disconnect(callSid: string): Promise<boolean>;
    mute(callSid: string, isMuted: boolean): Promise<boolean>;
    hold(callSid: string, onHold: boolean): Promise<boolean>;
    sendDigits(callSid: string, digits: string): Promise<boolean>;
    getCallState(callSid: string): Promise<string | null>;
    register(accessToken: string, fcmToken?: string): Promise<boolean>;
    unregister(accessToken: string, fcmToken?: string): Promise<boolean>;
    handleNotification(payload: Record<string, any>): Promise<boolean>;
    isTwilioNotification(payload: Record<string, any>): Promise<boolean>;
    setSpeakerPhone(enabled: boolean): Promise<boolean>;
    getDeviceToken(): Promise<string | null>;
    accept(callSid: string): Promise<boolean>;
    reject(callSid: string): Promise<boolean>;
  }
}

// Declare Expo modules
declare module 'expo-modules-core' {
  export function requireNativeModule(name: string): any;
}

// Augment Jest test environment for testing
interface JestMatchers<R> {
  toMatchObject(object: any): R;
  toHaveBeenCalled(): R;
  toHaveBeenCalledWith(...args: any[]): R;
} 