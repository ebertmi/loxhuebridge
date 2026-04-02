import { LoxoneLight, LoxoneValue, HueEventData } from './loxone-light';
import { HuePayload, LightCapabilities } from '../../utils/light-converters/types';
import { hsvToPayload, tempToPayload, rgbToPayload } from './payload-helpers';
import {
  detectLoxoneFormat,
  parseLoxoneHsv,
  parseLoxoneTemp,
  parseSmartActuator,
  parseRGB
} from '../../utils/light-converters/parsers';
import { xyToLoxoneHsv, mirekToLoxoneTemp } from '../../utils/color';

/** RGBW Loxone ColorPickerV2 (pickerType = "Lumitech").
 *  Supports both full color (hsv) and white-spectrum (temp) modes. */
export class LumitechLight extends LoxoneLight {
  constructor(private capabilities?: LightCapabilities) { super(); }

  toHue(value: LoxoneValue): HuePayload {
    const format = detectLoxoneFormat(value);

    if (format === 'hsv') {
      return hsvToPayload(parseLoxoneHsv(value as string)!, this.capabilities);
    }
    if (format === 'temp') {
      return tempToPayload(parseLoxoneTemp(value as string)!, this.capabilities);
    }
    if (format === 'numeric-smart-actuator') {
      const sa = parseSmartActuator(value as number)!;
      return tempToPayload({ val: sa.brightness, kelvin: sa.kelvin }, this.capabilities);
    }
    if (format === 'numeric-rgb') {
      return rgbToPayload(parseRGB(value as number)!, this.capabilities);
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
    if (data.color?.xy) {
      return xyToLoxoneHsv(data.color.xy.x, data.color.xy.y, brightness);
    }
    if (data.color_temperature?.mirek) {
      return mirekToLoxoneTemp(data.color_temperature.mirek, brightness);
    }
    return Math.round(Math.max(0, Math.min(100, brightness)));
  }

  needsStatePrefetch(data: HueEventData): boolean {
    return !data.color?.xy && !data.color_temperature?.mirek
      && (data.dimming !== undefined || data.on !== undefined);
  }
}
