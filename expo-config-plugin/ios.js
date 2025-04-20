const { withInfoPlist } = require('@expo/config-plugins');

const withTwilioVoiceIos = (config) => {
  // Add required permissions and capabilities
  return withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;
    
    // Add background modes
    if (!infoPlist.UIBackgroundModes) {
      infoPlist.UIBackgroundModes = [];
    }

    // Add required background modes if they don't exist
    const requiredModes = ['audio', 'voip', 'remote-notification'];
    requiredModes.forEach(mode => {
      if (!infoPlist.UIBackgroundModes.includes(mode)) {
        infoPlist.UIBackgroundModes.push(mode);
      }
    });

    // Add required permissions
    infoPlist.NSMicrophoneUsageDescription = 
      infoPlist.NSMicrophoneUsageDescription || 
      'Allow $(PRODUCT_NAME) to access your microphone for voice calls';
    
    infoPlist.NSCameraUsageDescription = 
      infoPlist.NSCameraUsageDescription || 
      'Allow $(PRODUCT_NAME) to access your camera for video calls';

    return config;
  });
};

module.exports = withTwilioVoiceIos; 