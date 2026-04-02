/**
 * Loxone to Hue Conversion — delegates to domain light classes.
 * Kept as a named export for backward compatibility.
 */

import { LoxoneValue, HuePayload, LightContext } from './types';
import { createLight } from '../../domain/lights';
import { detectLoxoneFormat } from './parsers';

export function loxoneToHue(value: LoxoneValue, context: LightContext): HuePayload {
  if (detectLoxoneFormat(value) === 'unknown') {
    throw new Error(`Unknown Loxone format: ${value}`);
  }
  const light = createLight(context.lightType, { pickerType: context.pickerSubtype }, context.capabilities);
  return light.toHue(value);
}
