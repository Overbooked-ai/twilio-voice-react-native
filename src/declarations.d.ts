/**
 * TypeScript declarations for Twilio Voice React Native SDK
 * This file augments existing types to fix TypeScript compiler errors
 */

import { Event } from './common';

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