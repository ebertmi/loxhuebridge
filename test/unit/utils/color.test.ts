/**
 * Unit Tests for Color Utility Functions
 * Tests all color conversion functions in src/utils/color.ts
 */

import {
  mapRange,
  kelvinToMirek,
  mirekToKelvin,
  componentToHex,
  rgbToHex,
  xyToHex,
  mirekToHex,
  rgbToXy,
  rgbToMirekFallback,
  hueLightToLux,
  rgbToHsv,
  hsvToRgb,
  xyToRgb,
  xyToLoxoneHsv,
  mirekToLoxoneTemp,
  hueBrightnessToLoxoneDimmer
} from '../../../src/utils/color';

describe('Color Utility Functions', () => {
  describe('mapRange', () => {
    it('should map value from one range to another', () => {
      expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
      expect(mapRange(0, 0, 10, 0, 100)).toBe(0);
      expect(mapRange(10, 0, 10, 0, 100)).toBe(100);
    });

    it('should handle negative ranges', () => {
      expect(mapRange(0, -10, 10, 0, 100)).toBe(50);
      expect(mapRange(-5, -10, 10, 0, 100)).toBe(25);
    });

    it('should handle inverted ranges', () => {
      expect(mapRange(5, 0, 10, 100, 0)).toBe(50);
    });
  });

  describe('kelvinToMirek', () => {
    it('should convert common color temperatures', () => {
      expect(kelvinToMirek(6500)).toBe(154); // Cool daylight
      expect(kelvinToMirek(4000)).toBe(250); // Neutral white
      expect(kelvinToMirek(2700)).toBe(370); // Warm white
    });

    it('should handle minimum value (returns 500 for < 2000K)', () => {
      expect(kelvinToMirek(1000)).toBe(500);
      expect(kelvinToMirek(1500)).toBe(500);
      expect(kelvinToMirek(2000)).toBe(500);
    });

    it('should handle edge cases', () => {
      expect(kelvinToMirek(2000)).toBe(500);
      expect(kelvinToMirek(2001)).toBe(500);
      expect(kelvinToMirek(10000)).toBe(100);
    });
  });

  describe('mirekToKelvin', () => {
    it('should convert mirek to kelvin', () => {
      expect(mirekToKelvin(154)).toBe(6494);
      expect(mirekToKelvin(250)).toBe(4000);
      expect(mirekToKelvin(370)).toBe(2703);
    });

    it('should handle minimum and maximum mirek values', () => {
      expect(mirekToKelvin(153)).toBe(6536); // Hue min mirek
      expect(mirekToKelvin(500)).toBe(2000); // Hue max mirek
    });

    it('should be inverse of kelvinToMirek (approximately)', () => {
      const kelvin = 4000;
      const mirek = kelvinToMirek(kelvin);
      const backToKelvin = mirekToKelvin(mirek);
      expect(Math.abs(backToKelvin - kelvin)).toBeLessThan(10);
    });
  });

  describe('componentToHex', () => {
    it('should convert component to hex with leading zero', () => {
      expect(componentToHex(0)).toBe('00');
      expect(componentToHex(15)).toBe('0f');
      expect(componentToHex(255)).toBe('ff');
    });

    it('should handle two-digit hex values', () => {
      expect(componentToHex(16)).toBe('10');
      expect(componentToHex(128)).toBe('80');
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex color string', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000'); // Red
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00'); // Green
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff'); // Blue
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff'); // White
      expect(rgbToHex(0, 0, 0)).toBe('#000000'); // Black
    });

    it('should handle decimal RGB values by rounding', () => {
      expect(rgbToHex(127.5, 63.2, 191.8)).toBe('#803fc0');
    });

    it('should handle common colors', () => {
      expect(rgbToHex(128, 128, 128)).toBe('#808080'); // Gray
      expect(rgbToHex(255, 255, 0)).toBe('#ffff00'); // Yellow
      expect(rgbToHex(255, 0, 255)).toBe('#ff00ff'); // Magenta
      expect(rgbToHex(0, 255, 255)).toBe('#00ffff'); // Cyan
    });
  });

  describe('rgbToXy', () => {
    it('should convert RGB to XY color coordinates', () => {
      const red = rgbToXy(100, 0, 0);
      expect(red.x).toBeGreaterThan(0.6);
      expect(red.y).toBeGreaterThan(0.2);
      expect(red.y).toBeLessThan(0.4);
    });

    it('should convert common colors', () => {
      const green = rgbToXy(0, 100, 0);
      expect(green.x).toBeLessThan(0.5);
      expect(green.y).toBeGreaterThan(0.5);

      const blue = rgbToXy(0, 0, 100);
      expect(blue.x).toBeLessThan(0.3);
      expect(blue.y).toBeLessThan(0.3);
    });

    it('should handle white (returns neutral point)', () => {
      const white = rgbToXy(100, 100, 100);
      expect(white.x).toBeCloseTo(0.3226, 2);
      expect(white.y).toBeCloseTo(0.3496, 2);
    });

    it('should handle black (returns 0,0)', () => {
      const black = rgbToXy(0, 0, 0);
      expect(black.x).toBe(0);
      expect(black.y).toBe(0);
    });

    it('should return values with 4 decimal precision', () => {
      const color = rgbToXy(50, 75, 25);
      const xStr = color.x.toString();
      const yStr = color.y.toString();
      expect(xStr.split('.')[1]?.length || 0).toBeLessThanOrEqual(4);
      expect(yStr.split('.')[1]?.length || 0).toBeLessThanOrEqual(4);
    });
  });

  describe('xyToRgb', () => {
    it('should convert XY to RGB', () => {
      // Test with known XY coordinates
      const rgb = xyToRgb(0.6484, 0.3309, 1.0);
      expect(rgb.r).toBeGreaterThan(200);
      expect(rgb.g).toBeGreaterThan(100);
      expect(rgb.b).toBeLessThan(100);
    });

    it('should handle different brightness levels', () => {
      const dim = xyToRgb(0.3, 0.3, 0.5);
      const bright = xyToRgb(0.3, 0.3, 1.0);
      expect(bright.r).toBeGreaterThan(dim.r);
      expect(bright.g).toBeGreaterThan(dim.g);
      expect(bright.b).toBeGreaterThan(dim.b);
    });

    it('should clamp RGB values to 0-255 range', () => {
      const rgb = xyToRgb(0.9, 0.9, 1.0);
      expect(rgb.r).toBeGreaterThanOrEqual(0);
      expect(rgb.r).toBeLessThanOrEqual(255);
      expect(rgb.g).toBeGreaterThanOrEqual(0);
      expect(rgb.g).toBeLessThanOrEqual(255);
      expect(rgb.b).toBeGreaterThanOrEqual(0);
      expect(rgb.b).toBeLessThanOrEqual(255);
    });

    it('should approximately reverse rgbToXy conversion', () => {
      // Note: This is approximate due to color space limitations
      const originalRgb = { r: 50, g: 75, b: 25 };
      const xy = rgbToXy(originalRgb.r, originalRgb.g, originalRgb.b);
      const backToRgb = xyToRgb(xy.x, xy.y, 1.0);

      // Allow for some conversion error (color space conversion is lossy)
      expect(Math.abs(backToRgb.r - originalRgb.r * 2.55)).toBeLessThan(70);
      expect(Math.abs(backToRgb.g - originalRgb.g * 2.55)).toBeLessThan(70);
      expect(Math.abs(backToRgb.b - originalRgb.b * 2.55)).toBeLessThan(70);
    });
  });

  describe('xyToHex', () => {
    it('should convert XY to hex color string', () => {
      const hex = xyToHex(0.6484, 0.3309, 1.0);
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should handle different brightness levels', () => {
      const dim = xyToHex(0.3, 0.3, 0.5);
      const bright = xyToHex(0.3, 0.3, 1.0);
      expect(dim).not.toBe(bright);
    });

    it('should produce valid hex colors', () => {
      const colors = [
        xyToHex(0.6484, 0.3309, 1.0), // Red-ish
        xyToHex(0.3, 0.6, 1.0),        // Green-ish
        xyToHex(0.15, 0.06, 1.0),      // Blue-ish
      ];

      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
      });
    });
  });

  describe('mirekToHex', () => {
    it('should convert mirek to hex color string', () => {
      const warm = mirekToHex(370); // Warm white
      const cool = mirekToHex(154); // Cool white

      expect(warm).toMatch(/^#[0-9a-f]{6}$/);
      expect(cool).toMatch(/^#[0-9a-f]{6}$/);
      expect(warm).not.toBe(cool);
    });

    it('should produce warmer colors for higher mirek values', () => {
      const warm = mirekToHex(370);
      const cool = mirekToHex(154);

      // Warm should have more red
      const warmRed = parseInt(warm.substring(1, 3), 16);
      const coolRed = parseInt(cool.substring(1, 3), 16);
      expect(warmRed).toBeGreaterThanOrEqual(coolRed);
    });

    it('should handle common color temperatures', () => {
      expect(mirekToHex(153)).toMatch(/^#[0-9a-f]{6}$/); // Min
      expect(mirekToHex(250)).toMatch(/^#[0-9a-f]{6}$/); // Mid
      expect(mirekToHex(500)).toMatch(/^#[0-9a-f]{6}$/); // Max
    });
  });

  describe('rgbToMirekFallback', () => {
    it('should estimate mirek from RGB warmth ratio', () => {
      const mirek = rgbToMirekFallback(100, 50, 0, 153, 500);
      expect(mirek).toBeGreaterThan(153);
      expect(mirek).toBeLessThanOrEqual(500);
    });

    it('should return warm mirek for red-heavy colors', () => {
      const mirek = rgbToMirekFallback(100, 0, 10, 153, 500);
      expect(mirek).toBeGreaterThan(300);
    });

    it('should return cool mirek for blue-heavy colors', () => {
      const mirek = rgbToMirekFallback(10, 0, 100, 153, 500);
      expect(mirek).toBeLessThan(300);
    });

    it('should return middle value for balanced colors', () => {
      const mirek = rgbToMirekFallback(50, 50, 50, 153, 500);
      const expectedMid = Math.round((153 + 500) / 2);
      expect(mirek).toBeCloseTo(expectedMid, 1);
    });

    it('should handle zero red and blue (returns middle)', () => {
      const mirek = rgbToMirekFallback(0, 100, 0, 153, 500);
      expect(mirek).toBe(Math.round((153 + 500) / 2));
    });
  });

  describe('hueLightToLux', () => {
    it('should convert Hue light sensor value to Lux', () => {
      expect(hueLightToLux(1)).toBe(1); // 10^((1-1)/10000)
      expect(hueLightToLux(10001)).toBeGreaterThan(1);
      expect(hueLightToLux(30001)).toBeGreaterThan(10);
    });

    it('should return increasing lux for increasing values', () => {
      const lux1 = hueLightToLux(1);
      const lux2 = hueLightToLux(10001);
      const lux3 = hueLightToLux(20001);

      expect(lux2).toBeGreaterThan(lux1);
      expect(lux3).toBeGreaterThan(lux2);
    });

    it('should handle zero and negative values', () => {
      expect(hueLightToLux(0)).toBeGreaterThanOrEqual(0);
      expect(hueLightToLux(0)).toBeLessThanOrEqual(2);
      expect(hueLightToLux(-10000)).toBeGreaterThanOrEqual(0);
      expect(hueLightToLux(-10000)).toBeLessThanOrEqual(1);
    });
  });

  describe('rgbToHsv', () => {
    it('should convert RGB to HSV', () => {
      const red = rgbToHsv(255, 0, 0);
      expect(red.h).toBe(0);
      expect(red.s).toBe(100);
      expect(red.v).toBe(100);
    });

    it('should convert common colors', () => {
      const green = rgbToHsv(0, 255, 0);
      expect(green.h).toBe(120);
      expect(green.s).toBe(100);
      expect(green.v).toBe(100);

      const blue = rgbToHsv(0, 0, 255);
      expect(blue.h).toBe(240);
      expect(blue.s).toBe(100);
      expect(blue.v).toBe(100);
    });

    it('should handle white (0 saturation)', () => {
      const white = rgbToHsv(255, 255, 255);
      expect(white.h).toBe(0);
      expect(white.s).toBe(0);
      expect(white.v).toBe(100);
    });

    it('should handle black', () => {
      const black = rgbToHsv(0, 0, 0);
      expect(black.h).toBe(0);
      expect(black.s).toBe(0);
      expect(black.v).toBe(0);
    });

    it('should handle gray (0 saturation)', () => {
      const gray = rgbToHsv(128, 128, 128);
      expect(gray.s).toBe(0);
      expect(gray.v).toBeCloseTo(50, 0);
    });

    it('should return integers', () => {
      const color = rgbToHsv(123, 45, 67);
      expect(Number.isInteger(color.h)).toBe(true);
      expect(Number.isInteger(color.s)).toBe(true);
      expect(Number.isInteger(color.v)).toBe(true);
    });
  });

  describe('hsvToRgb', () => {
    it('should convert HSV to RGB', () => {
      const red = hsvToRgb(0, 100, 100);
      expect(red.r).toBe(255);
      expect(red.g).toBe(0);
      expect(red.b).toBe(0);
    });

    it('should convert common colors', () => {
      const green = hsvToRgb(120, 100, 100);
      expect(green.r).toBe(0);
      expect(green.g).toBe(255);
      expect(green.b).toBe(0);

      const blue = hsvToRgb(240, 100, 100);
      expect(blue.r).toBe(0);
      expect(blue.g).toBe(0);
      expect(blue.b).toBe(255);
    });

    it('should handle white (0 saturation)', () => {
      const white = hsvToRgb(0, 0, 100);
      expect(white.r).toBe(255);
      expect(white.g).toBe(255);
      expect(white.b).toBe(255);
    });

    it('should handle black (0 value)', () => {
      const black = hsvToRgb(0, 0, 0);
      expect(black.r).toBe(0);
      expect(black.g).toBe(0);
      expect(black.b).toBe(0);
    });

    it('should handle gray (0 saturation, 50 value)', () => {
      const gray = hsvToRgb(0, 0, 50);
      expect(gray.r).toBeCloseTo(128, 0);
      expect(gray.g).toBeCloseTo(128, 0);
      expect(gray.b).toBeCloseTo(128, 0);
    });

    it('should handle cyan', () => {
      const cyan = hsvToRgb(180, 100, 100);
      expect(cyan.r).toBe(0);
      expect(cyan.g).toBe(255);
      expect(cyan.b).toBe(255);
    });

    it('should handle yellow', () => {
      const yellow = hsvToRgb(60, 100, 100);
      expect(yellow.r).toBe(255);
      expect(yellow.g).toBe(255);
      expect(yellow.b).toBe(0);
    });

    it('should handle magenta', () => {
      const magenta = hsvToRgb(300, 100, 100);
      expect(magenta.r).toBe(255);
      expect(magenta.g).toBe(0);
      expect(magenta.b).toBe(255);
    });

    it('should return integers', () => {
      const color = hsvToRgb(180, 50, 75);
      expect(Number.isInteger(color.r)).toBe(true);
      expect(Number.isInteger(color.g)).toBe(true);
      expect(Number.isInteger(color.b)).toBe(true);
    });

    it('should be inverse of rgbToHsv for pure colors', () => {
      // Test round-trip conversion for red
      const red = hsvToRgb(0, 100, 100);
      const redHsv = rgbToHsv(red.r, red.g, red.b);
      expect(redHsv.h).toBe(0);
      expect(redHsv.s).toBe(100);
      expect(redHsv.v).toBe(100);

      // Test round-trip conversion for green
      const green = hsvToRgb(120, 100, 100);
      const greenHsv = rgbToHsv(green.r, green.g, green.b);
      expect(greenHsv.h).toBe(120);
      expect(greenHsv.s).toBe(100);
      expect(greenHsv.v).toBe(100);

      // Test round-trip conversion for blue
      const blue = hsvToRgb(240, 100, 100);
      const blueHsv = rgbToHsv(blue.r, blue.g, blue.b);
      expect(blueHsv.h).toBe(240);
      expect(blueHsv.s).toBe(100);
      expect(blueHsv.v).toBe(100);
    });

    it('should handle edge case with hue 360', () => {
      const color = hsvToRgb(360, 100, 100);
      // Hue 360 should be same as hue 0 (red)
      expect(color.r).toBe(255);
      expect(color.g).toBeCloseTo(0, 0);
      expect(color.b).toBeCloseTo(0, 0);
    });
  });

  describe('xyToLoxoneHsv', () => {
    it('should return Loxone HSV format string', () => {
      const result = xyToLoxoneHsv(0.6484, 0.3309, 75);
      expect(result).toMatch(/^hsv\(\d+,\d+,\d+\)$/);
    });

    it('should use provided brightness value', () => {
      const result = xyToLoxoneHsv(0.3, 0.3, 50);
      expect(result).toContain(',50)');
    });

    it('should clamp brightness to 0-100 range', () => {
      const over = xyToLoxoneHsv(0.3, 0.3, 150);
      expect(over).toContain(',100)');

      const under = xyToLoxoneHsv(0.3, 0.3, -10);
      expect(under).toContain(',0)');
    });

    it('should have hue 0-360 and saturation 0-100', () => {
      const result = xyToLoxoneHsv(0.6, 0.3, 75);
      const match = result.match(/hsv\((\d+),(\d+),(\d+)\)/);
      expect(match).not.toBeNull();

      if (match) {
        const h = parseInt(match[1]);
        const s = parseInt(match[2]);
        const v = parseInt(match[3]);

        expect(h).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThanOrEqual(360);
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(100);
        expect(v).toBe(75);
      }
    });
  });

  describe('mirekToLoxoneTemp', () => {
    it('should return Loxone temp format string', () => {
      const result = mirekToLoxoneTemp(250, 75);
      expect(result).toMatch(/^temp\(\d+,\d+\)$/);
    });

    it('should convert mirek to kelvin correctly', () => {
      // Format is temp(val,kelvin) where val is brightness
      const result = mirekToLoxoneTemp(250, 75);
      expect(result).toBe('temp(75,4000)');
    });

    it('should clamp brightness to 0-100 range', () => {
      const over = mirekToLoxoneTemp(250, 150);
      expect(over).toBe('temp(100,4000)');

      const under = mirekToLoxoneTemp(250, -10);
      expect(under).toBe('temp(0,4000)');
    });

    it('should handle common color temperatures', () => {
      expect(mirekToLoxoneTemp(153, 100)).toMatch(/temp\(100,653\d\)/);
      expect(mirekToLoxoneTemp(370, 50)).toMatch(/temp\(50,270\d\)/);
    });
  });

  describe('hueBrightnessToLoxoneDimmer', () => {
    it('should pass through values in 0-100 range', () => {
      expect(hueBrightnessToLoxoneDimmer(0)).toBe(0);
      expect(hueBrightnessToLoxoneDimmer(50)).toBe(50);
      expect(hueBrightnessToLoxoneDimmer(100)).toBe(100);
    });

    it('should clamp values above 100', () => {
      expect(hueBrightnessToLoxoneDimmer(150)).toBe(100);
      expect(hueBrightnessToLoxoneDimmer(200)).toBe(100);
    });

    it('should clamp values below 0', () => {
      expect(hueBrightnessToLoxoneDimmer(-10)).toBe(0);
      expect(hueBrightnessToLoxoneDimmer(-50)).toBe(0);
    });

    it('should round decimal values', () => {
      expect(hueBrightnessToLoxoneDimmer(75.6)).toBe(76);
      expect(hueBrightnessToLoxoneDimmer(75.4)).toBe(75);
    });
  });
});
