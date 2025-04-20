import { requireNativeModule } from 'expo-modules-core';
import { Platform, NativeModules } from 'react-native';

// Get the appropriate native module based on platform
const ExpoTwilioVoice = Platform.OS === 'android' 
  ? requireNativeModule('TwilioVoice') 
  : null;

/**
 * Expo-compatible Voice module that works in both Expo and React Native environments
 */
class VoiceExpo {
  /**
   * Connect to a Twilio call with the provided access token
   * @param accessToken The Twilio access token
   * @returns A promise that resolves when the call is connected
   */
  static async connect(accessToken: string): Promise<string | void> {
    if (Platform.OS === 'android' && ExpoTwilioVoice) {
      return ExpoTwilioVoice.voice_connect(accessToken);
    } else if (Platform.OS === 'ios') {
      // Use existing iOS implementation
      return NativeModules.TwilioVoiceReactNative.connect(accessToken);
    }
    throw new Error('Platform not supported');
  }

  /**
   * Disconnect an ongoing call
   * @param callSid The SID of the call to disconnect
   * @returns A promise that resolves when the call is disconnected
   */
  static async disconnect(callSid: string): Promise<boolean | void> {
    if (Platform.OS === 'android' && ExpoTwilioVoice) {
      return ExpoTwilioVoice.voice_disconnect(callSid);
    } else if (Platform.OS === 'ios') {
      // Use existing iOS implementation
      return NativeModules.TwilioVoiceReactNative.disconnect(callSid);
    }
    throw new Error('Platform not supported');
  }

  /**
   * Accept an incoming call
   * @param callSid The SID of the call to accept
   * @returns A promise that resolves when the call is accepted
   */
  static async accept(callSid: string): Promise<boolean | void> {
    if (Platform.OS === 'android' && ExpoTwilioVoice) {
      return ExpoTwilioVoice.voice_accept(callSid);
    } else if (Platform.OS === 'ios') {
      // Use existing iOS implementation
      return NativeModules.TwilioVoiceReactNative.accept(callSid);
    }
    throw new Error('Platform not supported');
  }

  /**
   * Reject an incoming call
   * @param callSid The SID of the call to reject
   * @returns A promise that resolves when the call is rejected
   */
  static async reject(callSid: string): Promise<boolean | void> {
    if (Platform.OS === 'android' && ExpoTwilioVoice) {
      return ExpoTwilioVoice.voice_reject(callSid);
    } else if (Platform.OS === 'ios') {
      // Use existing iOS implementation
      return NativeModules.TwilioVoiceReactNative.reject(callSid);
    }
    throw new Error('Platform not supported');
  }

  /**
   * Register for incoming calls
   * @param accessToken The Twilio access token
   * @returns A promise that resolves when registration is complete
   */
  static async register(accessToken: string): Promise<boolean | void> {
    if (Platform.OS === 'android' && ExpoTwilioVoice) {
      return ExpoTwilioVoice.register_for_calls(accessToken);
    } else if (Platform.OS === 'ios') {
      // Use existing iOS implementation
      return NativeModules.TwilioVoiceReactNative.registerForCalls(accessToken);
    }
    throw new Error('Platform not supported');
  }

  /**
   * Unregister from incoming calls
   * @param accessToken The Twilio access token
   * @returns A promise that resolves when unregistration is complete
   */
  static async unregister(accessToken: string): Promise<boolean | void> {
    if (Platform.OS === 'android' && ExpoTwilioVoice) {
      return ExpoTwilioVoice.unregister_for_calls(accessToken);
    } else if (Platform.OS === 'ios') {
      // Use existing iOS implementation
      return NativeModules.TwilioVoiceReactNative.unregisterForCalls(accessToken);
    }
    throw new Error('Platform not supported');
  }
}

export default VoiceExpo; 