const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
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
      
      // Check if permission already exists
      const exists = config.modResults.manifest['uses-permission'].some(
        p => p.$['android:name'] === permission
      );
      
      if (!exists) {
        config.modResults.manifest['uses-permission'].push({
          $: {
            'android:name': permission
          }
        });
      }
    });

    // Add required services
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    // Check if service already exists
    const serviceExists = mainApplication.service.some(
      s => s.$['android:name'] === 'com.twiliovoicereactnative.VoiceFirebaseMessagingService'
    );
    
    if (!serviceExists) {
      mainApplication.service.push({
        $: {
          'android:name': 'com.twiliovoicereactnative.VoiceFirebaseMessagingService',
          'android:exported': 'false'
        }
      });
    }

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
          // Add the classpath dependency if not present
          if (!buildGradleContent.includes('com.google.gms:google-services:')) {
            const buildScriptIndex = buildGradleContent.indexOf('buildscript {');
            if (buildScriptIndex !== -1) {
              const dependenciesBlock = buildGradleContent.indexOf('dependencies {', buildScriptIndex);
              if (dependenciesBlock !== -1) {
                const closeBracketIndex = buildGradleContent.indexOf('}', dependenciesBlock);
                if (closeBracketIndex !== -1) {
                  const insertion = '        classpath "com.google.gms:google-services:4.3.15"\n';
                  buildGradleContent = 
                    buildGradleContent.slice(0, closeBracketIndex) + 
                    insertion + 
                    buildGradleContent.slice(closeBracketIndex);
                }
              }
            }
          }
          
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

module.exports = withTwilioVoiceAndroid; 