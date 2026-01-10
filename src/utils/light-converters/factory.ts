/**
 * Light Converter Factory
 * Factory pattern for creating type-specific converter functions
 */

import {
  LightContext,
  LoxoneToHueConverter,
  HueToLoxoneConverter,
  LightType,
  PickerSubtype
} from './types';

import { loxoneToHue } from './loxone-to-hue';
import { hueToLoxone } from './hue-to-loxone';

/**
 * Factory for creating light converter functions
 * Returns converter functions bound to specific light contexts
 */
export class LightConverterFactory {
  /**
   * Get a Loxone → Hue converter function
   * @param context - Light context with type, subtype, and capabilities
   * @returns Converter function bound to the context
   *
   * @example
   * const context = { lightType: 'ColorPickerV2', pickerSubtype: 'RGB' };
   * const converter = LightConverterFactory.getLoxoneToHueConverter(context);
   * const payload = converter('hsv(180,50,75)');
   */
  static getLoxoneToHueConverter(context: LightContext): LoxoneToHueConverter {
    return (value) => loxoneToHue(value, context);
  }

  /**
   * Get a Hue → Loxone converter function
   * @param context - Light context with type, subtype, and capabilities
   * @returns Converter function bound to the context
   *
   * @example
   * const context = { lightType: 'ColorPickerV2', pickerSubtype: 'Lumitech' };
   * const converter = LightConverterFactory.getHueToLoxoneConverter(context);
   * const value = converter({ color: { xy: { x: 0.5, y: 0.5 } }, dimming: { brightness: 75 } });
   */
  static getHueToLoxoneConverter(context: LightContext): HueToLoxoneConverter {
    return (hueData) => hueToLoxone(hueData, context);
  }

  /**
   * Infer light context from Loxone control information
   * Extracts light type and picker subtype from control metadata
   *
   * @param controlType - Loxone control type (e.g., 'Switch', 'Dimmer', 'ColorPickerV2')
   * @param controlDetails - Optional control details containing pickerType
   * @returns Partial light context (caller should add capabilities)
   *
   * @example
   * const context = LightConverterFactory.inferContextFromLoxone('ColorPickerV2', { pickerType: 'Lumitech' });
   * // Returns: { lightType: 'ColorPickerV2', pickerSubtype: 'Lumitech' }
   */
  static inferContextFromLoxone(
    controlType: string,
    controlDetails?: Record<string, any>
  ): Partial<LightContext> {
    const lightType = controlType as LightType;
    let pickerSubtype: PickerSubtype | undefined;

    // Extract picker subtype for ColorPickerV2 controls
    if (controlType === 'ColorPickerV2' && controlDetails?.pickerType) {
      pickerSubtype = controlDetails.pickerType as PickerSubtype;
    }

    return { lightType, pickerSubtype };
  }

  /**
   * Create a complete light context from Loxone control info and Hue capabilities
   * Combines control metadata with light capabilities for full conversion context
   *
   * @param controlType - Loxone control type
   * @param controlDetails - Optional control details
   * @param hueCapabilities - Hue light capabilities (color/temperature support)
   * @param hueUuid - Hue light UUID
   * @returns Complete light context
   *
   * @example
   * const context = LightConverterFactory.createContext(
   *   'ColorPickerV2',
   *   { pickerType: 'RGB' },
   *   { supportsColor: true, supportsCt: false },
   *   'abc-123'
   * );
   */
  static createContext(
    controlType: string,
    controlDetails: Record<string, any> | undefined,
    hueCapabilities: any,
    hueUuid: string
  ): LightContext {
    const baseContext = this.inferContextFromLoxone(controlType, controlDetails);

    return {
      lightType: baseContext.lightType!,
      pickerSubtype: baseContext.pickerSubtype,
      capabilities: hueCapabilities,
      hueUuid
    };
  }
}
