# Twilio Voice React Native SDK - Expo Support Guide

This guide details how to use the Twilio Voice React Native SDK in Expo applications. The SDK has been modified to provide support for both Expo and bare React Native applications.

## Requirements

- Expo SDK 48 or higher
- Expo Development Build workflow (`npx expo prebuild`)
- Google Firebase project (for Android push notifications)
- Apple Developer account (for iOS VoIP push notifications)

## Installation

```bash
# Using npm
npm install @twilio/voice-react-native-sdk

# Using yarn
yarn add @twilio/voice-react-native-sdk

# Using pnpm
pnpm add @twilio/voice-react-native-sdk
```

## Setup

### 1. Modify app.json or app.config.js

Add the Twilio Voice plugin to your Expo config:

```js
// app.config.js
module.exports = {
  // ... your existing config
  plugins: [
    // ... other plugins
    "@twilio/voice-react-native-sdk"
  ]
};
```

### 2. Setup Push Notifications

#### Android

1. Create a Firebase project and download the `google-services.json` file
2. Place the `google-services.json` file in the root of your Expo project

#### iOS

1. Create a VoIP Services Certificate in your Apple Developer account
2. Configure your Expo project for Push Notifications
3. Ensure your app has the proper capabilities (will be handled by the config plugin)

### 3. Prebuild and Run

```bash
# Clean the project if you've built it before
npx expo clean

# Generate native code with Expo prebuild
npx expo prebuild --clean

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

### 4. Troubleshooting Android Gradle Issues

If you encounter Gradle build errors related to task dependencies, try the following:

```bash
# Make sure to clean thoroughly before rebuilding
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install  # Or yarn install or pnpm install

# Then rebuild
npx expo clean
npx expo prebuild --clean --platform android
npx expo run:android
```

Common error messages you might see:
- "Task uses this output without declaring a dependency"
- "Could not create task ':twilio_voice-react-native-sdk:packageDebugResources'"
- "DefaultTaskContainer#NamedDomainObjectProvider.configure(Action) on task set cannot be executed"

These errors are related to how Gradle handles task dependencies and have been addressed in this fork with special Gradle configuration. If problems persist, try adding this to your app's `android/build.gradle`:

```gradle
// Add this at the end of your app's android/build.gradle file
ext.android.disableImplicitDependencyValidation = true
```

## Usage

### Import and Initialize

```tsx
import React, { useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { VoiceExpo } from '@twilio/voice-react-native-sdk';

function VoiceScreen() {
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Register for incoming calls
  const registerForCalls = async () => {
    try {
      // Get your access token from server
      const accessToken = await fetchAccessToken();
      
      // Register for incoming calls
      await VoiceExpo.register(accessToken);
      setIsRegistered(true);
    } catch (error) {
      console.error('Error registering for calls:', error);
    }
  };
  
  // Make an outgoing call
  const makeCall = async () => {
    try {
      // Get your access token from server
      const accessToken = await fetchAccessToken();
      
      // Connect a call
      const callId = await VoiceExpo.connect(accessToken);
      console.log('Call connected with ID:', callId);
    } catch (error) {
      console.error('Error making call:', error);
    }
  };
  
  return (
    <View>
      {!isRegistered && (
        <Button title="Register for Calls" onPress={registerForCalls} />
      )}
      <Button title="Make Call" onPress={makeCall} />
    </View>
  );
}
```

### Handling Incoming Calls

To handle incoming calls, you need to set up event listeners. The Twilio Voice SDK uses event emitters to notify your app of incoming calls and call state changes.

```tsx
import { Voice } from '@twilio/voice-react-native-sdk';

// In your component
useEffect(() => {
  // Listen for incoming calls
  const callInviteListener = Voice.onCallInvite((callInvite) => {
    console.log('Incoming call from:', callInvite.getFrom());
    // Show UI for accepting/rejecting the call
  });
  
  // Listen for canceled calls
  const canceledCallInviteListener = Voice.onCancelledCallInvite(() => {
    console.log('Call was canceled');
    // Update UI
  });
  
  // Clean up listeners
  return () => {
    callInviteListener.remove();
    canceledCallInviteListener.remove();
  };
}, []);
```

## Troubleshooting

### Android Issues

1. **Firebase Messaging Service conflicts**: If you have another library that declares a Firebase Cloud Messaging Service, you may need to disable the one in this SDK.

   In your `app.json` or `app.config.js`:

   ```js
   {
     "plugins": [
       [
         "@twilio/voice-react-native-sdk",
         {
           "disableFirebaseMessagingService": true
         }
       ]
     ]
   }
   ```

2. **Gradle build issues**: If you encounter Gradle build issues related to task dependencies, try cleaning your project completely:

   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo clean
   npx expo prebuild --clean
   ```

   This fork includes special fixes for common Gradle task dependency issues. If you're using this fork and still encountering problems, please refer to the [PING_PONG.md](./PING_PONG.md) file for the latest fixes and workarounds.

### iOS Issues

1. **Missing permissions**: Ensure your app has the required permissions for microphone and push notifications.

2. **Push notification issues**: Make sure your VoIP Services certificate is valid and properly configured in your Twilio account.

## API Reference

### VoiceExpo

- `connect(accessToken: string): Promise<string | void>` - Make an outgoing call
- `disconnect(callSid: string): Promise<boolean | void>` - Disconnect an ongoing call
- `accept(callSid: string): Promise<boolean | void>` - Accept an incoming call
- `reject(callSid: string): Promise<boolean | void>` - Reject an incoming call
- `register(accessToken: string): Promise<boolean | void>` - Register for incoming calls
- `unregister(accessToken: string): Promise<boolean | void>` - Unregister from incoming calls

## Limitations

1. **Development limitations**: Some features may require testing on physical devices, especially push notifications.
2. **Expo Go limitations**: This SDK cannot work in Expo Go due to native code requirements. You must use development builds or EAS builds.

## Further Resources

- [Twilio Voice React Native SDK Documentation](https://www.twilio.com/docs/voice/client/react-native)
- [Expo Config Plugins Documentation](https://docs.expo.dev/guides/config-plugins/)
- [Original Expo Support Guide (Issue #496)](https://github.com/twilio/twilio-voice-react-native/issues/496)
- [Gradle Task Dependencies Documentation](https://docs.gradle.org/current/userguide/validation_problems.html#implicit_dependency) 