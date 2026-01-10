/**
 * Tests for Loxone to Hue Conversion Logic
 */

import { loxoneToHue } from '../../../../src/utils/light-converters/loxone-to-hue';
import { LightContext } from '../../../../src/utils/light-converters/types';

describe('loxoneToHue', () => {
  describe('HSV format (ColorPickerV2 RGB/Lumitech)', () => {
    it('should convert HSV to Hue XY color', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        pickerSubtype: 'RGB',
        capabilities: { supportsColor: true, supportsCt: false },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue('hsv(0,100,100)', context);

      expect(result.on).toEqual({ on: true });
      expect(result.dimming).toEqual({ brightness: 100 });
      expect(result.color).toBeDefined();
      expect(result.color?.xy).toBeDefined();
    });

    it('should handle HSV with 0 brightness (turn off)', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        pickerSubtype: 'RGB',
        capabilities: { supportsColor: true, supportsCt: false },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue('hsv(180,50,0)', context);

      expect(result.on).toEqual({ on: false });
    });

    it('should convert HSV to mirek fallback for white-only lights', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        pickerSubtype: 'RGB',
        capabilities: { supportsColor: false, supportsCt: true, min: 153, max: 500 },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue('hsv(0,100,75)', context);

      expect(result.on).toEqual({ on: true });
      expect(result.dimming).toEqual({ brightness: 75 });
      expect(result.color_temperature).toBeDefined();
      expect(result.color_temperature?.mirek).toBeGreaterThanOrEqual(153);
      expect(result.color_temperature?.mirek).toBeLessThanOrEqual(500);
    });
  });

  describe('Temp format (ColorPickerV2 TunableWhite/Lumitech)', () => {
    it('should convert temp to Hue mirek', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        pickerSubtype: 'TunableWhite',
        capabilities: { supportsColor: false, supportsCt: true, min: 153, max: 500 },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue('temp(75,4000)', context);

      expect(result.on).toEqual({ on: true });
      expect(result.dimming).toEqual({ brightness: 75 });
      expect(result.color_temperature).toBeDefined();
      expect(result.color_temperature?.mirek).toBe(250); // 1000000/4000 = 250
    });

    it('should handle temp with 0 brightness (turn off)', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        pickerSubtype: 'TunableWhite',
        capabilities: { supportsColor: false, supportsCt: true },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue('temp(0,4000)', context);

      expect(result.on).toEqual({ on: false });
    });

    it('should clamp mirek to light capabilities', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        pickerSubtype: 'TunableWhite',
        capabilities: { supportsColor: false, supportsCt: true, min: 250, max: 400 },
        hueUuid: 'test-uuid'
      };

      // 6500K = 154 mirek (too cool, should clamp to 250)
      const result = loxoneToHue('temp(100,6500)', context);

      expect(result.color_temperature?.mirek).toBe(250); // Clamped to min
    });
  });

  describe('Smart Actuator numeric format', () => {
    it('should convert Smart Actuator to mirek', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        capabilities: { supportsColor: false, supportsCt: true },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue(201002700, context);

      expect(result.on).toEqual({ on: true });
      expect(result.dimming).toEqual({ brightness: 10 });
      expect(result.color_temperature).toBeDefined();
      expect(result.color_temperature?.mirek).toBe(370); // 1000000/2700 ≈ 370
    });

    it('should handle Smart Actuator with 100% brightness', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        capabilities: { supportsColor: false, supportsCt: true },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue(2010002700, context);

      expect(result.on).toEqual({ on: true });
      expect(result.dimming).toEqual({ brightness: 100 });
    });
  });

  describe('RGB numeric format', () => {
    it('should convert RGB to Hue XY color', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        capabilities: { supportsColor: true, supportsCt: false },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue(255255255, context); // White (R:255, G:255, B:255)

      expect(result.on).toEqual({ on: true });
      expect(result.color).toBeDefined();
      expect(result.color?.xy).toBeDefined();
    });

    it('should handle RGB for white-only lights (fallback to mirek)', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        capabilities: { supportsColor: false, supportsCt: true, min: 153, max: 500 },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue(255000000, context); // Blue only (R:0, G:0, B:255)

      expect(result.on).toEqual({ on: true });
      expect(result.color_temperature).toBeDefined();
    });
  });

  describe('Dimmer format', () => {
    it('should convert dimmer value to brightness', () => {
      const context: LightContext = {
        lightType: 'Dimmer',
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue(75, context);

      expect(result.on).toEqual({ on: true });
      expect(result.dimming).toEqual({ brightness: 75 });
    });

    it('should turn off light for 0 value', () => {
      const context: LightContext = {
        lightType: 'Dimmer',
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue(0, context);

      expect(result.on).toEqual({ on: false });
    });

    it('should clamp values to 0-100 range', () => {
      const context: LightContext = {
        lightType: 'Dimmer',
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue(150, context);

      expect(result.dimming?.brightness).toBe(100);
    });
  });

  describe('Switch format', () => {
    it('should turn on for value 1', () => {
      const context: LightContext = {
        lightType: 'Switch',
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue(1, context);

      expect(result.on).toEqual({ on: true });
    });

    it('should turn off for value 0', () => {
      const context: LightContext = {
        lightType: 'Switch',
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue(0, context);

      expect(result.on).toEqual({ on: false });
    });
  });

  describe('Capability handling', () => {
    it('should use default capabilities when not provided', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        pickerSubtype: 'RGB',
        hueUuid: 'test-uuid'
        // No capabilities specified
      };

      const result = loxoneToHue('hsv(180,50,75)', context);

      // Should assume color support by default
      expect(result.color).toBeDefined();
    });

    it('should handle color-only lights', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        capabilities: { supportsColor: true, supportsCt: false },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue('hsv(180,50,75)', context);

      expect(result.color).toBeDefined();
      expect(result.color_temperature).toBeUndefined();
    });

    it('should handle temperature-only lights', () => {
      const context: LightContext = {
        lightType: 'ColorPickerV2',
        capabilities: { supportsColor: false, supportsCt: true },
        hueUuid: 'test-uuid'
      };

      const result = loxoneToHue('temp(75,4000)', context);

      expect(result.color_temperature).toBeDefined();
      expect(result.color).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should throw error for unknown format', () => {
      const context: LightContext = {
        lightType: 'Dimmer',
        hueUuid: 'test-uuid'
      };

      expect(() => loxoneToHue('invalid-format', context)).toThrow();
    });

    it('should throw error for out-of-range dimmer value', () => {
      const context: LightContext = {
        lightType: 'Dimmer',
        hueUuid: 'test-uuid'
      };

      // -10 is not a valid dimmer value and will be rejected by format detection
      expect(() => loxoneToHue(-10, context)).toThrow();
    });
  });
});
