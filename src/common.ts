/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import * as ReactNative from 'react-native';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type/NativeModule';
import NativeModuleWrapper from './expo/ExpoModule';

const SelectedNativeModule =
  ReactNative.Platform.OS === 'android'
    ? NativeModuleWrapper
    : (ReactNative.NativeModules
        .TwilioVoiceReactNative as TwilioVoiceReactNativeType);

export const NativeModule = SelectedNativeModule;
export const NativeEventEmitter = new ReactNative.NativeEventEmitter(
  SelectedNativeModule
);
export const Platform = ReactNative.Platform;
