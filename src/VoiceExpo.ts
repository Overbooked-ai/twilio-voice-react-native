import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';
import { Voice } from './Voice';
import type { Call } from './Call';
import type { CallInvite } from './CallInvite';

// Import type declarations
import './declarations.d.ts';

/**
 * Comprehensive interface for Twilio Voice functionality in Expo
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
}

/**
 * Implementation of the Twilio Voice Expo functionality
 */
class VoiceExpoImpl implements VoiceExpoType {
  private rnVoice: typeof Voice;
  private expoNativeModule: any | null = null;
  private calls: Map<string, Call> = new Map();
  private callInvites: Map<string, CallInvite> = new Map();

  constructor() {
    this.rnVoice = Voice;
    
    // Try to load the Expo native module
    if (Platform.OS === 'android') {
      try {
        this.expoNativeModule = requireNativeModule('TwilioVoiceModule');
      } catch (e) {
        console.warn('Failed to load Expo native module for Twilio Voice. Using React Native implementation instead.');
        this.expoNativeModule = null;
      }
    }
    
    // Set up listeners for calls and call invites to track them
    this.setupListeners();
  }

  /**
   * Set up listeners to track active calls and call invites
   */
  private setupListeners(): void {
    if (this.rnVoice && typeof this.rnVoice.on === 'function') {
      // Handle call invites
      this.rnVoice.on(Voice.Event.CallInvite, (callInvite: CallInvite) => {
        if (callInvite && typeof callInvite.getSid === 'function') {
          const sid = callInvite.getSid();
          if (sid) {
            this.callInvites.set(sid, callInvite);
          }
        }
      });
      
      // Handle new calls
      this.rnVoice.on(Voice.Event.Call, (call: Call) => {
        if (call && typeof call.getSid === 'function') {
          const sid = call.getSid();
          if (sid) {
            this.calls.set(sid, call);
          }
        }
      });
      
      // Handle disconnected calls
      this.rnVoice.on(Voice.Event.CallDisconnected, (call: Call) => {
        if (call && typeof call.getSid === 'function') {
          const sid = call.getSid();
          if (sid) {
            this.calls.delete(sid);
          }
        }
      });
      
      // Handle canceled call invites
      this.rnVoice.on(Voice.Event.CallInviteCanceled, (callInvite: CallInvite) => {
        if (callInvite && typeof callInvite.getSid === 'function') {
          const sid = callInvite.getSid();
          if (sid) {
            this.callInvites.delete(sid);
          }
        }
      });
    }
  }

  /**
   * Get a call by its SID
   */
  private getCallBySid(callSid: string): Call | null {
    return this.calls.get(callSid) || null;
  }

  /**
   * Get a call invite by its SID
   */
  private getCallInviteBySid(callSid: string): CallInvite | null {
    return this.callInvites.get(callSid) || null;
  }

  /**
   * Make an outgoing call
   * @param accessToken JWT token used to authenticate with Twilio
   * @param params Parameters for the call
   * @param displayName Display name for the call shown in notifications
   * @returns UUID/SID of the created call
   */
  async connect(
    accessToken: string,
    params?: Record<string, string>,
    displayName?: string
  ): Promise<string> {
    try {
      if (Platform.OS === 'android' && this.expoNativeModule) {
        const callSid = await this.expoNativeModule.voice_connect(accessToken, params || {}, displayName);
        return callSid || '';
      } else if (typeof this.rnVoice.connect === 'function') {
        const call = await this.rnVoice.connect(accessToken, params || {});
        if (call && typeof call.getSid === 'function') {
          return call.getSid() || '';
        }
      }
      return '';
    } catch (error) {
      console.error('VoiceExpo.connect error:', error);
      throw error;
    }
  }

