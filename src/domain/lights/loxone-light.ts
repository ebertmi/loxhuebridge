/**
 * LoxoneLight — abstract base class for all Loxone light types.
 * Each subclass owns both conversion directions: Loxone→Hue and Hue→Loxone.
 */

import { HuePayload } from '../../utils/light-converters/types';

export type LoxoneValue = string | number;

/** Hue event data as received from SSE or the REST API */
export interface HueEventData {
  on?: { on: boolean };
  dimming?: { brightness: number };
  color_temperature?: { mirek: number };
  color?: { xy: { x: number; y: number } };
}

export abstract class LoxoneLight {
  /** Convert a Loxone value to a Hue API payload */
  abstract toHue(value: LoxoneValue): HuePayload;

  /** Convert Hue event data to a Loxone control value */
  abstract fromHue(data: HueEventData): LoxoneValue;

  /**
   * Return true when `data` is missing color/CT information that is required
   * to produce a complete Loxone value. The caller should pre-fetch the
   * current Hue state, merge it with `data`, and then call `fromHue()`.
   */
  needsStatePrefetch(_data: HueEventData): boolean {
    return false;
  }
}
