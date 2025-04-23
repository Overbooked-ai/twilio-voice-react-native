module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.twiliovoicereactnative.TwilioVoiceReactNativePackage;',
        packageInstance: 'new TwilioVoiceReactNativePackage()'
      },
      ios: {
        podspecPath: './twilio-voice-react-native.podspec'
      }
    }
  }
}; 