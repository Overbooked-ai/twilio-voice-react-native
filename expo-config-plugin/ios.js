const { withInfoPlist, withEntitlementsPlist, createRunOncePlugin } = require('@expo/config-plugins');

const MICROPHONE_USAGE = 'Allow $(PRODUCT_NAME) to access your microphone for VoIP calls.';
const BACKGROUND_MODES = [
  'audio',
  'voip',
  // 'fetch', // Add if needed
  // 'remote-notification' // Usually handled by expo-notifications or similar
];

const withTwilioVoiceIOS = (config, props = {}) => {
  // Ensure Info.plist permissions
  config = withInfoPlist(config, (config) => {
    const existingPermissions = config.modResults.NSMicrophoneUsageDescription;
    config.modResults.NSMicrophoneUsageDescription = 
      props.microphonePermission || existingPermissions || MICROPHONE_USAGE;

    // Ensure Background Modes are set
    let existingBackgroundModes = config.modResults.UIBackgroundModes || [];
    // Remove duplicates and merge
    config.modResults.UIBackgroundModes = [
      ...new Set([...existingBackgroundModes, ...BACKGROUND_MODES])
    ];
    
    console.log('TwilioVoiceReactNative: Configured Info.plist permissions and background modes.');
    return config;
  });

  // Ensure Push Notification capability (often needed for VoIP)
  // Note: This might overlap with expo-notifications setup. Check for conflicts.
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['aps-environment'] = props.apsEnvironment || (process.env.NODE_ENV === 'production' ? 'production' : 'development');
    console.log(`TwilioVoiceReactNative: Configured aps-environment to ${config.modResults['aps-environment']}`);
    return config;
  });

  // Add other iOS specific configurations if needed based on Twilio docs
  // e.g., CallKit setup, VoIP push certificate handling (might require more complex mods)

  return config;
};

module.exports = createRunOncePlugin(withTwilioVoiceIOS, 'twilio-voice-react-native-expo-ios', '1.0.0');
