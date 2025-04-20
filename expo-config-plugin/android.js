const {
  withAndroidManifest,
  withProjectBuildGradle,
  withAppBuildGradle,
  withMainApplication,
  AndroidConfig,
} = require('@expo/config-plugins');
const { resolve } = require('path');
const fs = require('fs');

const {
  addPermission,
  getMainApplicationOrThrow,
} = AndroidConfig.Manifest;

/**
 * Adds the required permissions to the Android Manifest
 * @param {Object} config - The Expo configuration object
 * @returns {Object} The modified configuration object
 */
const withAndroidPermissions = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const mainApplication = getMainApplicationOrThrow(androidManifest);

    // Add required permissions
    const permissions = [
      'android.permission.INTERNET',
      'android.permission.RECORD_AUDIO',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_WIFI_STATE',
    ];

    permissions.forEach((permission) => {
      addPermission(androidManifest, permission);
    });

    return config;
  });
};

/**
 * Adds Firebase dependencies to the Android project
 * @param {Object} config - The Expo configuration object
 * @returns {Object} The modified configuration object
 */
const withFirebaseDependency = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('google-services')) {
      return config;
    }

    const buildScript = config.modResults.contents;
    const googleServicesVersion = '4.4.0'; // Use a recent stable version

    // Add Google Services plugin to buildscript dependencies
    const modifiedBuildScript = buildScript.replace(
      /dependencies\s*{/,
      `dependencies {
        classpath 'com.google.gms:google-services:${googleServicesVersion}'`
    );

    config.modResults.contents = modifiedBuildScript;

    return config;
  });
};

/**
 * Adds Google Services plugin to the app-level build.gradle
 * @param {Object} config - The Expo configuration object
 * @returns {Object} The modified configuration object
 */
const withGoogleServicesPlugin = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes("apply plugin: 'com.google.gms.google-services'")) {
      return config;
    }

    const appBuildGradle = config.modResults.contents;
    const modifiedAppBuildGradle = appBuildGradle.replace(
      /apply plugin: "com.android.application"/,
      `apply plugin: "com.android.application"
apply plugin: 'com.google.gms.google-services'`
    );

    config.modResults.contents = modifiedAppBuildGradle;

    return config;
  });
};

/**
 * Copies the google-services.json file to the android/app directory if it exists
 * @param {Object} config - The Expo configuration object
 * @returns {Object} The modified configuration object
 */
const withGoogleServicesJson = (config) => {
  const projectRoot = config._internal?.projectRoot || process.cwd();
  const sourceGoogleServicesPath = resolve(projectRoot, 'google-services.json');
  const targetGoogleServicesPath = resolve(projectRoot, 'android/app/google-services.json');

  if (fs.existsSync(sourceGoogleServicesPath) && !fs.existsSync(targetGoogleServicesPath)) {
    // Create the android/app directory if it doesn't exist
    const androidAppDir = resolve(projectRoot, 'android/app');
    if (!fs.existsSync(androidAppDir)) {
      fs.mkdirSync(androidAppDir, { recursive: true });
    }

    // Copy the google-services.json file
    fs.copyFileSync(sourceGoogleServicesPath, targetGoogleServicesPath);
  }

  return config;
};

/**
 * Disables/enables the built-in Firebase Cloud Messaging listener
 * @param {Object} config - The Expo configuration object
 * @param {boolean} enabled - Whether to enable the FCM listener
 * @returns {Object} The modified configuration object
 */
const withFcmListenerConfig = (config, enabled = true) => {
  return withMainApplication(config, (config) => {
    const mainApplication = config.modResults;

    // Set the FCM enabled flag in the class initialization
    const fcmConfigLine = `        // Set Twilio Voice FCM listener configuration
        Bundle bundle = new Bundle();
        bundle.putBoolean("twiliovoicereactnative_firebasemessagingservice_enabled", ${enabled});
        getApplicationContext().getResources().updateConfiguration(
            getApplicationContext().getResources().getConfiguration(),
            bundle
        );`;

    if (!mainApplication.includes('twiliovoicereactnative_firebasemessagingservice_enabled')) {
      const modifiedMainApplication = mainApplication.replace(
        /public void onCreate\(\) {/,
        `public void onCreate() {
${fcmConfigLine}`
      );

      config.modResults = modifiedMainApplication;
    }

    return config;
  });
};

/**
 * Main config plugin for Twilio Voice on Android
 * @param {Object} config - The Expo configuration object
 * @returns {Object} The modified configuration object
 */
const withTwilioVoiceAndroid = (config) => {
  config = withAndroidPermissions(config);
  config = withFirebaseDependency(config);
  config = withGoogleServicesPlugin(config);
  config = withGoogleServicesJson(config);
  
  // By default, enable the FCM listener
  // Users can disable it in their app.config.js if needed
  const fcmListenerEnabled = config.expo?.twilio?.fcmListenerEnabled ?? true;
  config = withFcmListenerConfig(config, fcmListenerEnabled);

  return config;
};

module.exports = withTwilioVoiceAndroid; 