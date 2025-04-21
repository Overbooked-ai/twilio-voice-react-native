# Twilio Voice React Native SDK - Expo Integration

This document provides instructions for integrating the Twilio Voice React Native SDK in an Expo application.

## Installation

Install the Twilio Voice SDK in your Expo project:

```bash
npm install @twilio/voice-react-native-sdk
# or
yarn add @twilio/voice-react-native-sdk
```

## Configuration

### 1. Configure app.json / app.config.js

Add the Twilio Voice plugin to your Expo config:

```json
{
  "expo": {
    "plugins": [
      [
        "@twilio/voice-react-native-sdk",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for calls",
          "backgroundModes": ["audio", "voip"],
          "includeCallKit": true,
          "fcmListenerEnabled": true
        }
      ]
    ]
  }
}
```

Options:
- `microphonePermission`: Custom message for microphone permission prompt (iOS)
- `backgroundModes`: Background modes to enable (iOS)
- `includeCallKit`: Whether to enable CallKit integration (iOS)
- `fcmListenerEnabled`: Whether to use the built-in FCM listener for Twilio calls (Android)

### 2. Set up Firebase for Android Push Notifications

1. Create a Firebase project and download the `google-services.json` file
2. Place the file in your project root
3. The Expo config plugin will automatically configure Firebase for your app

## Usage

The SDK provides a unified `VoiceExpo` interface that works in both Expo and React Native environments:

```javascript
import { VoiceExpo } from '@twilio/voice-react-native-sdk';
```

### Making Outgoing Calls

```javascript
// Get an access token from your server
const accessToken = await fetchAccessToken();

// Make a call
try {
  const callSid = await VoiceExpo.connect(accessToken, { to: '+1234567890' }, 'My Display Name');
  console.log('Call connected with SID:', callSid);
} catch (error) {
  console.error('Call failed:', error);
}

// Mute the call
await VoiceExpo.mute(callSid, true);

// Enable speaker phone
await VoiceExpo.setSpeakerPhone(true);

// Send DTMF tones
await VoiceExpo.sendDigits(callSid, '1234#');

// End the call
await VoiceExpo.disconnect(callSid);
```

### Handling Incoming Calls

First, register for push notifications:

```javascript
// Register for push notifications
const accessToken = await fetchAccessToken();
let fcmToken = null;

// On Android, get the FCM token
if (Platform.OS === 'android') {
  fcmToken = await getFirebaseToken(); // Use your FCM token retrieval method
}

await VoiceExpo.register(accessToken, fcmToken);
```

Handle incoming push notifications:

```javascript
// In your push notification handler
function handlePushNotification(notification) {
  // Check if it's a Twilio Voice notification
  if (VoiceExpo.isTwilioNotification(notification.data)) {
    // Process the notification
    VoiceExpo.handleNotification(notification.data);
  }
}

// Accept an incoming call
function acceptCall(callSid) {
  await VoiceExpo.accept(callSid);
}

// Reject an incoming call
function rejectCall(callSid) {
  await VoiceExpo.reject(callSid);
}
```

## API Reference

### Call Management

| Method | Description |
|--------|-------------|
| `connect(accessToken, params, displayName)` | Make an outgoing call |
| `disconnect(callSid)` | End an active call |
| `mute(callSid, isMuted)` | Mute or unmute a call |
| `hold(callSid, onHold)` | Hold or resume a call |
| `sendDigits(callSid, digits)` | Send DTMF tones |
| `getCallState(callSid)` | Get the current state of a call |
| `accept(callSid)` | Accept an incoming call |
| `reject(callSid)` | Reject an incoming call |

### Push Notification Handling

| Method | Description |
|--------|-------------|
| `register(accessToken, fcmToken)` | Register for push notifications |
| `unregister(accessToken, fcmToken)` | Unregister from push notifications |
| `handleNotification(payload)` | Process an incoming push notification |
| `isTwilioNotification(payload)` | Check if a notification is from Twilio Voice |

### Audio Control

| Method | Description |
|--------|-------------|
| `setSpeakerPhone(enabled)` | Enable or disable speaker phone |

### Device Info

| Method | Description |
|--------|-------------|
| `getDeviceToken()` | Get the device token for push notifications |

## Troubleshooting

### Android Build Issues

If you encounter Android build issues related to task configuration, ensure you're using the latest version of the SDK. The build.gradle file has been specifically optimized for Expo's build system.

### Firebase Configuration

For Android, make sure:
1. Your `google-services.json` file is properly formatted and contains valid configuration
2. You've enabled FCM in your Firebase project

### iOS Push Notifications

For iOS, ensure:
1. You have a valid provisioning profile with Push Notification entitlements
2. You've configured the background modes in your Expo config
3. You're using a physical device for testing (PushKit doesn't work in simulators)

## Platform-Specific Considerations

### iOS

- Uses CallKit for call management
- Requires PushKit for handling VoIP push notifications
- Background modes are configured automatically

### Android

- Uses Firebase Cloud Messaging (FCM) for push notifications
- Audio focus management handled automatically
- Power saving optimizations disabled for better call quality

## Event Listeners

To listen for call events, use the standard Voice SDK event interface:

```javascript
import { Voice } from '@twilio/voice-react-native-sdk';

// Listen for incoming calls
Voice.on(Voice.Event.CallInvite, (callInvite) => {
  console.log('Incoming call from:', callInvite.from);
});

// Listen for call connects
Voice.on(Voice.Event.CallConnected, (call) => {
  console.log('Call connected:', call.getSid());
});

// Listen for call disconnects
Voice.on(Voice.Event.CallDisconnected, (call) => {
  console.log('Call disconnected:', call.getSid());
});
``` 