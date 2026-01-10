/**
 * Loxone to Hue Conversion Logic
 * Converts Loxone values (string and numeric formats) to Hue API payloads
 */

import {
  LoxoneValue,
  HuePayload,
  LightContext,
  ParsedHSV,
  ParsedTemp,
  ParsedSmartActuator,
  ParsedRGB
} from './types';

import {
  detectLoxoneFormat,
  parseLoxoneHsv,
  parseLoxoneTemp,
  parseSmartActuator,
  parseRGB
} from './parsers';

import {
  hsvToRgb,
  rgbToXy,
  kelvinToMirek,
  rgbToMirekFallback
} from '../color';

/**
 * Main conversion function: Loxone value → Hue payload
 * @param value - Loxone value (string or number)
 * @param context - Light context with type and capabilities
 * @returns Hue API payload
 */
export function loxoneToHue(value: LoxoneValue, context: LightContext): HuePayload {
  // Detect format
  const format = detectLoxoneFormat(value);

  // Route to appropriate converter based on format
  switch (format) {
    case 'hsv':
      const hsv = parseLoxoneHsv(value as string);
      if (hsv) {
        return hsvToHuePayload(hsv, context);
      }
      break;

    case 'temp':
      const temp = parseLoxoneTemp(value as string);
      if (temp) {
        return tempToHuePayload(temp, context);
      }
      break;

    case 'numeric-smart-actuator':
      const smartActuator = parseSmartActuator(value as number);
      if (smartActuator) {
        return smartActuatorToHuePayload(smartActuator, context);
      }
      break;

    case 'numeric-rgb':
      const rgb = parseRGB(value as number);
      if (rgb) {
        return rgbToHuePayload(rgb, context);
      }
      break;

    case 'numeric-dimmer':
      return dimmerToHuePayload(value as number);

    case 'numeric-switch':
      return switchToHuePayload(value as number);

    default:
      // Unknown format - try dimmer as fallback
      if (typeof value === 'number' && value >= 0 && value <= 100) {
        return dimmerToHuePayload(value);
      }
      throw new Error(`Unknown Loxone format: ${value}`);
  }

  throw new Error(`Failed to parse Loxone value: ${value}`);
}

// ===== Format-Specific Converters =====

/**
 * Convert parsed HSV to Hue payload
 * Used for RGB and Lumitech ColorPickerV2 controls in color mode
 */
function hsvToHuePayload(hsv: ParsedHSV, context: LightContext): HuePayload {
  const payload: HuePayload = {};

  // Convert HSV to RGB to XY
  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);

  // Check if light supports color
  const supportsColor = context.capabilities?.supportsColor ?? true;
  const supportsCt = context.capabilities?.supportsCt ?? false;

  if (supportsColor) {
    // Light supports color - send XY
    const xy = rgbToXy(rgb.r, rgb.g, rgb.b);
    payload.color = { xy };
  } else if (supportsCt) {
    // Light only supports color temperature - convert RGB to mirek fallback
    const minMirek = context.capabilities?.min ?? 153;
    const maxMirek = context.capabilities?.max ?? 500;
    const mirek = rgbToMirekFallback(rgb.r, rgb.g, rgb.b, minMirek, maxMirek);
    payload.color_temperature = { mirek };
  }

  // Handle brightness and on/off
  if (hsv.v === 0) {
    payload.on = { on: false };
  } else {
    payload.on = { on: true };
    payload.dimming = { brightness: hsv.v };
  }

  return payload;
}

/**
 * Convert parsed temperature to Hue payload
 * Used for TunableWhite and Lumitech ColorPickerV2 controls in white mode
 */
function tempToHuePayload(temp: ParsedTemp, context: LightContext): HuePayload {
  const payload: HuePayload = {};

  // Check if light supports color temperature
  const supportsCt = context.capabilities?.supportsCt ?? true;
  const supportsColor = context.capabilities?.supportsColor ?? false;

  if (supportsCt) {
    // Light supports color temperature - send mirek
    const mirek = kelvinToMirek(temp.kelvin);

    // Clamp to light's capabilities
    const minMirek = context.capabilities?.min ?? 153;
    const maxMirek = context.capabilities?.max ?? 500;
    const clampedMirek = Math.max(minMirek, Math.min(maxMirek, mirek));

    payload.color_temperature = { mirek: clampedMirek };
  } else if (supportsColor) {
    // Light only supports color - convert kelvin to approximate RGB/XY
    // Warmer (lower kelvin) = more red, cooler (higher kelvin) = more blue
    const normalized = (temp.kelvin - 2000) / (6500 - 2000); // 0-1
    const hue = 30 - (normalized * 30); // 30 (warm) to 0 (cool) degrees
    const rgb = hsvToRgb(hue, 100, 100);
    const xy = rgbToXy(rgb.r, rgb.g, rgb.b);
    payload.color = { xy };
  }

  // Handle brightness and on/off
  if (temp.val === 0) {
    payload.on = { on: false };
  } else {
    payload.on = { on: true };
    payload.dimming = { brightness: temp.val };
  }

  return payload;
}

/**
 * Convert parsed Smart Actuator to Hue payload
 * Format: 20 + brightness + kelvin (e.g., 201002700)
 */
function smartActuatorToHuePayload(sa: ParsedSmartActuator, context: LightContext): HuePayload {
  // Smart Actuator is essentially a temp() format
  return tempToHuePayload(
    { val: sa.brightness, kelvin: sa.kelvin },
    context
  );
}

/**
 * Convert parsed RGB to Hue payload
 * Format: R + G*1000 + B*1000000 (e.g., 100050025)
 */
function rgbToHuePayload(rgb: ParsedRGB, context: LightContext): HuePayload {
  const payload: HuePayload = {};

  // Check if light supports color
  const supportsColor = context.capabilities?.supportsColor ?? true;
  const supportsCt = context.capabilities?.supportsCt ?? false;

  if (supportsColor) {
    // Light supports color - send XY
    const xy = rgbToXy(rgb.r, rgb.g, rgb.b);
    payload.color = { xy };
  } else if (supportsCt) {
    // Light only supports color temperature - convert RGB to mirek fallback
    const minMirek = context.capabilities?.min ?? 153;
    const maxMirek = context.capabilities?.max ?? 500;
    const mirek = rgbToMirekFallback(rgb.r, rgb.g, rgb.b, minMirek, maxMirek);
    payload.color_temperature = { mirek };
  }

  // Always turn on for RGB (no brightness in this format)
  payload.on = { on: true };

  return payload;
}

/**
 * Convert dimmer value to Hue payload
 * Format: 0-100
 */
function dimmerToHuePayload(value: number): HuePayload {
  const payload: HuePayload = {};

  if (value === 0) {
    payload.on = { on: false };
  } else {
    payload.on = { on: true };
    payload.dimming = { brightness: Math.max(0, Math.min(100, value)) };
  }

  return payload;
}

/**
 * Convert switch value to Hue payload
 * Format: 0 (off) or 1 (on)
 */
function switchToHuePayload(value: number): HuePayload {
  return {
    on: { on: value === 1 }
  };
}
