export interface XY {
  x: number;
  y: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

// XY to RGB conversion (CIE 1931 color space)
export function xyToRgb(x: number, y: number, brightness = 1): RGB {
  const z = 1.0 - x - y;
  const Y = brightness;
  const X = (Y / y) * x;
  const Z = (Y / y) * z;

  let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
  let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
  let b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;

  // Apply gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1.0 / 2.4) - 0.055 : 12.92 * b;

  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(b * 255)))
  };
}

// RGB to XY conversion
export function rgbToXy(r: number, g: number, b: number): XY {
  // Normalize RGB values
  let red = r / 255;
  let green = g / 255;
  let blue = b / 255;

  // Apply gamma correction
  red = red > 0.04045 ? Math.pow((red + 0.055) / 1.055, 2.4) : red / 12.92;
  green = green > 0.04045 ? Math.pow((green + 0.055) / 1.055, 2.4) : green / 12.92;
  blue = blue > 0.04045 ? Math.pow((blue + 0.055) / 1.055, 2.4) : blue / 12.92;

  // Convert to XYZ
  const X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  const Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  const Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;

  // Calculate xy
  const sum = X + Y + Z;
  if (sum === 0) {
    return { x: 0.3127, y: 0.3290 }; // D65 white point
  }

  return {
    x: X / sum,
    y: Y / sum
  };
}

// Kelvin to Mirek conversion
export function kelvinToMirek(kelvin: number): number {
  return Math.round(1000000 / kelvin);
}

// Mirek to Kelvin conversion
export function mirekToKelvin(mirek: number): number {
  return Math.round(1000000 / mirek);
}

// Kelvin to RGB conversion
export function kelvinToRgb(kelvin: number): RGB {
  const temp = kelvin / 100;
  let r: number, g: number, b: number;

  if (temp <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    if (temp <= 19) {
      b = 0;
    } else {
      b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
    }
  } else {
    r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    b = 255;
  }

  return {
    r: Math.max(0, Math.min(255, Math.round(r))),
    g: Math.max(0, Math.min(255, Math.round(g))),
    b: Math.max(0, Math.min(255, Math.round(b)))
  };
}

// RGB to HSV conversion
export function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

// HSV to RGB conversion
export function hsvToRgb(h: number, s: number, v: number): RGB {
  h /= 360;
  s /= 100;
  v /= 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r: number, g: number, b: number;

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = 0; g = 0; b = 0;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// RGB to hex conversion
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Hex to RGB conversion
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

// Loxone RGB numeric format: R + G*1000 + B*1000000
export function loxoneRgbToRgb(value: number): RGB {
  const b = Math.floor(value / 1000000);
  const g = Math.floor((value % 1000000) / 1000);
  const r = value % 1000;
  return { r, g, b };
}

export function rgbToLoxoneRgb(r: number, g: number, b: number): number {
  return r + g * 1000 + b * 1000000;
}

// Parse Loxone Smart Actuator format: 20 + brightness(2-3 digits) + kelvin(5 digits)
export function parseSmartActuator(value: string): { brightness: number; kelvin: number } | null {
  if (!value.startsWith('20')) return null;
  const rest = value.slice(2);

  // Can be 201002700 (brightness=10, kelvin=02700) or 2010002700 (brightness=100, kelvin=02700)
  if (rest.length === 7) {
    return {
      brightness: parseInt(rest.slice(0, 2), 10),
      kelvin: parseInt(rest.slice(2), 10)
    };
  } else if (rest.length === 8) {
    return {
      brightness: parseInt(rest.slice(0, 3), 10),
      kelvin: parseInt(rest.slice(3), 10)
    };
  }

  return null;
}
