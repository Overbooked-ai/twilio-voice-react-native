// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.TwilioVoiceReactNative = {
    makeCall: jest.fn().mockResolvedValue({}),
    handlePushNotification: jest.fn().mockResolvedValue(true),
    registerForCallInvites: jest.fn().mockResolvedValue(true),
    unregisterForCallInvites: jest.fn().mockResolvedValue(true),
    getCallState: jest.fn().mockResolvedValue('CONNECTED'),
    getDeviceToken: jest.fn().mockResolvedValue('mock-device-token'),
    disconnectCall: jest.fn().mockResolvedValue(true),
    muteCall: jest.fn().mockResolvedValue(true),
    holdCall: jest.fn().mockResolvedValue(true),
    sendDigits: jest.fn().mockResolvedValue(true),
    isTwilioNotification: jest.fn().mockReturnValue(true),
    setSpeakerPhone: jest.fn().mockResolvedValue(true),
  };
  RN.Platform.OS = 'ios';
  return RN;
});

// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({
    voice_connect: jest.fn().mockResolvedValue('mock-call-uuid'),
    voice_disconnect: jest.fn().mockResolvedValue(true),
    voice_mute: jest.fn().mockResolvedValue(true),
    voice_hold: jest.fn().mockResolvedValue(true),
    voice_send_digits: jest.fn().mockResolvedValue(true),
    voice_get_call_state: jest.fn().mockResolvedValue('CONNECTED'),
    voice_register: jest.fn().mockResolvedValue(true),
    voice_unregister: jest.fn().mockResolvedValue(true),
    voice_handle_notification: jest.fn().mockResolvedValue(true),
    voice_is_twilio_notification: jest.fn().mockResolvedValue(true),
    voice_set_speaker_phone: jest.fn().mockResolvedValue(true),
    voice_get_device_token: jest.fn().mockResolvedValue('mock-device-token'),
    voice_accept: jest.fn().mockResolvedValue(true),
    voice_reject: jest.fn().mockResolvedValue(true),
  }),
}));

// Global mocks
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}; 