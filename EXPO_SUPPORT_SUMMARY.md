# Twilio Voice React Native SDK - Expo Support Summary

## Overview

This document summarizes the changes made to add Expo support to the Twilio Voice React Native SDK, following the guide in [issue #496](https://github.com/twilio/twilio-voice-react-native/issues/496). It also provides instructions for using this fork in your Expo app and outlines next steps for further development.

## Summary of Changes

### 1. iOS Config Plugin (`expo-config-plugin/ios.js`)
- Added required background modes:
  - Audio
  - Voice over IP
  - Push Notifications
- Added required permissions:
  - Microphone access
  - Camera access

### 2. Android Config Plugin (`expo-config-plugin/android.js`)
- Added required permissions:
  - INTERNET
  - RECORD_AUDIO
  - MODIFY_AUDIO_SETTINGS
  - ACCESS_NETWORK_STATE
  - WAKE_LOCK
  - FOREGROUND_SERVICE
- Added required services:
  - VoiceFirebaseMessagingService
- Added Google Services Plugin to build.gradle
- Added functionality to copy google-services.json to the proper location

### 3. Android Expo Package, Module, and Lifecycle Listeners
- Created `ExpoModule.kt` with voice methods:
  - voice_connect
  - voice_disconnect
  - voice_accept
  - voice_reject
- Created `ExpoPackage.java` to declare lifecycle listeners
- Created `ExpoActivityLifecycleListener.java` to handle activity lifecycle events
- Created `ExpoApplicationLifecycleListener.java` to handle application lifecycle events

### 4. Modified Android build.gradle
- Added Kotlin compiler configuration (version 1.9.24)

### 5. JS Module (`src/ExpoModule.ts`)
- Created to utilize the Expo Modules API
- Implemented platform-specific code paths for iOS and Android

### 6. Expo Configuration Files
- Created `expo-module.config.json` to declare the Android module
- Created `app.config.js` to configure the Expo plugins

### 7. Package.json
- Moved expo-modules-core from devDependencies to dependencies

### 8. Firebase Cloud Messaging Configuration
- Verified that the config.xml file already has the required configuration

## Using This Fork in Your Expo App

### Prerequisites
1. You need to have an Expo app with the "bare" workflow (not managed workflow)
2. You need to have a Twilio account with Voice capabilities
3. You need to have Firebase Cloud Messaging set up for your app

### Installation Steps

1. **Install the fork from the repository**
   ```bash
   yarn add git+https://github.com/guyrosen/twilio-voice-react-native.git
   # or
   npm install git+https://github.com/guyrosen/twilio-voice-react-native.git
   ```

2. **Add the Expo config plugins to your app.config.js**
   ```javascript
   module.exports = {
     // ... your existing config
     plugins: [
       // ... your existing plugins
       './node_modules/@twilio/voice-react-native-sdk/expo-config-plugin/ios.js',
       './node_modules/@twilio/voice-react-native-sdk/expo-config-plugin/android.js'
     ]
   };
   ```

3. **Add Firebase configuration**
   - Place your `google-services.json` file in the root of your project
   - The config plugin will copy it to the correct location during the prebuild phase

4. **Run the Expo prebuild command**
   ```bash
   npx expo prebuild
   ```

5. **Import and use the Voice module in your app**
   ```javascript
   import Voice from '@twilio/voice-react-native-sdk/src/ExpoModule';
   
   // Connect to a call
   const connect = async (accessToken) => {
     try {
       await Voice.connect(accessToken);
       console.log('Connected to call');
     } catch (error) {
       console.error('Error connecting to call:', error);
     }
   };
   
   // Disconnect from a call
   const disconnect = async (callSid) => {
     try {
       await Voice.disconnect(callSid);
       console.log('Disconnected from call');
     } catch (error) {
       console.error('Error disconnecting from call:', error);
     }
   };
   
   // Accept a call
   const accept = async (callSid) => {
     try {
       await Voice.accept(callSid);
       console.log('Call accepted');
     } catch (error) {
       console.error('Error accepting call:', error);
     }
   };
   
   // Reject a call
   const reject = async (callSid) => {
     try {
       await Voice.reject(callSid);
       console.log('Call rejected');
     } catch (error) {
       console.error('Error rejecting call:', error);
     }
   };
   ```

### Important Notes

1. **Firebase Cloud Messaging**
   - The SDK uses Firebase Cloud Messaging for incoming calls
   - Make sure your Firebase project is properly configured
   - The config plugin will add the necessary permissions and services

2. **iOS Permissions**
   - The config plugin will add the necessary permissions to your iOS app
   - You may need to provide custom permission messages in your app.config.js

3. **Android Permissions**
   - The config plugin will add the necessary permissions to your Android app
   - You may need to request these permissions at runtime in your app

4. **Known Issues**
   - There are TypeScript errors with the expo-modules-core package that need to be resolved
   - These errors are preventing the pre-commit hook from passing

## Next Steps

### 1. Fix TypeScript Errors
- Resolve TypeScript errors with the expo-modules-core package
- Consider updating the expo-modules-core package or fixing the type definitions

### 2. Testing
- Test the implementation in an Expo app to ensure that all functionality works as expected
- Test both iOS and Android platforms
- Test all voice calling features (connect, disconnect, accept, reject)

### 3. Documentation
- Update the README.md to include instructions for using the SDK with Expo
- Document any specific requirements or limitations when using the SDK with Expo

### 4. CI/CD
- Update the CI/CD pipeline to include testing with Expo
- Ensure that the build process works correctly with the new Expo support

### 5. Release
- Create a new release with the Expo support
- Update the version number in package.json

### 6. Community Feedback
- Share the implementation with the community and gather feedback
- Address any issues or concerns raised by the community

### 7. Maintenance
- Keep the implementation up-to-date with the latest versions of Expo and React Native
- Monitor for any breaking changes in Expo or React Native that might affect the implementation

## Conclusion

This implementation provides a solid foundation for using the Twilio Voice React Native SDK with Expo. By following the instructions in this document, you should be able to integrate the SDK into your Expo app and start using Twilio Voice features. The next steps will help ensure that the implementation is robust, well-tested, and well-documented. 