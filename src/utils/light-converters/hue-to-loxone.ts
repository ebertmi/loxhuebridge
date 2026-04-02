/**
 * Hue to Loxone Conversion — delegates to domain light classes.
 * Kept as a named export for backward compatibility.
 */

import { LightContext } from './types';
import { createLight } from '../../domain/lights';

export function hueToLoxone(hueData: any, context: LightContext): string | number {
  const light = createLight(context.lightType, { pickerType: context.pickerSubtype }, context.capabilities);
  return light.fromHue(hueData);
}
