/**
 * Light Converters Module
 * Public API for converting between Loxone and Hue lighting formats
 *
 * @module light-converters
 */

// Export factory (primary interface)
export { LightConverterFactory } from './factory';

// Export types
export type {
  LightType,
  PickerSubtype,
  LoxoneValue,
  LightContext,
  LightCapabilities,
  HuePayload,
  LoxoneToHueConverter,
  HueToLoxoneConverter,
  ParsedHSV,
  ParsedTemp,
  ParsedSmartActuator,
  ParsedRGB,
  FormatType,
  ControlInfo
} from './types';

// Export core conversion functions (for advanced usage)
export { loxoneToHue } from './loxone-to-hue';
export { hueToLoxone } from './hue-to-loxone';

// Export parsers (for debugging/testing)
export {
  parseLoxoneHsv,
  parseLoxoneTemp,
  parseSmartActuator,
  parseRGB,
  detectLoxoneFormat,
  isValidLoxoneFormat
} from './parsers';
