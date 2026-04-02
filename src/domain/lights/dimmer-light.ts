import { LoxoneLight, LoxoneValue, HueEventData } from './loxone-light';
import { HuePayload } from '../../utils/light-converters/types';

export class DimmerLight extends LoxoneLight {
  toHue(value: LoxoneValue): HuePayload {
    const brightness = Math.max(0, Math.min(100,
      typeof value === 'number' ? value : parseInt(String(value), 10)
    ));
    if (brightness === 0) return { on: { on: false } };
    return { on: { on: true }, dimming: { brightness } };
  }

  fromHue(data: HueEventData): LoxoneValue {
    const brightness = data.dimming?.brightness ?? (data.on?.on ? 100 : 0);
    return Math.round(Math.max(0, Math.min(100, brightness)));
  }
}
