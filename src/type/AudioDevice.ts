import type { Constants } from '../constants';
import type { NativeAudioDeviceType } from './common';

export interface NativeAudioDeviceInfo {
  uuid: string;
  type: NativeAudioDeviceType;
  name: string;
}

export interface NativeAudioDevicesInfo {
  selectedDevice?: NativeAudioDeviceInfo;
  audioDevices: NativeAudioDeviceInfo[];
}

export interface NativeAudioDevicesUpdatedEvent extends NativeAudioDevicesInfo {
  type: Constants.VoiceEventAudioDevicesUpdated;
}
