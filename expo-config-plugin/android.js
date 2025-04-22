const {
  withAndroidManifest,
  withAppBuildGradle,
  withProjectBuildGradle,
  withStringsXml,
  createRunOncePlugin,
  WarningAggregator,
} = require('@expo/config-plugins');
const { copyFileSync, existsSync } = require('fs');
const { join } = require('path');

const RECORD_AUDIO = 'android.permission.RECORD_AUDIO';
const MODIFY_AUDIO_SETTINGS = 'android.permission.MODIFY_AUDIO_SETTINGS';
const ACCESS_NETWORK_STATE = 'android.permission.ACCESS_NETWORK_STATE';
const WAKE_LOCK = 'android.permission.WAKE_LOCK';
const BLUETOOTH = 'android.permission.BLUETOOTH';
const BLUETOOTH_CONNECT = 'android.permission.BLUETOOTH_CONNECT';

// Prop to optionally disable built-in FCM listener
const FCM_ENABLED_PROP = 'disableTwilioFCMListener';
const GOOGLE_SERVICES_FILE_PROP = 'googleServicesFile';

const withTwilioVoiceAndroid = (baseConfig, props = {}) => {
  // 1. AndroidManifest.xml modifications
  let modifiedConfig = withAndroidManifest(
    baseConfig,
    async (manifestConfig) => {
      const androidManifest = manifestConfig.modResults.manifest;

      // Add required permissions
      const permissions = [
        RECORD_AUDIO,
        MODIFY_AUDIO_SETTINGS,
        ACCESS_NETWORK_STATE,
        WAKE_LOCK,
        BLUETOOTH,
        BLUETOOTH_CONNECT,
      ];

      if (!Array.isArray(androidManifest['uses-permission'])) {
        androidManifest['uses-permission'] = [];
      }
      const existingPermissions = androidManifest['uses-permission'].map(
        (p) => p?.$['android:name']
      );

      permissions.forEach((permission) => {
        if (!existingPermissions.includes(permission)) {
          androidManifest['uses-permission'].push({
            $: { 'android:name': permission },
          });
          console.log(
            `TwilioVoiceReactNative: Added permission ${permission} to AndroidManifest.xml`
          );
        }
      });

      return manifestConfig;
    }
  );

  // 2. Project build.gradle (root)
  modifiedConfig = withProjectBuildGradle(modifiedConfig, (gradleConfig) => {
    const buildGradle = gradleConfig.modResults;
    const googleServicesVersion = props.googleServicesVersion || '4.3.15';
    const googleServicesClassPath = `com.google.gms:google-services:${googleServicesVersion}`;
    const kotlinVersion = props.kotlinVersion || '1.9.24';
    const kotlinClassPath = `org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}`;

    if (!buildGradle.contents.includes(googleServicesClassPath)) {
      buildGradle.contents = buildGradle.contents.replace(
        /dependencies\s*\{/,
        `dependencies {
        classpath "${googleServicesClassPath}"`
      );
      console.log(
        `TwilioVoiceReactNative: Added google-services classpath ${googleServicesClassPath} to project build.gradle`
      );
    } else {
      console.log(
        `TwilioVoiceReactNative: Found google-services classpath in project build.gradle`
      );
    }

    if (!buildGradle.contents.includes(kotlinClassPath)) {
      buildGradle.contents = buildGradle.contents.replace(
        /dependencies\s*\{/,
        `dependencies {
        classpath "${kotlinClassPath}"`
      );
      console.log(
        `TwilioVoiceReactNative: Added Kotlin classpath ${kotlinClassPath} to project build.gradle`
      );
    }

    return gradleConfig;
  });

  // 3. App build.gradle
  modifiedConfig = withAppBuildGradle(modifiedConfig, (appGradleConfig) => {
    const buildGradle = appGradleConfig.modResults;
    const googleServicesPlugin = 'com.google.gms.google-services';
    const kotlinPlugin = 'kotlin-android';

    if (
      !buildGradle.contents.includes(`apply plugin: '${googleServicesPlugin}'`)
    ) {
      buildGradle.contents += `\napply plugin: '${googleServicesPlugin}'`;
      console.log(
        `TwilioVoiceReactNative: Applied google-services plugin in app build.gradle`
      );
    }
    if (!buildGradle.contents.includes(`apply plugin: '${kotlinPlugin}'`)) {
      buildGradle.contents = buildGradle.contents.replace(
        /(apply\s+plugin:\s+['"]com\.android\.application['"])/,
        `$1\napply plugin: '${kotlinPlugin}'`
      );
      console.log(
        `TwilioVoiceReactNative: Applied kotlin-android plugin in app build.gradle`
      );
    }

    return appGradleConfig;
  });

  // 4. Handle FCM listener configuration (config.xml)
  modifiedConfig = withStringsXml(modifiedConfig, (stringsConfig) => {
    const stringsXml = stringsConfig.modResults;
    const key = 'twiliovoicereactnative_firebasemessagingservice_enabled';
    let enabled = true;

    if (
      props.hasOwnProperty(FCM_ENABLED_PROP) &&
      props[FCM_ENABLED_PROP] === true
    ) {
      enabled = false;
    }

    let boolElement = stringsXml.resources.bool?.find(
      (item) => item.$.name === key
    );
    if (boolElement) {
      boolElement._ = String(enabled);
    } else {
      if (!stringsXml.resources.bool) {
        stringsXml.resources.bool = [];
      }
      stringsXml.resources.bool.push({ $: { name: key }, _: String(enabled) });
    }
    console.log(
      `TwilioVoiceReactNative: Set ${key} to ${enabled} in strings.xml`
    );

    return stringsConfig;
  });

  // 5. Copy google-services.json if specified
  const googleServicesFile = props[GOOGLE_SERVICES_FILE_PROP];
  if (googleServicesFile && typeof googleServicesFile === 'string') {
    const sourcePath = join(
      modifiedConfig.modRequest.projectRoot,
      googleServicesFile
    );
    if (existsSync(sourcePath)) {
      const destinationPath = join(
        modifiedConfig.modRequest.platformProjectRoot,
        'app',
        'google-services.json'
      );
      try {
        copyFileSync(sourcePath, destinationPath);
        console.log(
          `TwilioVoiceReactNative: Copied ${googleServicesFile} to android/app/google-services.json`
        );
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

  return modifiedConfig;
};

module.exports = createRunOncePlugin(
  withTwilioVoiceAndroid,
  'twilio-voice-react-native-expo-android',
  '1.0.0'
);
