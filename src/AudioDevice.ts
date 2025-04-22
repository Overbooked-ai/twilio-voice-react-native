import { EventEmitter } from 'eventemitter3';
import { NativeModule } from './common';
import { TwilioError } from './error/TwilioError';
import type { NativeAudioDeviceInfo } from './type/AudioDevice';
import type { Uuid, NativeAudioDeviceType } from './type/common';

export enum Type {
  Earpiece = 'earpiece',
  Speaker = 'speaker',
  Bluetooth = 'bluetooth',
  WiredHeadset = 'wired_headset',
}

export class AudioDevice extends EventEmitter {
  private _uuid: Uuid;
  private _type: NativeAudioDeviceType;
  private _name: string;

  constructor({ uuid, type, name }: NativeAudioDeviceInfo) {
    super();
    this._uuid = uuid;
    this._type = type;
    this._name = name;
  }

  get uuid(): Uuid {
    return this._uuid;
  }

  get type(): NativeAudioDeviceType {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

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
