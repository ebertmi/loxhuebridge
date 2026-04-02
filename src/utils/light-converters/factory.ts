/**
 * Light Converter Factory
 * Thin adapter over the LoxoneLight domain classes.
 * Kept for backward compatibility with existing call sites.
 */

import {
  LightContext,
  LoxoneToHueConverter,
  HueToLoxoneConverter,
  LightType,
  PickerSubtype
} from './types';

import { createLight } from '../../domain/lights';

export class LightConverterFactory {
  static getLoxoneToHueConverter(context: LightContext): LoxoneToHueConverter {
    const light = createLight(context.lightType, { pickerType: context.pickerSubtype }, context.capabilities);
    return (value) => light.toHue(value);
  }

  static getHueToLoxoneConverter(context: LightContext): HueToLoxoneConverter {
    const light = createLight(context.lightType, { pickerType: context.pickerSubtype }, context.capabilities);
    return (hueData) => light.fromHue(hueData);
  }

  static inferContextFromLoxone(
    controlType: string,
    controlDetails?: Record<string, any>
  ): Partial<LightContext> {
    const lightType = controlType as LightType;
    let pickerSubtype: PickerSubtype | undefined;

    if (controlType === 'ColorPickerV2' && controlDetails?.pickerType) {
      pickerSubtype = controlDetails.pickerType as PickerSubtype;
    }

    return { lightType, pickerSubtype };
  }

  static createContext(
    controlType: string,
    controlDetails: Record<string, any> | undefined,
    hueCapabilities: any,
    hueUuid: string
  ): LightContext {
    const base = this.inferContextFromLoxone(controlType, controlDetails);
    return {
      lightType: base.lightType!,
      pickerSubtype: base.pickerSubtype,
      capabilities: hueCapabilities,
      hueUuid
    };
  }
}
