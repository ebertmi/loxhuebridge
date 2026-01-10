/**
 * Format Parsers for Loxone Light Values
 * Handles both string formats (hsv, temp) and numeric formats (Smart Actuator, RGB, dimmer, switch)
 */

import {
  LoxoneValue,
  FormatType,
  ParsedHSV,
  ParsedTemp,
  ParsedSmartActuator,
  ParsedRGB
} from './types';

// ===== String Format Parsers =====

/**
 * Parse Loxone HSV string format: hsv(h,s,v)
 * @param value - String in format "hsv(180,50,75)"
 * @returns Parsed HSV object or null if invalid
 *
 * @example
 * parseLoxoneHsv("hsv(180,50,75)") // { h: 180, s: 50, v: 75 }
 * parseLoxoneHsv("invalid") // null
 */
export function parseLoxoneHsv(value: string): ParsedHSV | null {
  // Regex: hsv(number, number, number) with optional decimals
  const hsvRegex = /^hsv\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\)$/;
  const match = value.trim().match(hsvRegex);

  if (!match) {
    return null;
  }

  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]);
  const v = parseFloat(match[3]);

  // Validate ranges
  if (h < 0 || h > 360 || s < 0 || s > 100 || v < 0 || v > 100) {
    return null;
  }

  return { h, s, v };
}

/**
 * Parse Loxone temperature string format: temp(val,kelvin)
 * @param value - String in format "temp(75,4000)"
 * @returns Parsed temp object or null if invalid
 *
 * @example
 * parseLoxoneTemp("temp(75,4000)") // { val: 75, kelvin: 4000 }
 * parseLoxoneTemp("invalid") // null
 */
export function parseLoxoneTemp(value: string): ParsedTemp | null {
  // Regex: temp(number, number) with optional decimals
  const tempRegex = /^temp\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\)$/;
  const match = value.trim().match(tempRegex);

  if (!match) {
    return null;
  }

  const val = parseFloat(match[1]);
  const kelvin = parseFloat(match[2]);

  // Validate ranges
  if (val < 0 || val > 100 || kelvin < 2000 || kelvin > 6500) {
    return null;
  }

  return { val, kelvin };
}

// ===== Numeric Format Parsers =====

/**
 * Parse Loxone Smart Actuator numeric format
 * Format: 20 + brightness (2-3 digits) + kelvin (5 digits with leading zero)
 * @param value - Number like 201002700 (20 + 10% + 02700K) or 2010002700 (20 + 100% + 02700K)
 * @returns Parsed Smart Actuator object or null if invalid
 *
 * @example
 * parseSmartActuator(201002700) // { brightness: 10, kelvin: 2700 }
 * parseSmartActuator(2010002700) // { brightness: 100, kelvin: 2700 }
 * parseSmartActuator(123) // null (not Smart Actuator format)
 */
export function parseSmartActuator(value: number): ParsedSmartActuator | null {
  const valueStr = String(value);

  // Must start with "20" and be at least 9 digits
  if (!valueStr.startsWith('20') || valueStr.length < 9) {
    return null;
  }

  // Extract kelvin (last 5 digits)
  const kelvinStr = valueStr.substring(valueStr.length - 5);
  const kelvin = parseInt(kelvinStr, 10);

  // Extract brightness (everything between "20" and kelvin)
  const brightnessStr = valueStr.substring(2, valueStr.length - 5);
  const brightness = parseInt(brightnessStr, 10);

  // Validate ranges
  if (brightness < 0 || brightness > 100) {
    return null;
  }

  if (kelvin < 2000 || kelvin > 6500) {
    return null;
  }

  return { brightness, kelvin };
}

/**
 * Parse Loxone RGB numeric format
 * Format: R + G*1000 + B*1000000
 * @param value - Number like 100050025 (R=25, G=50, B=100)
 * @returns Parsed RGB object or null if invalid
 *
 * @example
 * parseRGB(255255255) // { r: 255, g: 255, b: 255 }
 * parseRGB(1) // { r: 1, g: 0, b: 0 }
 * parseRGB(1000) // { r: 0, g: 1, b: 0 }
 * parseRGB(1000000) // { r: 0, g: 0, b: 1 }
 */
export function parseRGB(value: number): ParsedRGB | null {
  // Can't be negative
  if (value < 0) {
    return null;
  }

  // Extract RGB components: R + G*1000 + B*1000000
  const b = Math.floor(value / 1000000);
  const g = Math.floor((value % 1000000) / 1000);
  const r = value % 1000;

  // Validate ranges (0-255)
  if (r > 255 || g > 255 || b > 255) {
    return null;
  }

  return { r, g, b };
}

// ===== Format Detection =====

/**
 * Detect the format type of a Loxone value
 * @param value - Loxone value (string or number)
 * @returns Detected format type
 *
 * @example
 * detectLoxoneFormat("hsv(180,50,75)") // "hsv"
 * detectLoxoneFormat("temp(75,4000)") // "temp"
 * detectLoxoneFormat(201002700) // "numeric-smart-actuator"
 * detectLoxoneFormat(50) // "numeric-dimmer"
 */
export function detectLoxoneFormat(value: LoxoneValue): FormatType {
  // String formats
  if (typeof value === 'string') {
    const trimmed = value.trim();

    // Check for hsv() format
    if (trimmed.startsWith('hsv(') && parseLoxoneHsv(trimmed) !== null) {
      return 'hsv';
    }

    // Check for temp() format
    if (trimmed.startsWith('temp(') && parseLoxoneTemp(trimmed) !== null) {
      return 'temp';
    }

    // Try to parse as number if string contains only digits
    if (/^\d+$/.test(trimmed)) {
      return detectLoxoneFormat(parseInt(trimmed, 10));
    }

    return 'unknown';
  }

  // Numeric formats
  if (typeof value === 'number') {
    // Check for Smart Actuator format (starts with 20, at least 9 digits)
    if (parseSmartActuator(value) !== null) {
      return 'numeric-smart-actuator';
    }

    // Check for RGB format (typically > 1000 and valid RGB parse)
    if (value > 1000 && parseRGB(value) !== null) {
      return 'numeric-rgb';
    }

    // Switch: 0 or 1
    if (value === 0 || value === 1) {
      return 'numeric-switch';
    }

    // Dimmer: Accept 0-200 range (will be clamped to 0-100 by converter)
    // This provides tolerance for slightly out-of-range values from Loxone
    if (value >= 0 && value <= 200 && Number.isInteger(value)) {
      return 'numeric-dimmer';
    }

    return 'unknown';
  }

  return 'unknown';
}

/**
 * Validate if a value is a valid Loxone format
 * @param value - Value to validate
 * @returns true if valid format detected
 */
export function isValidLoxoneFormat(value: LoxoneValue): boolean {
  return detectLoxoneFormat(value) !== 'unknown';
}
