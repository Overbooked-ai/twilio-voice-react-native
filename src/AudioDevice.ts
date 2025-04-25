import { EventEmitter } from 'eventemitter3';
import { NativeModule } from './common';
import { TwilioError } from './error';
import type { NativeAudioDeviceInfo } from './type/AudioDevice';
import type { Uuid } from './type/common';

/**
 * Describes audio devices as reported by the native layer and allows the
 * native selection of the described audio device.
 */
export class AudioDevice extends EventEmitter {
  private _uuid: Uuid;
  private _type: AudioDevice.Type;
  private _name: string;

  constructor({ uuid, type, name }: NativeAudioDeviceInfo) {
    super();
    this._uuid = uuid;
    this._type = type as AudioDevice.Type;
    this._name = name;
  }

  get uuid(): Uuid {
    return this._uuid;
  }

  get type(): AudioDevice.Type {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  /**
   * Calling this method will select this audio device as the active audio device.
   */
  async select(): Promise<void> {
    try {
      await NativeModule.voice_selectAudioDevice(this._uuid);
    } catch (error) {
      if (error instanceof Error) {
        throw new TwilioError(error.message, 0);
      }
      throw new TwilioError('Unknown error', 0);
    }
  }
}

/**
 * Contains interfaces and enumerations associated with audio devices.
 */
export namespace AudioDevice {
  /**
   * Audio device type enumeration. Describes all possible audio device types as
   * reportable by the native layer.
   */
  export enum Type {
    Earpiece = 'earpiece',
    Speaker = 'speaker',
    Bluetooth = 'bluetooth',
    WiredHeadset = 'wired_headset',
  }
}
