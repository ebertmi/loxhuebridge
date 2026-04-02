export { LoxoneLight, LoxoneValue, HueEventData } from './loxone-light';
export { SwitchLight } from './switch-light';
export { DimmerLight } from './dimmer-light';
export { RgbLight } from './rgb-light';
export { TunableWhiteLight } from './tunable-white-light';
export { LumitechLight } from './lumitech-light';

import { LoxoneLight } from './loxone-light';
import { LightCapabilities } from '../../utils/light-converters/types';
import { SwitchLight } from './switch-light';
import { DimmerLight } from './dimmer-light';
import { RgbLight } from './rgb-light';
import { TunableWhiteLight } from './tunable-white-light';
import { LumitechLight } from './lumitech-light';

/**
 * Factory: create the right LoxoneLight subclass for a given Loxone control type.
 *
 * @param controlType  Value of `control.type` from the Loxone structure file
 * @param details      Value of `control.details` (contains `pickerType` for ColorPickerV2)
 * @param capabilities Hue-side capabilities (color/CT support, mirek range)
 */
export function createLight(
  controlType: string,
  details?: Record<string, any>,
  capabilities?: LightCapabilities
): LoxoneLight {
  switch (controlType) {
    case 'Switch':
      return new SwitchLight();
    case 'Dimmer':
      return new DimmerLight();
    case 'ColorPickerV2': {
      switch (details?.pickerType) {
        case 'TunableWhite': return new TunableWhiteLight(capabilities);
        case 'Lumitech':     return new LumitechLight(capabilities);
        default:             return new RgbLight(capabilities);
      }
    }
    default:
      return new DimmerLight();
  }
}
