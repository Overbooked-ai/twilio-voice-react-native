import { Call, CallInvite } from '.';

// Extend the Voice interface to include missing methods
declare module './Voice' {
  interface Voice {
    Event: {
      Call: string;
      CallInvite: string;
      CallDisconnected: string;
      CallInviteCanceled: string;
      CallConnected: string;
    };
    on(event: string, listener: (data: any) => void): void;
    connect(accessToken: string, params?: Record<string, string>): Promise<Call>;
    register(accessToken: string): Promise<void>;
    unregister(accessToken: string): Promise<void>;
    handleNotification(payload: Record<string, any>): Promise<boolean>;
    isValidTwilioNotification(payload: Record<string, any>): boolean;
    setSpeakerPhone?(enabled: boolean): Promise<void>;
    getDeviceToken?(): Promise<string | null>;
  }
}

// Extend CallInvite interface to include missing methods
declare module './CallInvite' {
  interface CallInvite {
    getSid(): string;
    accept(): void;
    reject(): void;
    callSid?: string;
  }
}

// Add proper typings for Call.getSid() to handle undefined
declare module './Call' {
  interface Call {
    getSid(): string;
    getState(): string;
  }
} 