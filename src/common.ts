/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import * as ReactNative from 'react-native';
import NativeModuleWrapper from './expo/ExpoModule';

// Use the Expo module wrapper which handles both platforms
export const NativeModule = NativeModuleWrapper;
export const NativeEventEmitter = new ReactNative.NativeEventEmitter(
  NativeModuleWrapper
);
export const Platform = ReactNative.Platform;
