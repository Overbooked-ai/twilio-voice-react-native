/**
 * Interface for Twilio Voice functionality in Expo
 */
export interface VoiceExpoType {
  // Call functionality
  connect: (accessToken: string, params?: Record<string, string>, displayName?: string) => Promise<string>;
  disconnect: (callSid: string) => Promise<boolean>;
  mute: (callSid: string, isMuted: boolean) => Promise<boolean>;
  hold: (callSid: string, onHold: boolean) => Promise<boolean>;
  sendDigits: (callSid: string, digits: string) => Promise<boolean>;
  
  // Call state
  getCallState: (callSid: string) => Promise<string | null>;
  
  // Registration and push notifications
  register: (accessToken: string, fcmToken?: string) => Promise<boolean>;
  unregister: (accessToken: string, fcmToken?: string) => Promise<boolean>;
  
  // Push notification handling
  handleNotification: (payload: Record<string, any>) => Promise<boolean>;
  isTwilioNotification: (payload: Record<string, any>) => Promise<boolean>;
  
  // Audio control
  setSpeakerPhone: (enabled: boolean) => Promise<boolean>;
  
  // Device info
  getDeviceToken: () => Promise<string | null>;
  
  // Call management
  accept: (callSid: string) => Promise<boolean>;
  reject: (callSid: string) => Promise<boolean>;
  
  // Event handling
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
} 