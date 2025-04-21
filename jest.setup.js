// Mock expo-modules-core for tests
jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn(() => ({
    // Mock expo module functions
    voice_connect: jest.fn(() => 'mock-call-sid'),
    voice_disconnect: jest.fn(() => true),
    voice_mute: jest.fn(() => true),
    voice_hold: jest.fn(() => true),
    voice_send_digits: jest.fn(() => true),
    voice_get_call_state: jest.fn(() => 'connected'),
    voice_register: jest.fn(() => true),
    voice_unregister: jest.fn(() => true),
    voice_handle_notification: jest.fn(() => true),
    voice_is_twilio_notification: jest.fn(() => true),
    voice_set_speaker_phone: jest.fn(() => true),
    voice_get_device_token: jest.fn(() => 'mock-token'),
    voice_accept: jest.fn(() => true),
    voice_reject: jest.fn(() => true)
  }))
}));

// Mock react-native Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android',
  select: jest.fn(obj => obj.android)
}));

// Mock Voice module
jest.mock('./src/Voice', () => {
  const EventEmitter = require('eventemitter3');
  
  const voiceEmitter = new EventEmitter();
  
  const Voice = {
    Event: {
      CallInvite: 'callInvite',
      Call: 'call',
      CallConnected: 'callConnected',
      CallDisconnected: 'callDisconnected',
      CallInviteCanceled: 'callInviteCanceled',
      CallRejected: 'callRejected',
      Registered: 'registered',
      Unregistered: 'unregistered',
      ConnectionError: 'connectionError'
    },
    on: jest.fn((event, callback) => voiceEmitter.on(event, callback)),
    off: jest.fn((event, callback) => voiceEmitter.off(event, callback)),
    connect: jest.fn(() => Promise.resolve({
      getSid: jest.fn(() => 'mock-call-sid'),
      getState: jest.fn(() => 'connected'),
      disconnect: jest.fn(),
      mute: jest.fn(),
      hold: jest.fn(),
      sendDigits: jest.fn()
    })),
    register: jest.fn(() => Promise.resolve()),
    unregister: jest.fn(() => Promise.resolve()),
    handleNotification: jest.fn(() => Promise.resolve(true)),
    isValidTwilioNotification: jest.fn(() => true),
    setSpeakerPhone: jest.fn(() => Promise.resolve()),
    getDeviceToken: jest.fn(() => Promise.resolve('mock-token')),
    // Add method to trigger events (for testing)
    _emit: (event, ...args) => voiceEmitter.emit(event, ...args)
  };
  
  return { Voice };
}); 