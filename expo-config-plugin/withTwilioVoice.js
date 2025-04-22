const { createRunOncePlugin } = require('@expo/config-plugins');
const withTwilioVoiceAndroid = require('./android');
const withTwilioVoiceIOS = require('./ios');

const pkg = require('../package.json');

/**
 * Apply TwilioVoiceReactNative configuration for Expo
 * @param config ExpoConfig
 * @param props Configuration properties
 *   - microphonePermission (string): Custom text for microphone permission on iOS.
 *   - disableTwilioFCMListener (boolean): If true, disables the built-in FCM listener on Android (requires manual handling).
 *   - googleServicesVersion (string): Specific google-services plugin version for Android.
 *   - apsEnvironment ('development' | 'production'): Set the APS environment for iOS push notifications.
 */
const withTwilioVoice = (config, props = {}) => {
  // Apply Android modifications
  config = withTwilioVoiceAndroid(config, props);

  // Apply iOS modifications
  config = withTwilioVoiceIOS(config, props);

  return config;
};

module.exports = createRunOncePlugin(withTwilioVoice, pkg.name, pkg.version);
