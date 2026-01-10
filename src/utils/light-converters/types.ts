/**
 * Type Definitions for Light Converters
 * Supports conversion between Loxone and Hue lighting formats
 */

// ===== Light Type Definitions =====

/**
 * Loxone control types supported by the converter
 */
export type LightType = 'Switch' | 'Dimmer' | 'ColorPickerV2';

/**
 * ColorPickerV2 subtypes (from Loxone structure details.pickerType)
 * - RGB: Full color support, accepts hsv() format only
 * - TunableWhite: White spectrum only, accepts temp() format only
 * - Lumitech: RGBW (color + white), accepts BOTH hsv() and temp() formats
 */
export type PickerSubtype = 'RGB' | 'TunableWhite' | 'Lumitech';

/**
 * Loxone value can be either numeric or string format
 */
export type LoxoneValue = number | string;

// ===== Parsed Format Types =====

/**
 * Parsed HSV format from Loxone hsv(h,s,v) string
 */
export interface ParsedHSV {
  h: number;  // Hue: 0-360
  s: number;  // Saturation: 0-100
  v: number;  // Value/Brightness: 0-100
}

/**
 * Parsed temperature format from Loxone temp(val,kelvin) string
 */
export interface ParsedTemp {
  val: number;     // Brightness: 0-100
  kelvin: number;  // Color temperature: 2000-6500
}

/**
 * Parsed Smart Actuator numeric format (e.g., 201002700)
 * Format: 20 + brightness (2 digits) + kelvin (4 digits)
 */
export interface ParsedSmartActuator {
  brightness: number;  // 0-100
  kelvin: number;      // Color temperature in Kelvin
}

/**
 * Parsed RGB numeric format (e.g., 100050025)
 * Format: R + G*1000 + B*1000000
 */
export interface ParsedRGB {
  r: number;  // Red: 0-255
  g: number;  // Green: 0-255
  b: number;  // Blue: 0-255
}

// ===== Format Detection =====

/**
 * Detected Loxone value format types
 */
export type FormatType =
  | 'hsv'                    // String: hsv(h,s,v)
  | 'temp'                   // String: temp(val,kelvin)
  | 'numeric-smart-actuator' // Number: Smart Actuator format
  | 'numeric-rgb'            // Number: RGB calculation
  | 'numeric-dimmer'         // Number: 0-100 brightness
  | 'numeric-switch'         // Number: 0 or 1
  | 'unknown';               // Could not detect format

// ===== Hue Payload Types =====

/**
 * Hue API light/grouped_light update payload
 */
export interface HuePayload {
  on?: { on: boolean };
  dimming?: { brightness: number };
  color?: { xy: { x: number; y: number } };
  color_temperature?: { mirek: number };
}

// ===== Light Context =====

/**
 * Context information for light conversion
 * Used to determine how to convert values based on light capabilities
 */
export interface LightContext {
  lightType: LightType;
  pickerSubtype?: PickerSubtype;
  capabilities?: LightCapabilities;
  hueUuid?: string;
}

/**
 * Light capabilities (from Hue API)
 */
export interface LightCapabilities {
  supportsColor: boolean;
  supportsCt: boolean;  // Color temperature
  min?: number;         // Min mirek for color temperature
  max?: number;         // Max mirek for color temperature
}

// ===== Converter Function Types =====

/**
 * Function that converts Loxone value to Hue payload
 * Context is bound when the converter is created by the factory
 */
export type LoxoneToHueConverter = (value: LoxoneValue) => HuePayload;

/**
 * Function that converts Hue data to Loxone value
 * Context is bound when the converter is created by the factory
 */
export type HueToLoxoneConverter = (hueData: any) => string | number;

// ===== Control Info (for integration) =====

/**
 * Information about a Loxone control that triggered an update
 */
export interface ControlInfo {
  controlType: string;
  controlName: string;
  stateName: string;
  details?: Record<string, any>;  // Includes pickerType for ColorPickerV2
}
