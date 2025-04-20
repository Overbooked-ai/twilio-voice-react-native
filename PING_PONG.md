# PING_PONG.md

## Update 4: Config Plugins Missing from Package

**Issue:**

After successfully installing the fork (post-dependency fixes), the `npx expo prebuild --clean` command fails because the config plugin files (`expo-config-plugin/ios.js` and `expo-config-plugin/android.js`) cannot be resolved within the installed package in `node_modules`.

```
PluginError: Failed to resolve plugin for module "node_modules/@twilio/voice-react-native-sdk/expo-config-plugin/ios.js" ...
```

**Analysis:**

The `files` array in the fork's `package.json` did not include the `expo-config-plugin` directory or the related root configuration files (`app.config.js`, `expo-module.config.json`). Therefore, these essential files were not included when the package was installed.

**Solution Implemented:**

I have updated the `files` array in the fork's `package.json` to include:
- `expo-config-plugin`
- `app.config.js`
- `expo-module.config.json`

This ensures these files are correctly packaged and available after installation.

**Next Steps for Developer:**

1.  **Pull Changes**: Get the *very latest* version of the code from the fork repository (`guyrosen/twilio-voice-react-native`), which includes the updated `package.json` (`files` array).
2.  **Re-install**: Clean slate install *again* to ensure the newly included files are present:
    ```bash
    # Example using pnpm
    rm -rf node_modules pnpm-lock.yaml
    pnpm install git+https://github.com/guyrosen/twilio-voice-react-native.git#main
    ```
3.  **Verify Installation**: Check `node_modules/@twilio/voice-react-native-sdk` to confirm the `expo-config-plugin` directory now exists.
4.  **Configure `app.config.js`**: Make sure your project's `app.config.js` (or `app.json`) correctly references the plugin paths within `node_modules` as shown in `EXPO_SUPPORT_SUMMARY.md`:
    ```javascript
    // In your project's app.config.js
    module.exports = {
      // ... other config
      plugins: [
        // ... other plugins
        './node_modules/@twilio/voice-react-native-sdk/expo-config-plugin/ios.js',
        './node_modules/@twilio/voice-react-native-sdk/expo-config-plugin/android.js'
      ]
    };
    ```
5.  **Rebuild**: Run prebuild again:
    ```bash
    npx expo prebuild --platform android --clean
    # or npx expo prebuild --platform ios --clean
    ```
    This step should now succeed as the plugins can be resolved.
6.  **Run & Test**: Build and run the app, then test the original `NullPointerException` fix:
    ```bash
    npx expo run:android
    # or npx expo run:ios
    ```

---

## Update 3: Build Failure Persists (Correcting Dependency)

**Issue:** Build failure during installation persisted due to TypeScript errors.
**Analysis:** Identified incorrect `expo-modules-core` version (`^2.2.3`) in `package.json`.
**Solution Implemented:** Corrected `expo-modules-core` version to `^1.11.0`.
**Result:** Installation succeeded, but prebuild failed due to missing plugin files.

---

## Update 2: Build Failure During Installation (Attempt 1: TypeScript Version)

**Issue:** Installation failed during `prepare` script (`bob build`) due to TypeScript errors.
**Analysis:** Assumed incompatibility between old TypeScript (`4.1.3`) and `expo-modules-core` types.
**Solution Attempted:** Updated `typescript` to `~4.9.5`.
**Result:** Failure persisted.

---

## Original: Twilio Voice SDK Integration Issue (Context - Fixed)

**Issue Description:** `NullPointerException` on `JSEventEmitter` during initialization.
**Root Cause Analysis (Fixed):** `JSEventEmitter` created but `ReactApplicationContext` not set before use.
**Solution Implemented (Fixed):** Modified `ExpoModule.kt` to set context during `OnCreate`.

### References
- [EXPO_SUPPORT_SUMMARY.md](./EXPO_SUPPORT_SUMMARY.md)
- [Twilio Voice React Native SDK Documentation](https://www.twilio.com/docs/voice/client/react-native)
- [Expo Config Plugins Documentation](https://docs.expo.dev/guides/config-plugins/)
- [Original Expo Support Guide (Issue #496)](https://github.com/twilio/twilio-voice-react-native/issues/496) 