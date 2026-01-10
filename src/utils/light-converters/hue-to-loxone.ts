/**
 * Hue to Loxone Conversion Logic
 * Converts Hue event data to Loxone control values (wraps existing color utilities)
 */

import { LightContext } from './types';
import {
  xyToLoxoneHsv,
  mirekToLoxoneTemp,
  hueBrightnessToLoxoneDimmer
} from '../color';

/**
 * Main conversion function: Hue data → Loxone value
 * @param hueData - Hue event data from SSE or API
 * @param context - Light context with type and capabilities
 * @returns Loxone control value (string or number)
 */
export function hueToLoxone(hueData: any, context: LightContext): string | number {
  const lightType = context.lightType;

  // Switch: Return 0 for off, 100 for on
  if (lightType === 'Switch') {
    return hueData.on?.on ? 100 : 0;
  }

  // Dimmer: Return 0-100 brightness
  if (lightType === 'Dimmer') {
    return hueBrightnessToLoxoneDimmer(hueData.dimming?.brightness ?? 100);
  }

  // ColorPickerV2: Return format based on subtype and data
  if (lightType === 'ColorPickerV2') {
    return colorPickerToLoxone(hueData, context);
  }

  // Default: Dimmer behavior
  return hueBrightnessToLoxoneDimmer(hueData.dimming?.brightness ?? 100);
}

/**
 * Convert Hue data to Loxone ColorPickerV2 value
 * Handles RGB, TunableWhite, and Lumitech subtypes
 */
function colorPickerToLoxone(hueData: any, context: LightContext): string | number {
  const pickerSubtype = context.pickerSubtype;

  // TunableWhite: Always send temp() format
  if (pickerSubtype === 'TunableWhite') {
    if (hueData.color_temperature?.mirek) {
      const brightness = hueData.dimming?.brightness ?? 100;
      return mirekToLoxoneTemp(hueData.color_temperature.mirek, brightness);
    }
    // Fallback: Return brightness only
    return hueBrightnessToLoxoneDimmer(hueData.dimming?.brightness ?? 100);
  }

  // Lumitech: Send temp() for white mode, hsv() for color mode
  // Priority: Color > Temperature > Brightness
  if (pickerSubtype === 'Lumitech') {
    if (hueData.color?.xy) {
      // Color mode
      const brightness = hueData.dimming?.brightness ?? 100;
      return xyToLoxoneHsv(hueData.color.xy.x, hueData.color.xy.y, brightness);
    } else if (hueData.color_temperature?.mirek) {
      // White mode
      const brightness = hueData.dimming?.brightness ?? 100;
      return mirekToLoxoneTemp(hueData.color_temperature.mirek, brightness);
    } else if (hueData.dimming?.brightness !== undefined) {
      // Brightness only
      return hueBrightnessToLoxoneDimmer(hueData.dimming.brightness);
    } else if (hueData.on !== undefined) {
      // On/Off only
      return hueData.on.on ? 100 : 0;
    }
    // Fallback
    return 100;
  }

  // RGB (default): Use XY → HSV conversion
  if (hueData.color?.xy) {
    const brightness = hueData.dimming?.brightness ?? 100;
    return xyToLoxoneHsv(hueData.color.xy.x, hueData.color.xy.y, brightness);
  } else if (hueData.dimming?.brightness !== undefined) {
    // Brightness only
    return hueBrightnessToLoxoneDimmer(hueData.dimming.brightness);
  } else if (hueData.on !== undefined) {
    // On/Off only
    return hueData.on.on ? 100 : 0;
  }

  // Fallback: Return 100 (on)
  return 100;
}
