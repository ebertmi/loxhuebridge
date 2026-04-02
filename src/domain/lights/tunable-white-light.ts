import { LoxoneLight, LoxoneValue, HueEventData } from './loxone-light';
import { HuePayload, LightCapabilities } from '../../utils/light-converters/types';
import { tempToPayload } from './payload-helpers';
import {
  detectLoxoneFormat,
  parseLoxoneTemp,
  parseSmartActuator
} from '../../utils/light-converters/parsers';
import { mirekToLoxoneTemp } from '../../utils/color';

/** White-spectrum Loxone ColorPickerV2 (pickerType = "TunableWhite").
 *  Also handles the Smart Actuator numeric wire format (20BBBKKKK). */
export class TunableWhiteLight extends LoxoneLight {
  constructor(private capabilities?: LightCapabilities) { super(); }

  toHue(value: LoxoneValue): HuePayload {
    const format = detectLoxoneFormat(value);

    if (format === 'temp') {
      return tempToPayload(parseLoxoneTemp(value as string)!, this.capabilities);
    }
    if (format === 'numeric-smart-actuator') {
      const sa = parseSmartActuator(value as number)!;
      return tempToPayload({ val: sa.brightness, kelvin: sa.kelvin }, this.capabilities);
    }

    // Fallback: treat as dimmer value
    const brightness = Math.max(0, Math.min(100,
      typeof value === 'number' ? value : parseInt(String(value), 10)
    ));
    if (brightness === 0) return { on: { on: false } };
    return { on: { on: true }, dimming: { brightness } };
  }

  fromHue(data: HueEventData): LoxoneValue {
    const brightness = data.dimming?.brightness ?? (data.on?.on ? 100 : 0);
    if (data.color_temperature?.mirek) {
      return mirekToLoxoneTemp(data.color_temperature.mirek, brightness);
    }
    return Math.round(Math.max(0, Math.min(100, brightness)));
  }
}
