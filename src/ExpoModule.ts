import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';
import type { CallInvite } from './CallInvite';
import type { Call } from './Call';
import { NativeModule as RNNativeModule } from './common';

/**
 * Interface for the Expo native module
 */
interface TwilioVoiceExpoModule {
  voice_connect(accessToken: string, params?: Record<string, string>, displayName?: string): string | null;
  voice_disconnect(callUuid: string): boolean;
  voice_mute(callUuid: string, isMuted: boolean): boolean;
  voice_send_digits(callUuid: string, digits: string): boolean;
  voice_hold(callUuid: string, onHold: boolean): boolean;
  voice_get_call_state(callUuid: string): string | null;
  voice_register(accessToken: string, fcmToken?: string): boolean;
  voice_unregister(accessToken: string, fcmToken?: string): boolean;
  voice_handle_notification(payload: Record<string, any>): boolean;
  voice_is_twilio_notification(payload: Record<string, any>): boolean;
}

/**
 * The Expo module interface for the Twilio Voice SDK
 */
class ExpoModuleInterface {
  private androidExpoNativeModule: TwilioVoiceExpoModule | null = null;

  constructor() {
    // Only initialize the Android Expo module on Android
    if (Platform.OS === 'android') {
      try {
        this.androidExpoNativeModule = requireNativeModule('TwilioVoiceModule');
      } catch (e) {
        console.error('Failed to load Expo native module for Twilio Voice:', e);
      }
    }
  }

  /**
   * Checks if we're running in an Expo environment
   */
  isExpoEnvironment(): boolean {
    return Platform.OS === 'android' && this.androidExpoNativeModule !== null;
  }

  /**
   * Makes an outgoing call
   * @param accessToken JWT token used to authenticate with Twilio
   * @param params Parameters for the call
   * @param displayName Display name for the call shown in notifications
   * @returns UUID of the created call or null if the call failed
   */
  async connect(
    accessToken: string,
    params?: Record<string, string>,
    displayName?: string
  ): Promise<string | null> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_connect(accessToken, params, displayName);
    } else if (Platform.OS === 'ios') {
      // On iOS, we use the React Native module directly
      return RNNativeModule.makeCall(accessToken, params || {});
    }
    return null;
  }

  /**
   * Disconnects a specific call
   * @param callUuid UUID of the call to disconnect
   * @returns Whether the call was successfully disconnected
   */
  async disconnect(callUuid: string): Promise<boolean> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_disconnect(callUuid);
    } else if (Platform.OS === 'ios') {
      return !!RNNativeModule.disconnectCall(callUuid);
    }
    return false;
  }

  /**
   * Mutes or unmutes a specific call
   * @param callUuid UUID of the call to mute/unmute
   * @param isMuted Whether the call should be muted
   * @returns Whether the mute operation was successful
   */
  async mute(callUuid: string, isMuted: boolean): Promise<boolean> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_mute(callUuid, isMuted);
    } else if (Platform.OS === 'ios') {
      return !!RNNativeModule.muteCall(callUuid, isMuted);
    }
    return false;
  }

  /**
   * Sends DTMF tones on a specific call
   * @param callUuid UUID of the call
   * @param digits DTMF digits to send
   * @returns Whether the digits were successfully sent
   */
  async sendDigits(callUuid: string, digits: string): Promise<boolean> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_send_digits(callUuid, digits);
    } else if (Platform.OS === 'ios') {
      return !!RNNativeModule.sendDigits(callUuid, digits);
    }
    return false;
  }

  /**
   * Holds or unholds a specific call
   * @param callUuid UUID of the call
   * @param onHold Whether the call should be on hold
   * @returns Whether the hold operation was successful
   */
  async hold(callUuid: string, onHold: boolean): Promise<boolean> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_hold(callUuid, onHold);
    } else if (Platform.OS === 'ios') {
      return !!RNNativeModule.holdCall(callUuid, onHold);
    }
    return false;
  }

  /**
   * Gets the current state of a specific call
   * @param callUuid UUID of the call
   * @returns The current state of the call or null if the call doesn't exist
   */
  async getCallState(callUuid: string): Promise<string | null> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_get_call_state(callUuid);
    } else if (Platform.OS === 'ios') {
      return RNNativeModule.getCallState(callUuid);
    }
    return null;
  }

  /**
   * Registers for push notifications with Twilio Voice
   * @param accessToken JWT token used to authenticate with Twilio
   * @param fcmToken FCM token for push notifications (Android only)
   * @returns Whether the registration was successful
   */
  async register(accessToken: string, fcmToken?: string): Promise<boolean> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_register(accessToken, fcmToken);
    } else if (Platform.OS === 'ios') {
      return !!RNNativeModule.registerForCallInvites(accessToken);
    }
    return false;
  }

  /**
   * Unregisters from push notifications with Twilio Voice
   * @param accessToken JWT token used to authenticate with Twilio
   * @param fcmToken FCM token for push notifications (Android only)
   * @returns Whether the unregistration was successful
   */
  async unregister(accessToken: string, fcmToken?: string): Promise<boolean> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_unregister(accessToken, fcmToken);
    } else if (Platform.OS === 'ios') {
      return !!RNNativeModule.unregisterForCallInvites(accessToken);
    }
    return false;
  }

  /**
   * Handles an incoming push notification
   * @param payload Push notification payload
   * @returns Whether the notification was handled
   */
  async handleNotification(payload: Record<string, any>): Promise<boolean> {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_handle_notification(payload);
    } else if (Platform.OS === 'ios') {
      return !!RNNativeModule.handlePushNotification(payload);
    }
    return false;
  }

  /**
   * Checks if a push notification is a valid Twilio Voice notification
   * @param payload Push notification payload
   * @returns Whether the notification is a valid Twilio Voice notification
   */
  isTwilioNotification(payload: Record<string, any>): boolean {
    if (Platform.OS === 'android' && this.androidExpoNativeModule) {
      return this.androidExpoNativeModule.voice_is_twilio_notification(payload);
    } else if (Platform.OS === 'ios') {
      return !!RNNativeModule.isTwilioNotification(payload);
    }
    return false;
  }
}

export const ExpoModule = new ExpoModuleInterface(); 