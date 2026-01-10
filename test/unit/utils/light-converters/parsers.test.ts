/**
 * Tests for Light Converter Parsers
 */

import {
  parseLoxoneHsv,
  parseLoxoneTemp,
  parseSmartActuator,
  parseRGB,
  detectLoxoneFormat,
  isValidLoxoneFormat
} from '../../../../src/utils/light-converters/parsers';

describe('parseLoxoneHsv', () => {
  it('should parse valid HSV format', () => {
    expect(parseLoxoneHsv('hsv(180,50,75)')).toEqual({ h: 180, s: 50, v: 75 });
    expect(parseLoxoneHsv('hsv(0,0,0)')).toEqual({ h: 0, s: 0, v: 0 });
    expect(parseLoxoneHsv('hsv(360,100,100)')).toEqual({ h: 360, s: 100, v: 100 });
  });

  it('should parse HSV with decimal values', () => {
    expect(parseLoxoneHsv('hsv(180.5,50.5,75.5)')).toEqual({ h: 180.5, s: 50.5, v: 75.5 });
  });

  it('should handle whitespace', () => {
    expect(parseLoxoneHsv('  hsv(180,50,75)  ')).toEqual({ h: 180, s: 50, v: 75 });
  });

  it('should return null for invalid format', () => {
    expect(parseLoxoneHsv('invalid')).toBeNull();
    expect(parseLoxoneHsv('hsv(180,50)')).toBeNull();  // Missing value
    expect(parseLoxoneHsv('hsv(180 50 75)')).toBeNull();  // Missing commas
    expect(parseLoxoneHsv('(180,50,75)')).toBeNull();  // Missing hsv prefix
  });

  it('should return null for out-of-range values', () => {
    expect(parseLoxoneHsv('hsv(-1,50,75)')).toBeNull();  // h < 0
    expect(parseLoxoneHsv('hsv(361,50,75)')).toBeNull();  // h > 360
    expect(parseLoxoneHsv('hsv(180,-1,75)')).toBeNull();  // s < 0
    expect(parseLoxoneHsv('hsv(180,101,75)')).toBeNull();  // s > 100
    expect(parseLoxoneHsv('hsv(180,50,-1)')).toBeNull();  // v < 0
    expect(parseLoxoneHsv('hsv(180,50,101)')).toBeNull();  // v > 100
  });
});

describe('parseLoxoneTemp', () => {
  it('should parse valid temp format', () => {
    expect(parseLoxoneTemp('temp(75,4000)')).toEqual({ val: 75, kelvin: 4000 });
    expect(parseLoxoneTemp('temp(0,2000)')).toEqual({ val: 0, kelvin: 2000 });
    expect(parseLoxoneTemp('temp(100,6500)')).toEqual({ val: 100, kelvin: 6500 });
  });

  it('should parse temp with decimal values', () => {
    expect(parseLoxoneTemp('temp(75.5,4000.5)')).toEqual({ val: 75.5, kelvin: 4000.5 });
  });

  it('should handle whitespace', () => {
    expect(parseLoxoneTemp('  temp(75,4000)  ')).toEqual({ val: 75, kelvin: 4000 });
  });

  it('should return null for invalid format', () => {
    expect(parseLoxoneTemp('invalid')).toBeNull();
    expect(parseLoxoneTemp('temp(75)')).toBeNull();  // Missing kelvin
    expect(parseLoxoneTemp('temp(75 4000)')).toBeNull();  // Missing comma
    expect(parseLoxoneTemp('(75,4000)')).toBeNull();  // Missing temp prefix
  });

  it('should return null for out-of-range values', () => {
    expect(parseLoxoneTemp('temp(-1,4000)')).toBeNull();  // val < 0
    expect(parseLoxoneTemp('temp(101,4000)')).toBeNull();  // val > 100
    expect(parseLoxoneTemp('temp(75,1999)')).toBeNull();  // kelvin < 2000
    expect(parseLoxoneTemp('temp(75,6501)')).toBeNull();  // kelvin > 6500
  });
});

describe('parseSmartActuator', () => {
  it('should parse valid Smart Actuator format', () => {
    expect(parseSmartActuator(201002700)).toEqual({ brightness: 10, kelvin: 2700 });
    expect(parseSmartActuator(201004000)).toEqual({ brightness: 10, kelvin: 4000 });
    expect(parseSmartActuator(200002700)).toEqual({ brightness: 0, kelvin: 2700 });
    expect(parseSmartActuator(2010002700)).toEqual({ brightness: 100, kelvin: 2700 });
  });

  it('should return null for invalid format', () => {
    expect(parseSmartActuator(123)).toBeNull();  // Too short
    expect(parseSmartActuator(301002700)).toBeNull();  // Doesn't start with 20
    expect(parseSmartActuator(19002700)).toBeNull();  // Doesn't start with 20
  });

  it('should return null for out-of-range values', () => {
    expect(parseSmartActuator(2015001999)).toBeNull();  // kelvin < 2000
    expect(parseSmartActuator(2015006501)).toBeNull();  // kelvin > 6500
  });
});

