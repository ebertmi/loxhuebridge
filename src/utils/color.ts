/**
 * Color Conversion Utilities
 * Functions for converting between different color spaces:
 * - RGB ↔ XY (CIE 1931 color space)
 * - Kelvin ↔ Mirek (color temperature)
 * - Hex color representation
 */

import { XYColor, RGBColor, HSVColor } from '../types';

/**
 * Maps a value from one range to another
 */
export function mapRange(v: number, i1: number, i2: number, o1: number, o2: number): number {
  return (v - i1) * (o2 - o1) / (i2 - i1) + o1;
}

/**
 * Converts Kelvin color temperature to Mirek (micro reciprocal degree)
 */
export function kelvinToMirek(k: number): number {
  if (k < 2000) return 500;
  return Math.round(1000000 / k);
}

/**
 * Converts Mirek to Kelvin color temperature
 */
export function mirekToKelvin(mirek: number): number {
  return Math.round(1000000 / mirek);
}

/**
 * Converts a color component to hex string
 */
export function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Converts RGB values to hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + componentToHex(Math.round(r)) + componentToHex(Math.round(g)) + componentToHex(Math.round(b));
}

/**
 * Converts XY color coordinates to RGB hex
 * Used for displaying Hue light colors
 *
 * @see https://developers.meethue.com/develop/application-design-guidance/color-conversion-formulas-rgb-to-xy-and-back/
 */
export function xyToHex(x: number, y: number, bri: number = 1.0): string {
  const z = 1.0 - x - y;
  const Y = bri;
  const X = (Y / y) * x;
  const Z = (Y / y) * z;

  // Convert XYZ to RGB using Wide RGB D65 conversion
  let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
  let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
  let b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;

  // Apply gamma correction
  r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
  b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;

  // Clamp to valid range and convert to 0-255
  return rgbToHex(
    Math.max(0, Math.min(255, r * 255)),
    Math.max(0, Math.min(255, g * 255)),
    Math.max(0, Math.min(255, b * 255))
  );
}

/**
 * Converts Mirek color temperature to RGB hex
 * Approximates the color of a black body radiator at the given temperature
 */
export function mirekToHex(mirek: number): string {
  const temp = 1000000 / mirek / 100;
  let r: number, g: number, b: number;

  if (temp <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    b = temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    b = 255;
  }

  return rgbToHex(
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b))
  );
}

/**
 * Converts RGB to XY color space
 * Used for sending color commands to Hue lights
 */
export function rgbToXy(r: number, g: number, b: number): XYColor {
  // Normalize to 0-1 range
  let red = r / 100;
  let green = g / 100;
  let blue = b / 100;

  // Apply gamma correction
  red = (red > 0.04045) ? Math.pow((red + 0.055) / 1.055, 2.4) : (red / 12.92);
  green = (green > 0.04045) ? Math.pow((green + 0.055) / 1.055, 2.4) : (green / 12.92);
  blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / 1.055, 2.4) : (blue / 12.92);

  // Convert to XYZ using Wide RGB D65 conversion
  const X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  const Y = red * 0.283881 + green * 0.729798 + blue * 0.065885;
  const Z = red * 0.000088 + green * 0.077053 + blue * 0.950255;

  const sum = X + Y + Z;

  if (sum === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: Number((X / sum).toFixed(4)),
    y: Number((Y / sum).toFixed(4))
  };
}

/**
 * Fallback conversion from RGB to Mirek for lights without color support
 * Uses warmth ratio (red vs blue) to estimate color temperature
 */
export function rgbToMirekFallback(r: number, _g: number, b: number, minM: number, maxM: number): number {
  if ((r + b) === 0) {
    return Math.round((minM + maxM) / 2);
  }

  // Calculate warmth: higher red = warmer = higher mirek
  const warmth = r / (r + b);
  return Math.round(minM + (warmth * (maxM - minM)));
}

/**
 * Converts Hue light sensor value to Lux
 */
export function hueLightToLux(v: number): number {
  return Math.round(Math.pow(10, (v - 1) / 10000));
}

/**
 * Converts RGB values to HSV color space
 */
export function rgbToHsv(r: number, g: number, b: number): HSVColor {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = max === 0 ? 0 : (diff / max) * 100;
  let v = max * 100;

  if (diff !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / diff) % 6);
    } else if (max === g) {
      h = 60 * (((b - r) / diff) + 2);
    } else {
      h = 60 * (((r - g) / diff) + 4);
    }
  }

  if (h < 0) h += 360;

  return {
    h: Math.round(h),
    s: Math.round(s),
    v: Math.round(v)
  };
}

/**
 * Converts XY color to RGB (reverse of xyToHex without hex conversion)
 */
export function xyToRgb(x: number, y: number, bri: number = 1.0): RGBColor {
  const z = 1.0 - x - y;
  const Y = bri;
  const X = (Y / y) * x;
  const Z = (Y / y) * z;

  // Convert XYZ to RGB using Wide RGB D65 conversion
  let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
  let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
  let b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;

  // Apply gamma correction
  r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
  b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;

  // Clamp to valid range and convert to 0-255
  return {
    r: Math.max(0, Math.min(255, r * 255)),
    g: Math.max(0, Math.min(255, g * 255)),
    b: Math.max(0, Math.min(255, b * 255))
  };
}

/**
 * Converts Hue XY color to Loxone HSV string format
 * Used for sending color commands to Loxone ColorPickerV2 controls
 *
 * @returns Loxone HSV format "hsv(hue,sat,val)" where H: 0-360, S: 0-100, V: 0-100
 */
export function xyToLoxoneHsv(x: number, y: number, brightness: number): string {
  const rgb = xyToRgb(x, y, 1.0);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  // Use provided brightness instead of calculated V
  const v = Math.round(Math.max(0, Math.min(100, brightness)));

  // Debug logging
  console.log(`[COLOR DEBUG] XY(${x.toFixed(4)}, ${y.toFixed(4)}) → RGB(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}) → HSV(${hsv.h}, ${hsv.s}, ${v})`);

  return `hsv(${hsv.h},${hsv.s},${v})`;
}

/**
 * Converts Hue Mirek to Loxone temperature string format
 * Used for sending color temperature commands to Loxone TunableWhite controls
 *
 * @returns Loxone temp format "temp(val,kelvin)" where val: 0-100, kelvin: 2000-6500
 */
export function mirekToLoxoneTemp(mirek: number, brightness: number): string {
  const kelvin = Math.round(1000000 / mirek);
  const val = Math.round(Math.max(0, Math.min(100, brightness)));

  return `temp(${val},${kelvin})`;
}

/**
 * Converts Hue brightness (0-100) to Loxone dimmer value
 * Simple pass-through since both use 0-100 range
 */
export function hueBrightnessToLoxoneDimmer(brightness: number): number {
  return Math.round(Math.max(0, Math.min(100, brightness)));
}
