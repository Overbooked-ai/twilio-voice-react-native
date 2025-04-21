declare module '@twilio/voice-react-native' {
  export class Voice {
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

    static Event: {
      CallInvite: string;
      Call: string;
      CallDisconnected: string;
      CallInviteCanceled: string;
    };
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