describe('parseRGB', () => {
  it('should parse valid RGB format', () => {
    // Format: R + G*1000 + B*1000000
    expect(parseRGB(100050025)).toEqual({ r: 25, g: 50, b: 100 });
    expect(parseRGB(255255255)).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseRGB(0)).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseRGB(1000000)).toEqual({ r: 0, g: 0, b: 1 });  // Only blue
    expect(parseRGB(1000)).toEqual({ r: 0, g: 1, b: 0 });  // Only green
    expect(parseRGB(1)).toEqual({ r: 1, g: 0, b: 0 });  // Only red
  });

  it('should return null for negative values', () => {
    expect(parseRGB(-1)).toBeNull();
  });

  it('should return null for out-of-range RGB components', () => {
    expect(parseRGB(256)).toBeNull();  // r > 255
    expect(parseRGB(256000)).toBeNull();  // g > 255
    expect(parseRGB(256000000)).toBeNull();  // b > 255
  });
});

describe('detectLoxoneFormat', () => {
  describe('string formats', () => {
    it('should detect hsv format', () => {
      expect(detectLoxoneFormat('hsv(180,50,75)')).toBe('hsv');
    });

    it('should detect temp format', () => {
      expect(detectLoxoneFormat('temp(75,4000)')).toBe('temp');
    });

    it('should detect numeric string as numeric format', () => {
      expect(detectLoxoneFormat('50')).toBe('numeric-dimmer');
      expect(detectLoxoneFormat('1')).toBe('numeric-switch');
    });

    it('should return unknown for invalid strings', () => {
      expect(detectLoxoneFormat('invalid')).toBe('unknown');
      expect(detectLoxoneFormat('hsv(400,50,75)')).toBe('unknown');  // Invalid h
    });
  });

  describe('numeric formats', () => {
    it('should detect smart actuator format', () => {
      expect(detectLoxoneFormat(201002700)).toBe('numeric-smart-actuator');
      expect(detectLoxoneFormat(2010002700)).toBe('numeric-smart-actuator');
    });

    it('should detect RGB format', () => {
      expect(detectLoxoneFormat(100050025)).toBe('numeric-rgb');
      expect(detectLoxoneFormat(255255255)).toBe('numeric-rgb');
    });

    it('should detect switch format', () => {
      expect(detectLoxoneFormat(0)).toBe('numeric-switch');
      expect(detectLoxoneFormat(1)).toBe('numeric-switch');
    });

    it('should detect dimmer format', () => {
      expect(detectLoxoneFormat(50)).toBe('numeric-dimmer');
      expect(detectLoxoneFormat(100)).toBe('numeric-dimmer');
      expect(detectLoxoneFormat(2)).toBe('numeric-dimmer');
    });

    it('should accept out-of-range dimmer values up to 200', () => {
      // Accept slightly out-of-range values (will be clamped by converter)
      expect(detectLoxoneFormat(150)).toBe('numeric-dimmer');
      expect(detectLoxoneFormat(200)).toBe('numeric-dimmer');
    });

    it('should prioritize smart actuator over RGB for ambiguous values', () => {
      // Value that could be either format - smart actuator is checked first
      expect(detectLoxoneFormat(201002700)).toBe('numeric-smart-actuator');
    });

    it('should return unknown for invalid numeric values', () => {
      expect(detectLoxoneFormat(-1)).toBe('unknown');
      expect(detectLoxoneFormat(256)).toBe('unknown');  // Invalid for dimmer and switch
    });
  });
});

describe('isValidLoxoneFormat', () => {
  it('should return true for valid formats', () => {
    expect(isValidLoxoneFormat('hsv(180,50,75)')).toBe(true);
    expect(isValidLoxoneFormat('temp(75,4000)')).toBe(true);
    expect(isValidLoxoneFormat(201002700)).toBe(true);
    expect(isValidLoxoneFormat(100050025)).toBe(true);
    expect(isValidLoxoneFormat(50)).toBe(true);
    expect(isValidLoxoneFormat(0)).toBe(true);
  });

  it('should return false for invalid formats', () => {
    expect(isValidLoxoneFormat('invalid')).toBe(false);
    expect(isValidLoxoneFormat(-1)).toBe(false);
    expect(isValidLoxoneFormat('hsv(400,50,75)')).toBe(false);
  });
});
