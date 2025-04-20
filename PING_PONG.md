# PING_PONG.md

## Update 3: Build Failure Persists (Correcting Dependency)

**Issue:**

Despite updating TypeScript to `~4.9.5`, the build failure during package installation (`pnpm install ...`) persists. The `bob build` step still fails with TypeScript errors related to `expo-modules-core/build/registerWebModule.d.ts`.

**Error Log Snippet:**

```
node_modules/expo-modules-core/build/registerWebModule.d.ts:7:121 - error TS1005: ',' expected.
...
Found 6 errors in the same file...
✖ Failed to build definition files.
```

**Analysis (Updated):**

The persistence of the error suggests the previous hypothesis was incomplete. While the TypeScript version *might* have been a factor, the root cause appears to be an **incorrect version specified for the `expo-modules-core` dependency** itself.

- The fork's `package.json` listed `expo-modules-core: ^2.2.3`.
- Public releases of `expo-modules-core` are in the `1.x` range (e.g., `1.11.x`). The `2.2.3` version likely does not exist or is not standard, potentially causing installation or build tools to fetch incorrect/incompatible type definitions.

**Solution Implemented:**

I have corrected the `expo-modules-core` version in the fork's `package.json` (dependencies section) to a known stable version: `^1.11.0`. The `typescript` dependency remains at `~4.9.5`.

**Next Steps for Developer:**

1.  **Pull Changes**: Get the *latest* version of the code from the fork repository (`guyrosen/twilio-voice-react-native`), which now includes the corrected `expo-modules-core` version in `package.json`.
2.  **Re-attempt Installation**: Clean slate install again. Remove `node_modules` and any lock files (`pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`) in your project, and then try installing the fork:
    ```bash
    # Example using pnpm
    rm -rf node_modules pnpm-lock.yaml
    pnpm install git+https://github.com/guyrosen/twilio-voice-react-native.git#main
    # or using yarn
    # rm -rf node_modules yarn.lock
    # yarn add git+https://github.com/guyrosen/twilio-voice-react-native.git#main
    ```
    The `prepare` script (running `bob build`) should now hopefully succeed using the correct dependency types and the compatible TypeScript version.
3.  **Rebuild**: If the installation succeeds, proceed with rebuilding the native code:
    ```bash
    npx expo prebuild --platform android --clean
    npx expo run:android
    ```
4.  **Test**: Verify installation, build, and the original `NullPointerException` fix.

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