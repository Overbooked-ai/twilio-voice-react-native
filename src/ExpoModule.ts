import { requireNativeModule } from 'expo-modules-core';
import { Platform, NativeModules } from 'react-native';

const ExpoTwilioVoice = requireNativeModule('TwilioVoice');

class Voice {
  static async connect(accessToken: string): Promise<void> {
    if (Platform.OS === 'android') {
      return ExpoTwilioVoice.voice_connect(accessToken);
    } else {
      // Use existing iOS implementation
      return NativeModules.TwilioVoiceReactNative.connect(accessToken);
    }
  }

  static async disconnect(callSid: string): Promise<void> {
    if (Platform.OS === 'android') {
      return ExpoTwilioVoice.voice_disconnect(callSid);
    } else {
      // Use existing iOS implementation
      return NativeModules.TwilioVoiceReactNative.disconnect(callSid);
    }
  }

  static async accept(callSid: string): Promise<void> {
    if (Platform.OS === 'android') {
      return ExpoTwilioVoice.voice_accept(callSid);
    } else {
      // Use existing iOS implementation
      return NativeModules.TwilioVoiceReactNative.accept(callSid);
    }
  }

  static async reject(callSid: string): Promise<void> {
    if (Platform.OS === 'android') {
      return ExpoTwilioVoice.voice_reject(callSid);
    } else {
      // Use existing iOS implementation
      return NativeModules.TwilioVoiceReactNative.reject(callSid);
    }
  }
}

export default Voice; 