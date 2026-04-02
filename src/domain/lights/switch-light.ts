import { LoxoneLight, LoxoneValue, HueEventData } from './loxone-light';
import { HuePayload } from '../../utils/light-converters/types';

export class SwitchLight extends LoxoneLight {
  toHue(value: LoxoneValue): HuePayload {
    const n = typeof value === 'number' ? value : parseInt(String(value), 10);
    return { on: { on: n !== 0 } };
  }

  fromHue(data: HueEventData): LoxoneValue {
    return data.on?.on ? 100 : 0;
  }
}
