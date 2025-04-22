const {
  withInfoPlist,
  withEntitlementsPlist,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const MICROPHONE_USAGE =
  'Allow $(PRODUCT_NAME) to access your microphone for VoIP calls.';
const BACKGROUND_MODES = [
  'audio',
  'voip',
  // 'fetch', // Add if needed
  // 'remote-notification' // Usually handled by expo-notifications or similar
];

const withTwilioVoiceIOS = (baseConfig, props = {}) => {
  // Ensure Info.plist permissions
  let modifiedConfig = withInfoPlist(baseConfig, (plistConfig) => {
    const existingPermissions =
      plistConfig.modResults.NSMicrophoneUsageDescription;
    plistConfig.modResults.NSMicrophoneUsageDescription =
      props.microphonePermission || existingPermissions || MICROPHONE_USAGE;

    // Ensure Background Modes are set
    let existingBackgroundModes =
      plistConfig.modResults.UIBackgroundModes || [];
    // Remove duplicates and merge
    plistConfig.modResults.UIBackgroundModes = [
      ...new Set([...existingBackgroundModes, ...BACKGROUND_MODES]),
    ];

    console.log(
      'TwilioVoiceReactNative: Configured Info.plist permissions and background modes.'
    );
    return plistConfig;
  });

  // Ensure Push Notification capability (often needed for VoIP)
  // Note: This might overlap with expo-notifications setup. Check for conflicts.
  modifiedConfig = withEntitlementsPlist(
    modifiedConfig,
    (entitlementsConfig) => {
      entitlementsConfig.modResults['aps-environment'] =
        props.apsEnvironment ||
        (process.env.NODE_ENV === 'production' ? 'production' : 'development');
      console.log(
        `TwilioVoiceReactNative: Configured aps-environment to ${entitlementsConfig.modResults['aps-environment']}`
      );
      return entitlementsConfig;
    }
  );

  // Add other iOS specific configurations if needed based on Twilio docs
  // e.g., CallKit setup, VoIP push certificate handling (might require more complex mods)

  return modifiedConfig;
};

module.exports = createRunOncePlugin(
  withTwilioVoiceIOS,
  'twilio-voice-react-native-expo-ios',
  '1.0.0'
);
