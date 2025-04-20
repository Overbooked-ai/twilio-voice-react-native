const { withPlugins, withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withTwilioVoiceAndroid = (config) => {
  // Add required permissions to AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    
    // Add required permissions
    const permissions = [
      'android.permission.INTERNET',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.WAKE_LOCK',
      'android.permission.FOREGROUND_SERVICE'
    ];

    permissions.forEach(permission => {
      if (!config.modResults.manifest['uses-permission']) {
        config.modResults.manifest['uses-permission'] = [];
      }
      config.modResults.manifest['uses-permission'].push({
        $: {
          'android:name': permission
        }
      });
    });

    // Add required services
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    mainApplication.service.push({
      $: {
        'android:name': 'com.twilio.voice.VoiceFirebaseMessagingService',
        'android:exported': 'false'
      }
    });

    return config;
  });

  // Add Google Services Plugin to build.gradle
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const buildGradlePath = path.join(config.modRequest.platformProjectRoot, 'build.gradle');
      
      if (fs.existsSync(buildGradlePath)) {
        let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
        
        // Check if Google Services Plugin is already applied
        if (!buildGradleContent.includes('apply plugin: \'com.google.gms.google-services\'')) {
          // Add Google Services Plugin
          buildGradleContent = buildGradleContent.replace(
            /apply plugin: ['"]com\.android\.application['"]/,
            'apply plugin: \'com.android.application\'\napply plugin: \'com.google.gms.google-services\''
          );
          
          fs.writeFileSync(buildGradlePath, buildGradleContent);
        }
      }
      
      return config;
    }
  ]);

  // Copy google-services.json if it exists
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const googleServicesPath = path.join(config.modRequest.projectRoot, 'google-services.json');
      const targetPath = path.join(config.modRequest.platformProjectRoot, 'app', 'google-services.json');
      
      if (fs.existsSync(googleServicesPath)) {
        // Create app directory if it doesn't exist
        const appDir = path.dirname(targetPath);
        if (!fs.existsSync(appDir)) {
          fs.mkdirSync(appDir, { recursive: true });
        }
        
        // Copy google-services.json
        fs.copyFileSync(googleServicesPath, targetPath);
      }
      
      return config;
    }
  ]);

  return config;
};

module.exports = withPlugins; 