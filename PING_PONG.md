# Twilio Voice React Native - Expo Support Implementation

## Developer Communication Log

### Claude (Initial Message)
I'll be implementing Expo support for the Twilio Voice React Native SDK following the guide in issue #496. I'll document my progress, implementation decisions, and questions here.

My implementation plan:
1. Create iOS config plugin
2. Create Android config plugin
3. Implement Android Expo module, package, and lifecycle listeners
4. Modify Android build files
5. Create JS module for Expo support
6. Add Expo configuration files

I'll start the implementation now and keep you updated on progress.

### Claude (Implementation Complete)
I've completed the implementation of Expo support for Twilio Voice React Native. Here's a summary of the changes made:

#### 1. Config Plugins
- Created iOS config plugin (`expo-config-plugin/ios.js`) that adds required permissions and capabilities:
  - Background Modes (Audio, VoIP)
  - Push Notification entitlements
  - Microphone usage descriptions

- Created Android config plugin (`expo-config-plugin/android.js`) that:
  - Adds required permissions to AndroidManifest.xml
  - Configures Firebase dependencies
  - Copies google-services.json to the correct location
  - Provides configuration for FCM listener

#### 2. Android Native Implementation
- Created Kotlin-based ExpoModule (`android/src/main/java/com/twiliovoicereactnative/ExpoModule.kt`)
- Created Java-based ExpoPackage (`android/src/main/java/com/twiliovoicereactnative/ExpoPackage.java`)
- Added lifecycle listeners to hook into Android lifecycle events:
  - ExpoApplicationLifecycleListener.java
  - ExpoActivityLifecycleListener.java
- Modified Android build.gradle to add Kotlin support

#### 3. JavaScript Integration
- Created ExpoModule.ts to provide JS interface to native functionality
- Updated main index.ts to export the Expo module
- Created necessary Expo configuration files:
  - expo-module.config.json
  - app.config.js

### Setup Instructions for Developers

1. **Installation**
   In your Expo project, install the modified package:
   ```bash
   npm install github:YOUR_USERNAME/twilio-voice-react-native
   # or
   yarn add github:YOUR_USERNAME/twilio-voice-react-native
   ```

2. **Configuration**
   - Add the following to your app.json or app.config.js:
   ```js
   {
     "expo": {
       "plugins": [
         [
           "@twilio/voice-react-native-sdk",
           {
             "fcmListenerEnabled": true // Set to false if you have your own FCM listener
           }
         ]
       ]
     }
   }
   ```

3. **iOS Setup**
   - Ensure you have a valid provisioning profile with the PushKit and Voice over IP capabilities
   - Place your google-services.json in the root of your project for FCM to work

4. **Usage**
   ```typescript
   import { ExpoModule } from '@twilio/voice-react-native-sdk';

   // Example: Make an outgoing call
   const callUuid = await ExpoModule.connect('YOUR_ACCESS_TOKEN', { to: '+1234567890' }, 'Display Name');

   // Example: Register for push notifications
   await ExpoModule.register('YOUR_ACCESS_TOKEN', 'FCM_TOKEN');

   // Example: Handle a notification
   await ExpoModule.handleNotification(notificationPayload);
   ```

5. **Important Notes**
   - This implementation is platform-specific. On iOS, most methods use the React Native module, while on Android, they use the Expo module.
   - The FCM listener can be disabled through configuration if you have your own FCM handler.
   - For production use, test thoroughly on both platforms.

Let me know if you need any clarification or have questions about the implementation!
