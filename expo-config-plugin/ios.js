const { withPlugins } = require('@expo/config-plugins');

const withTwilioVoiceIos = (config) => {
  // Add required permissions and capabilities
  if (!config.ios) {
    config.ios = {};
  }

  // Add background modes
  if (!config.ios.infoPlist) {
    config.ios.infoPlist = {};
  }

  // Add required background modes
  config.ios.infoPlist.UIBackgroundModes = [
    'audio',
    'voip',
    'remote-notification'
  ];

  // Add required permissions
  config.ios.infoPlist.NSMicrophoneUsageDescription = 
    'Allow $(PRODUCT_NAME) to access your microphone for voice calls';
  
  config.ios.infoPlist.NSCameraUsageDescription = 
    'Allow $(PRODUCT_NAME) to access your camera for video calls';

  return config;
};

module.exports = withPlugins; 