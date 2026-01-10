/**
 * Tests for Light Converter Factory
 */

import { LightConverterFactory } from '../../../../src/utils/light-converters/factory';

describe('LightConverterFactory', () => {
  describe('getLoxoneToHueConverter', () => {
    it('should return a converter function', () => {
      const context = {
        lightType: 'Switch' as const,
        hueUuid: 'test-uuid'
      };

      const converter = LightConverterFactory.getLoxoneToHueConverter(context);
      expect(typeof converter).toBe('function');
    });

    it('should create converter for Switch', () => {
      const context = {
        lightType: 'Switch' as const,
        hueUuid: 'test-uuid'
      };

      const converter = LightConverterFactory.getLoxoneToHueConverter(context);
      const result = converter(1);

      expect(result.on).toEqual({ on: true });
    });

    it('should create converter for Dimmer', () => {
      const context = {
        lightType: 'Dimmer' as const,
        hueUuid: 'test-uuid'
      };

      const converter = LightConverterFactory.getLoxoneToHueConverter(context);
      const result = converter(75);

      expect(result.on).toEqual({ on: true });
      expect(result.dimming).toEqual({ brightness: 75 });
    });

    it('should create converter for ColorPickerV2 with HSV', () => {
      const context = {
        lightType: 'ColorPickerV2' as const,
        pickerSubtype: 'RGB' as const,
        hueUuid: 'test-uuid',
        capabilities: { supportsColor: true, supportsCt: false }
      };

      const converter = LightConverterFactory.getLoxoneToHueConverter(context);
      const result = converter('hsv(0,100,100)'); // Red at 100%

      expect(result.on).toEqual({ on: true });
      expect(result.dimming).toEqual({ brightness: 100 });
      expect(result.color).toBeDefined();
      expect(result.color?.xy).toBeDefined();
    });
  });

  describe('getHueToLoxoneConverter', () => {
    it('should return a converter function', () => {
      const context = {
        lightType: 'Switch' as const,
        hueUuid: 'test-uuid'
      };

      const converter = LightConverterFactory.getHueToLoxoneConverter(context);
      expect(typeof converter).toBe('function');
    });

    it('should create converter for Switch', () => {
      const context = {
        lightType: 'Switch' as const,
        hueUuid: 'test-uuid'
      };

      const converter = LightConverterFactory.getHueToLoxoneConverter(context);
      const result = converter({ on: { on: true } });

      expect(result).toBe(100);
    });

    it('should create converter for Dimmer', () => {
      const context = {
        lightType: 'Dimmer' as const,
        hueUuid: 'test-uuid'
      };

      const converter = LightConverterFactory.getHueToLoxoneConverter(context);
      const result = converter({ dimming: { brightness: 75 } });

      expect(result).toBe(75);
    });

    it('should create converter for ColorPickerV2 RGB with color', () => {
      const context = {
        lightType: 'ColorPickerV2' as const,
        pickerSubtype: 'RGB' as const,
        hueUuid: 'test-uuid'
      };

      const converter = LightConverterFactory.getHueToLoxoneConverter(context);
      const result = converter({
        color: { xy: { x: 0.6484, y: 0.3309 } },
        dimming: { brightness: 75 }
      });

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^hsv\(\d+,\d+,\d+\)$/);
    });
  });

  describe('inferContextFromLoxone', () => {
    it('should infer context for Switch', () => {
      const context = LightConverterFactory.inferContextFromLoxone('Switch');

      expect(context.lightType).toBe('Switch');
      expect(context.pickerSubtype).toBeUndefined();
    });

    it('should infer context for Dimmer', () => {
      const context = LightConverterFactory.inferContextFromLoxone('Dimmer');

      expect(context.lightType).toBe('Dimmer');
      expect(context.pickerSubtype).toBeUndefined();
    });

    it('should infer context for ColorPickerV2 without details', () => {
      const context = LightConverterFactory.inferContextFromLoxone('ColorPickerV2');

      expect(context.lightType).toBe('ColorPickerV2');
      expect(context.pickerSubtype).toBeUndefined();
    });

    it('should infer context for ColorPickerV2 with RGB subtype', () => {
      const context = LightConverterFactory.inferContextFromLoxone('ColorPickerV2', {
        pickerType: 'RGB'
      });

      expect(context.lightType).toBe('ColorPickerV2');
      expect(context.pickerSubtype).toBe('RGB');
    });

    it('should infer context for ColorPickerV2 with TunableWhite subtype', () => {
      const context = LightConverterFactory.inferContextFromLoxone('ColorPickerV2', {
        pickerType: 'TunableWhite'
      });

      expect(context.lightType).toBe('ColorPickerV2');
      expect(context.pickerSubtype).toBe('TunableWhite');
    });

    it('should infer context for ColorPickerV2 with Lumitech subtype', () => {
      const context = LightConverterFactory.inferContextFromLoxone('ColorPickerV2', {
        pickerType: 'Lumitech'
      });

      expect(context.lightType).toBe('ColorPickerV2');
      expect(context.pickerSubtype).toBe('Lumitech');
    });

    it('should ignore pickerType for non-ColorPickerV2 controls', () => {
      const context = LightConverterFactory.inferContextFromLoxone('Dimmer', {
        pickerType: 'RGB'
      });

      expect(context.lightType).toBe('Dimmer');
      expect(context.pickerSubtype).toBeUndefined();
    });
  });

  describe('createContext', () => {
    it('should create complete context for Switch', () => {
      const context = LightConverterFactory.createContext(
        'Switch',
        undefined,
        { supportsColor: false, supportsCt: false },
        'test-uuid-123'
      );

      expect(context.lightType).toBe('Switch');
      expect(context.pickerSubtype).toBeUndefined();
      expect(context.capabilities).toEqual({ supportsColor: false, supportsCt: false });
      expect(context.hueUuid).toBe('test-uuid-123');
    });

    it('should create complete context for ColorPickerV2 RGB', () => {
      const context = LightConverterFactory.createContext(
        'ColorPickerV2',
        { pickerType: 'RGB' },
        { supportsColor: true, supportsCt: false },
        'test-uuid-456'
      );

      expect(context.lightType).toBe('ColorPickerV2');
      expect(context.pickerSubtype).toBe('RGB');
      expect(context.capabilities).toEqual({ supportsColor: true, supportsCt: false });
      expect(context.hueUuid).toBe('test-uuid-456');
    });

    it('should create complete context for ColorPickerV2 Lumitech', () => {
      const context = LightConverterFactory.createContext(
        'ColorPickerV2',
        { pickerType: 'Lumitech' },
        { supportsColor: true, supportsCt: true, min: 153, max: 500 },
        'test-uuid-789'
      );

      expect(context.lightType).toBe('ColorPickerV2');
      expect(context.pickerSubtype).toBe('Lumitech');
      expect(context.capabilities).toEqual({
        supportsColor: true,
        supportsCt: true,
        min: 153,
        max: 500
      });
      expect(context.hueUuid).toBe('test-uuid-789');
    });

    it('should handle empty control details', () => {
      const context = LightConverterFactory.createContext(
        'ColorPickerV2',
        {},
        { supportsColor: true, supportsCt: false },
        'test-uuid'
      );

      expect(context.lightType).toBe('ColorPickerV2');
      expect(context.pickerSubtype).toBeUndefined();
    });
  });
});
