import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';
import { Voice, Call, CallInvite } from '@twilio/voice-react-native';
import { VoiceExpoType } from './types';

/**
 * Implementation of the Twilio Voice Expo functionality
 */
export class VoiceExpo implements VoiceExpoType {
  private rnVoice: typeof Voice;
  private expoNativeModule: any | null = null;
  private currentCall: Call | null = null;
  private callInvite: CallInvite | null = null;

  constructor() {
    this.rnVoice = Voice;
    
    if (Platform.OS === 'android') {
      try {
        this.expoNativeModule = requireNativeModule('TwilioVoiceModule');
      } catch (e) {
        console.warn('Failed to load Expo native module for Twilio Voice. Using React Native implementation instead.');
        this.expoNativeModule = null;
      }
    }
    
    this.setupListeners();
  }

  private setupListeners(): void {
    if (this.rnVoice) {
      this.rnVoice.on(Voice.Event.CallInvite, (callInvite: CallInvite) => {
        if (callInvite?.getSid()) {
          this.callInvite = callInvite;
        }
      });
      
      this.rnVoice.on(Voice.Event.Call, (call: Call) => {
        if (call?.getSid()) {
          this.currentCall = call;
        }
      });
      
      this.rnVoice.on(Voice.Event.CallDisconnected, (call: Call) => {
        if (call?.getSid() === this.currentCall?.getSid()) {
          this.currentCall = null;
        }
      });
      
      this.rnVoice.on(Voice.Event.CallInviteCanceled, (callInvite: CallInvite) => {
        if (callInvite?.getSid() === this.callInvite?.getSid()) {
          this.callInvite = null;
        }
      });
    }
  }

  private getCallBySid(callSid: string): Call | null {
    return this.currentCall?.getSid() === callSid ? this.currentCall : null;
  }

  private getCallInviteBySid(callSid: string): CallInvite | null {
    return this.callInvite?.getSid() === callSid ? this.callInvite : null;
  }

  async connect(accessToken: string, params?: Record<string, string>, displayName?: string): Promise<string> {
    try {
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_connect(accessToken, params || {}, displayName) || '';
      } else {
        this.currentCall = await this.rnVoice.connect(accessToken, params || {});
        return this.currentCall?.getSid() || '';
      }
    } catch (error) {
      console.error('VoiceExpo.connect error:', error);
      throw error;
    }
  }

  async disconnect(callSid: string): Promise<boolean> {
    try {
      if (!callSid) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_disconnect(callSid);
      } else {
        const call = this.getCallBySid(callSid);
        if (call) {
          call.disconnect();
          this.currentCall = null;
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('VoiceExpo.disconnect error:', error);
      return false;
    }
  }

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

  async sendDigits(callSid: string, digits: string): Promise<boolean> {
    try {
      if (!callSid || !digits) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_sendDigits(callSid, digits);
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

  async getCallState(callSid: string): Promise<string | null> {
    try {
      if (!callSid) return null;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_getCallState(callSid);
      } else {
        const call = this.getCallBySid(callSid);
        return call ? call.getState() : null;
      }
    } catch (error) {
      console.error('VoiceExpo.getCallState error:', error);
      return null;
    }
  }

  async register(accessToken: string, fcmToken?: string): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_register(accessToken, fcmToken);
      } else {
        await this.rnVoice.register(accessToken);
        return true;
      }
    } catch (error) {
      console.error('VoiceExpo.register error:', error);
      return false;
    }
  }

  async unregister(accessToken: string, fcmToken?: string): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_unregister(accessToken, fcmToken);
      } else {
        await this.rnVoice.unregister(accessToken);
        return true;
      }
    } catch (error) {
      console.error('VoiceExpo.unregister error:', error);
      return false;
    }
  }

  async handleNotification(payload: Record<string, any>): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_handleNotification(payload);
      } else {
        return await this.rnVoice.handleNotification(payload);
      }
    } catch (error) {
      console.error('VoiceExpo.handleNotification error:', error);
      return false;
    }
  }

  async isTwilioNotification(payload: Record<string, any>): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_isTwilioNotification(payload);
      } else {
        return this.rnVoice.isValidTwilioNotification(payload);
      }
    } catch (error) {
      console.error('VoiceExpo.isTwilioNotification error:', error);
      return false;
    }
  }

  async setSpeakerPhone(enabled: boolean): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_setSpeakerPhone(enabled);
      } else {
        this.rnVoice.setSpeakerPhone(enabled);
        return true;
      }
    } catch (error) {
      console.error('VoiceExpo.setSpeakerPhone error:', error);
      return false;
    }
  }

  async getDeviceToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_getDeviceToken();
      } else {
        return await this.rnVoice.getDeviceToken();
      }
    } catch (error) {
      console.error('VoiceExpo.getDeviceToken error:', error);
      return null;
    }
  }

  async accept(callSid: string): Promise<boolean> {
    try {
      if (!callSid) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_accept(callSid);
      } else {
        const callInvite = this.getCallInviteBySid(callSid);
        if (callInvite) {
          callInvite.accept();
          this.callInvite = null;
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('VoiceExpo.accept error:', error);
      return false;
    }
  }

  async reject(callSid: string): Promise<boolean> {
    try {
      if (!callSid) return false;
      
      if (Platform.OS === 'android' && this.expoNativeModule) {
        return await this.expoNativeModule.voice_reject(callSid);
      } else {
        const callInvite = this.getCallInviteBySid(callSid);
        if (callInvite) {
          callInvite.reject();
          this.callInvite = null;
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('VoiceExpo.reject error:', error);
      return false;
    }
  }

  on(event: string, callback: (data: any) => void): void {
    this.rnVoice.on(event, callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.rnVoice.off(event, callback);
  }
}

// Export a singleton instance
export const VoiceExpoInstance = new VoiceExpo(); 