  /**
   * Disconnect an active call
   * @param callSid SID of the call to disconnect
   * @returns Whether the disconnect was successful
   */
  async disconnect(callSid: string): Promise<boolean> {
    try {
      if (!callSid) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_disconnect(callSid);
      } else {
        const call = this.getCallBySid(callSid);
        if (call) {
          call.disconnect();
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('VoiceExpo.disconnect error:', error);
      return false;
    }
  }

  /**
   * Mute or unmute an active call
   * @param callSid SID of the call to mute/unmute
   * @param isMuted Whether to mute or unmute
   * @returns Whether the mute operation was successful
   */
  async mute(callSid: string, isMuted: boolean): Promise<boolean> {
    try {
      if (!callSid) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_mute(callSid, isMuted);
      } else {
        const call = this.getCallBySid(callSid);
        if (call) {
          call.mute(isMuted);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('VoiceExpo.mute error:', error);
      return false;
    }
  }

  /**
   * Place a call on hold or resume it
   * @param callSid SID of the call to hold/resume
   * @param onHold Whether to place on hold or resume
   * @returns Whether the hold operation was successful
   */
  async hold(callSid: string, onHold: boolean): Promise<boolean> {
    try {
      if (!callSid) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_hold(callSid, onHold);
      } else {
        const call = this.getCallBySid(callSid);
        if (call) {
          call.hold(onHold);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('VoiceExpo.hold error:', error);
      return false;
    }
  }

  /**
   * Send DTMF digits during a call
   * @param callSid SID of the call
   * @param digits The digits to send
   * @returns Whether the digits were successfully sent
   */
  async sendDigits(callSid: string, digits: string): Promise<boolean> {
    try {
      if (!callSid || !digits) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_send_digits(callSid, digits);
      } else {
        const call = this.getCallBySid(callSid);
        if (call) {
          call.sendDigits(digits);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('VoiceExpo.sendDigits error:', error);
      return false;
    }
  }

  /**
   * Get the current state of a call
   * @param callSid SID of the call
   * @returns The call state or null if the call doesn't exist
   */
  async getCallState(callSid: string): Promise<string | null> {
    try {
      if (!callSid) return null;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_get_call_state(callSid);
      } else {
        const call = this.getCallBySid(callSid);
        if (call && typeof call.getState === 'function') {
          const state = call.getState();
          return typeof state === 'string' ? state : String(state);
        }
        return null;
      }
    } catch (error) {
      console.error('VoiceExpo.getCallState error:', error);
      return null;
    }
  }

  /**
   * Register for push notifications
   * @param accessToken JWT token used for registration
   * @param fcmToken FCM token for Android push notifications
   * @returns Whether the registration was successful
   */
  async register(accessToken: string, fcmToken?: string): Promise<boolean> {
    try {
      if (!accessToken) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_register(accessToken, fcmToken);
      } else if (typeof this.rnVoice.register === 'function') {
        await this.rnVoice.register(accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('VoiceExpo.register error:', error);
      return false;
    }
  }

  /**
   * Unregister from push notifications
   * @param accessToken JWT token used for unregistration
   * @param fcmToken FCM token for Android push notifications
   * @returns Whether the unregistration was successful
   */
  async unregister(accessToken: string, fcmToken?: string): Promise<boolean> {
    try {
      if (!accessToken) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_unregister(accessToken, fcmToken);
      } else if (typeof this.rnVoice.unregister === 'function') {
        await this.rnVoice.unregister(accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('VoiceExpo.unregister error:', error);
      return false;
    }
  }

  /**
   * Handle an incoming push notification
   * @param payload The push notification payload
   * @returns Whether the notification was handled successfully
   */
  async handleNotification(payload: Record<string, any>): Promise<boolean> {
    try {
      if (!payload) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_handle_notification(payload);
      } else if (Platform.OS === 'ios' && typeof this.rnVoice.handleNotification === 'function') {
        return await this.rnVoice.handleNotification(payload);
      }
      return false;
    } catch (error) {
      console.error('VoiceExpo.handleNotification error:', error);
      return false;
    }
  }

  /**
   * Check if a push notification is from Twilio Voice
   * @param payload The push notification payload
   * @returns Whether the notification is from Twilio Voice
   */
  async isTwilioNotification(payload: Record<string, any>): Promise<boolean> {
    try {
      if (!payload) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_is_twilio_notification(payload);
      } else if (Platform.OS === 'ios' && typeof this.rnVoice.isValidTwilioNotification === 'function') {
        return this.rnVoice.isValidTwilioNotification(payload);
      }
      return false;
    } catch (error) {
      console.error('VoiceExpo.isTwilioNotification error:', error);
      return false;
    }
  }

  /**
   * Set the speaker phone mode
   * @param enabled Whether to enable or disable speaker phone
   * @returns Whether the operation was successful
   */
  async setSpeakerPhone(enabled: boolean): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        if (this.expoNativeModule && this.expoNativeModule.voice_set_speaker_phone) {
          return await this.expoNativeModule.voice_set_speaker_phone(enabled);
        }
        // Fall back to AudioManager if available on Android
        return false;
      } else if (Platform.OS === 'ios') {
        // On iOS, we use AVAudioSession, wrapped in the iOS module
        if (typeof this.rnVoice.setSpeakerPhone === 'function') {
          await this.rnVoice.setSpeakerPhone(enabled);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('VoiceExpo.setSpeakerPhone error:', error);
      return false;
    }
  }

  /**
   * Get the device token for push notifications
   * @returns The device token or null if not available
   */
  async getDeviceToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'android' && this.expoNativeModule && this.expoNativeModule.voice_get_device_token) {
        return await this.expoNativeModule.voice_get_device_token();
      } else if (Platform.OS === 'ios' && typeof this.rnVoice.getDeviceToken === 'function') {
        return await this.rnVoice.getDeviceToken();
      }
      return null;
    } catch (error) {
      console.error('VoiceExpo.getDeviceToken error:', error);
      return null;
    }
  }

  /**
   * Accept an incoming call
   * @param callSid SID of the call to accept
   * @returns Whether the call was successfully accepted
   */
  async accept(callSid: string): Promise<boolean> {
    try {
      if (!callSid) return false;
      
      const callInvite = this.getCallInviteBySid(callSid);
      if (callInvite && typeof callInvite.accept === 'function') {
        callInvite.accept();
        return true;
      }
      
      // Try direct module methods if available
      if (Platform.OS === 'android' && this.expoNativeModule && this.expoNativeModule.voice_accept) {
        return await this.expoNativeModule.voice_accept(callSid);
      }
      
      return false;
    } catch (error) {
      console.error('VoiceExpo.accept error:', error);
      return false;
    }
  }

  /**
   * Reject an incoming call
   * @param callSid SID of the call to reject
   * @returns Whether the call was successfully rejected
   */
  async reject(callSid: string): Promise<boolean> {
    try {
      if (!callSid) return false;
      
      const callInvite = this.getCallInviteBySid(callSid);
      if (callInvite && typeof callInvite.reject === 'function') {
        callInvite.reject();
        return true;
      }
      
      // Try direct module methods if available
      if (Platform.OS === 'android' && this.expoNativeModule && this.expoNativeModule.voice_reject) {
        return await this.expoNativeModule.voice_reject(callSid);
      }
      
      return false;
    } catch (error) {
      console.error('VoiceExpo.reject error:', error);
      return false;
    }
  }
}

/**
 * Singleton instance of the VoiceExpo module
 */
export const VoiceExpo: VoiceExpoType = new VoiceExpoImpl(); 