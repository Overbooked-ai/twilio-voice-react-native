const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

/**
 * Adds the required entitlements for Twilio Voice to function on iOS
 * - Background Modes: Audio, AirPlay, and Picture in Picture
 * - Background Modes: Voice over IP
 * - Push Notifications
 * @param {Object} config - The Expo configuration object
 * @returns {Object} The modified configuration object
 */
const withVoiceIosEntitlements = (config) => {
  return withEntitlementsPlist(config, (mod) => {
    // Add push notification entitlement
    mod.modResults['aps-environment'] = 'development';

    // Add background modes entitlement
    if (!mod.modResults['com.apple.developer.pushkit.unrestricted-voip']) {
      mod.modResults['com.apple.developer.pushkit.unrestricted-voip'] = true;
    }

    return mod;
  });
};

/**
 * Adds the required Info.plist permissions for Twilio Voice to function on iOS
 * - NSMicrophoneUsageDescription
 * - UIBackgroundModes (voip, audio)
 * @param {Object} config - The Expo configuration object
 * @returns {Object} The modified configuration object
 */
const withVoiceIosPlist = (config) => {
  return withInfoPlist(config, (mod) => {
    // Add microphone usage description if it doesn't exist
    if (!mod.modResults.NSMicrophoneUsageDescription) {
      mod.modResults.NSMicrophoneUsageDescription =
        'Allow $(PRODUCT_NAME) to access your microphone for calls';
    }

    // Add UIBackgroundModes for voip and audio if they don't exist
    const existingModes = mod.modResults.UIBackgroundModes || [];
    const requiredModes = ['voip', 'audio'];

    requiredModes.forEach((mode) => {
      if (!existingModes.includes(mode)) {
        existingModes.push(mode);
      }
    });

    mod.modResults.UIBackgroundModes = existingModes;

    return mod;
  });
};

/**
 * Expo config plugin that adds the required permissions and capabilities
 * for Twilio Voice to function on iOS
 * @param {Object} config - The Expo configuration object
 * @returns {Object} The modified configuration object
 */
const withTwilioVoiceIos = (config) => {
  config = withVoiceIosEntitlements(config);
  config = withVoiceIosPlist(config);
  return config;
};

module.exports = withTwilioVoiceIos; 