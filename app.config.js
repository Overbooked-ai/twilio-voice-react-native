const withTwilioVoiceIos = require('./expo-config-plugin/ios');
const withTwilioVoiceAndroid = require('./expo-config-plugin/android');

module.exports = function(config) {
  // Configure Twilio Voice for iOS
  config = withTwilioVoiceIos(config);

  // Configure Twilio Voice for Android
  config = withTwilioVoiceAndroid(config);

  return config;
}; 