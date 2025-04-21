const { withAndroidManifest, withAppBuildGradle, withProjectBuildGradle, withStringsXml, createRunOncePlugin, WarningAggregator } = require('@expo/config-plugins');
const { Paths } = require('@expo/config-plugins/build/android');
const { copyFileSync, existsSync } = require('fs');
const { join } = require('path');

const RECORD_AUDIO = 'android.permission.RECORD_AUDIO';
const READ_PHONE_STATE = 'android.permission.READ_PHONE_STATE'; // Potentially needed?
const CALL_PHONE = 'android.permission.CALL_PHONE'; // For outgoing calls
const MODIFY_AUDIO_SETTINGS = 'android.permission.MODIFY_AUDIO_SETTINGS';
const ACCESS_NETWORK_STATE = 'android.permission.ACCESS_NETWORK_STATE';
const WAKE_LOCK = 'android.permission.WAKE_LOCK';
const BLUETOOTH = 'android.permission.BLUETOOTH'; // For Bluetooth audio routing
const BLUETOOTH_CONNECT = 'android.permission.BLUETOOTH_CONNECT'; // Android 12+

// Prop to optionally disable built-in FCM listener
const FCM_ENABLED_PROP = 'disableTwilioFCMListener';
const GOOGLE_SERVICES_FILE_PROP = 'googleServicesFile';

const withTwilioVoiceAndroid = (config, props = {}) => {

  // 1. AndroidManifest.xml modifications
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Add required permissions
    const permissions = [
      RECORD_AUDIO,
      MODIFY_AUDIO_SETTINGS,
      ACCESS_NETWORK_STATE,
      WAKE_LOCK,
      BLUETOOTH,
      // Conditionally add BLUETOOTH_CONNECT for SDK 31+
      // This requires checking targetSdkVersion or using a helper
      // For simplicity, add it; Expo handles minSdkVersion checks
      BLUETOOTH_CONNECT,
      // READ_PHONE_STATE, // Consider if necessary
      // CALL_PHONE,       // Consider if necessary
    ];

    if (!Array.isArray(androidManifest["uses-permission"])) {
      androidManifest["uses-permission"] = [];
    }
    const existingPermissions = androidManifest["uses-permission"].map(p => p?.$['android:name']);

    permissions.forEach((permission) => {
      if (!existingPermissions.includes(permission)) {
        androidManifest["uses-permission"].push({
          $: { 'android:name': permission },
        });
        console.log(`TwilioVoiceReactNative: Added permission ${permission} to AndroidManifest.xml`);
      }
    });
    
    // Add other manifest elements if needed (e.g., services, receivers)
    // Check Twilio Android SDK setup guide for specifics

    return config;
  });

  // 2. Project build.gradle (root)
  // Ensure google-services plugin classpath is present if needed
  config = withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults;
    const googleServicesVersion = props.googleServicesVersion || '4.3.15'; // Example default
    const googleServicesClassPath = `com.google.gms:google-services:${googleServicesVersion}`;
    const kotlinVersion = props.kotlinVersion || '1.9.24'; // Match build.gradle
    const kotlinClassPath = `org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}`;

    if (!buildGradle.contents.includes(googleServicesClassPath)) {
        buildGradle.contents = buildGradle.contents.replace(
            /dependencies\s*\{/,
            `dependencies {
        classpath "${googleServicesClassPath}"` // Use double quotes for consistency
        );
        console.log(`TwilioVoiceReactNative: Added google-services classpath ${googleServicesClassPath} to project build.gradle`);
    } else {
        console.log(`TwilioVoiceReactNative: Found google-services classpath in project build.gradle`);
    }
    
    // Ensure Kotlin classpath (needed by our module)
    if (!buildGradle.contents.includes(kotlinClassPath)) {
         buildGradle.contents = buildGradle.contents.replace(
            /dependencies\s*\{/,
            `dependencies {
        classpath "${kotlinClassPath}"` // Use double quotes
        );
        console.log(`TwilioVoiceReactNative: Added Kotlin classpath ${kotlinClassPath} to project build.gradle`);
    }

    return config;
  });

  // 3. App build.gradle
  // Apply google-services plugin and kotlin-android plugin
  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults;
    const googleServicesPlugin = 'com.google.gms.google-services';
    const kotlinPlugin = 'kotlin-android';

    if (!buildGradle.contents.includes(`apply plugin: '${googleServicesPlugin}'`)) {
        buildGradle.contents += `\napply plugin: '${googleServicesPlugin}'`;
        console.log(`TwilioVoiceReactNative: Applied google-services plugin in app build.gradle`);
    }
     if (!buildGradle.contents.includes(`apply plugin: '${kotlinPlugin}'`)) {
        // Apply after com.android.application
        buildGradle.contents = buildGradle.contents.replace(
          /(apply\s+plugin:\s+['"]com\.android\.application['"])/,
          `$1\napply plugin: '${kotlinPlugin}'`
        );
        console.log(`TwilioVoiceReactNative: Applied kotlin-android plugin in app build.gradle`);
    }

    return config;
  });
  
  // 4. Handle FCM listener configuration (config.xml)
  config = withStringsXml(config, (config) => {
    const stringsXml = config.modResults;
    const key = 'twiliovoicereactnative_firebasemessagingservice_enabled';
    let enabled = true;

    // Check if user wants to disable the listener via plugin props
    if (props.hasOwnProperty(FCM_ENABLED_PROP) && props[FCM_ENABLED_PROP] === true) {
        enabled = false;
    }

    // Find existing or add new bool resource
    let boolElement = stringsXml.resources.bool?.find(item => item.$.name === key);
    if (boolElement) {
        boolElement._ = String(enabled);
    } else {
        if (!stringsXml.resources.bool) {
            stringsXml.resources.bool = [];
        }
        stringsXml.resources.bool.push({ $: { name: key }, _: String(enabled) });
    }
    console.log(`TwilioVoiceReactNative: Set ${key} to ${enabled} in strings.xml`);

    return config;
  });

  // 5. Copy google-services.json if specified
  const googleServicesFile = props[GOOGLE_SERVICES_FILE_PROP];
  if (googleServicesFile && typeof googleServicesFile === 'string') {
      const sourcePath = join(config.modRequest.projectRoot, googleServicesFile);
      if (existsSync(sourcePath)) {
          const destinationPath = join(config.modRequest.platformProjectRoot, 'app', 'google-services.json');
          try {
              copyFileSync(sourcePath, destinationPath);
              console.log(`TwilioVoiceReactNative: Copied ${googleServicesFile} to android/app/google-services.json`);
          } catch (e) {
              WarningAggregator.addWarningAndroid(
                  'twilio-voice-react-native',
                  `Failed to copy google-services.json from ${sourcePath} to ${destinationPath}: ${e.message}`
              );
          }
      } else {
          WarningAggregator.addWarningAndroid(
              'twilio-voice-react-native',
              `Specified googleServicesFile path does not exist: ${sourcePath}`
          );
      }
  } else if (googleServicesFile) {
       WarningAggregator.addWarningAndroid(
          'twilio-voice-react-native',
          `Property 'googleServicesFile' should be a string path relative to project root.`
      );
  }

  return config;
};

module.exports = createRunOncePlugin(withTwilioVoiceAndroid, 'twilio-voice-react-native-expo-android', '1.0.0'); 