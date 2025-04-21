// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn(() => ({
    voice_connect: jest.fn().mockResolvedValue('call-sid-123'),
    voice_disconnect: jest.fn().mockResolvedValue(true),
    voice_mute: jest.fn().mockResolvedValue(true),
    voice_hold: jest.fn().mockResolvedValue(true),
    voice_send_digits: jest.fn().mockResolvedValue(true),
    voice_get_call_state: jest.fn().mockResolvedValue('connected'),
    voice_register: jest.fn().mockResolvedValue(true),
    voice_unregister: jest.fn().mockResolvedValue(true),
    voice_handle_notification: jest.fn().mockResolvedValue(true),
    voice_is_twilio_notification: jest.fn().mockReturnValue(true),
    voice_set_speaker_phone: jest.fn().mockResolvedValue(true),
    voice_get_device_token: jest.fn().mockResolvedValue('device-token-123'),
    voice_accept: jest.fn().mockResolvedValue(true),
    voice_reject: jest.fn().mockResolvedValue(true),
  })),
}));

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: jest.fn(obj => obj.android || obj.default),
  },
}));

// Mock Voice
jest.mock('./src/Voice', () => ({
  Voice: {
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue({
      getSid: jest.fn().mockReturnValue('call-sid-123'),
    }),
    register: jest.fn().mockResolvedValue(),
    unregister: jest.fn().mockResolvedValue(),
    handleNotification: jest.fn().mockResolvedValue(true),
    isValidTwilioNotification: jest.fn().mockReturnValue(true),
    setSpeakerPhone: jest.fn().mockResolvedValue(),
    getDeviceToken: jest.fn().mockResolvedValue('device-token-123'),
    Event: {
      CallInvite: 'call-invite',
      Call: 'call',
      CallDisconnected: 'call-disconnected',
      CallInviteCanceled: 'call-invite-canceled',
      CallConnected: 'call-connected',
    },
  },
}));

// Global console mocks to reduce noise
global.console = {
  ...global.console,
  error: jest.fn(),
  warn: jest.fn(),
}; 