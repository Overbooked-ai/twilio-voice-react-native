import type { Constants } from '../constants';
import type { AudioDevice } from '../AudioDevice';

export interface NativeAudioDeviceInfo {
  uuid: string;
  type: AudioDevice.Type;
  name: string;
}

export interface NativeAudioDevicesInfo {
  selectedDevice?: NativeAudioDeviceInfo;
  audioDevices: NativeAudioDeviceInfo[];
}

export interface NativeAudioDevicesUpdatedEvent extends NativeAudioDevicesInfo {
  type: Constants.VoiceEventAudioDevicesUpdated;
}
