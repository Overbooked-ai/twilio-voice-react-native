// Global TypeScript declarations for Twilio Voice React Native SDK

// Handle Type Extensions for Voice
declare module './Voice' {
  export interface Voice {
    on(event: string, listener: Function): void;
    Event: {
      CallInvite: string;
      Call: string;
      CallDisconnected: string;
      CallInviteCanceled: string;
      CallConnected: string;
    };
    connect(accessToken: string, params?: Record<string, string>): Promise<any>;
    register(accessToken: string): Promise<void>;
    unregister(accessToken: string): Promise<void>;
    handleNotification(payload: Record<string, any>): Promise<boolean>;
    isValidTwilioNotification(payload: Record<string, any>): boolean;
    setSpeakerPhone(enabled: boolean): Promise<void>;
    getDeviceToken(): Promise<string | null>;
  }
}

// Type Extensions for CallInvite
declare module './CallInvite' {
  export interface CallInvite {
    getSid(): string;
    accept(): void;
    reject(): void;
  }
}

// Custom module declarations for Expo
declare module 'expo-modules-core' {
  export function requireNativeModule(name: string): any;
} 