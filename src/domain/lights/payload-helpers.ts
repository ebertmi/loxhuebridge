/**
 * Shared payload-building helpers for color light classes.
 * These functions are capability-aware: they adapt the output based on what
 * the Hue light actually supports (color, CT, or both).
 */

import { HuePayload, LightCapabilities } from '../../utils/light-converters/types';
import { ParsedHSV, ParsedTemp, ParsedRGB } from '../../utils/light-converters/types';
import { hsvToRgb, rgbToXy, kelvinToMirek, rgbToMirekFallback } from '../../utils/color';

export function hsvToPayload(hsv: ParsedHSV, caps?: LightCapabilities): HuePayload {
  const payload: HuePayload = {};
  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);

  if (caps?.supportsColor ?? true) {
    payload.color = { xy: rgbToXy(rgb.r, rgb.g, rgb.b) };
  } else if (caps?.supportsCt) {
    const min = caps.min ?? 153;
    const max = caps.max ?? 500;
    payload.color_temperature = { mirek: rgbToMirekFallback(rgb.r, rgb.g, rgb.b, min, max) };
  }

  if (hsv.v === 0) {
    payload.on = { on: false };
  } else {
    payload.on = { on: true };
    payload.dimming = { brightness: hsv.v };
  }

  return payload;
}

export function tempToPayload(temp: ParsedTemp, caps?: LightCapabilities): HuePayload {
  const payload: HuePayload = {};

  if (caps?.supportsCt ?? true) {
    const rawMirek = kelvinToMirek(temp.kelvin);
    const min = caps?.min ?? 153;
    const max = caps?.max ?? 500;
    payload.color_temperature = { mirek: Math.max(min, Math.min(max, rawMirek)) };
  } else if (caps?.supportsColor) {
    // Approximate kelvin as a warm/cool hue angle
    const normalized = (temp.kelvin - 2000) / (6500 - 2000);
    const hue = 30 - normalized * 30;
    const rgb = hsvToRgb(hue, 100, 100);
    payload.color = { xy: rgbToXy(rgb.r, rgb.g, rgb.b) };
  }

  if (temp.val === 0) {
    payload.on = { on: false };
  } else {
    payload.on = { on: true };
    payload.dimming = { brightness: temp.val };
  }

  return payload;
}

export function rgbToPayload(rgb: ParsedRGB, caps?: LightCapabilities): HuePayload {
  const payload: HuePayload = {};
  const maxComponent = Math.max(rgb.r, rgb.g, rgb.b);

  if (maxComponent === 0) return { on: { on: false } };

  if (caps?.supportsColor ?? true) {
    payload.color = { xy: rgbToXy(rgb.r, rgb.g, rgb.b) };
  } else if (caps?.supportsCt) {
    const min = caps.min ?? 153;
    const max = caps.max ?? 500;
    payload.color_temperature = { mirek: rgbToMirekFallback(rgb.r, rgb.g, rgb.b, min, max) };
  }

  payload.on = { on: true };
  payload.dimming = { brightness: maxComponent };

  return payload;
}
