/**
 * Unit Tests for XML Generator Utility
 * Tests Loxone XML configuration generation in src/utils/xml-generator.ts
 */

import {
  generateOutputsXML,
  generateInputsXML,
  generateScenesXML,
  escapeXml
} from '../../../src/utils/xml-generator';
import { DeviceMapping } from '../../../src/types';

describe('XML Generator Utility', () => {
  describe('escapeXml()', () => {
    it('should escape ampersand', () => {
      expect(escapeXml('A & B')).toBe('A &amp; B');
    });

    it('should escape less-than', () => {
      expect(escapeXml('A < B')).toBe('A &lt; B');
    });

    it('should escape greater-than', () => {
      expect(escapeXml('A > B')).toBe('A &gt; B');
    });

    it('should escape double quotes', () => {
      expect(escapeXml('Say "hello"')).toBe('Say &quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeXml("It's here")).toBe('It&apos;s here');
    });

    it('should escape multiple special characters', () => {
      const input = '<tag attr="value">A & B</tag>';
      const expected = '&lt;tag attr=&quot;value&quot;&gt;A &amp; B&lt;/tag&gt;';

      expect(escapeXml(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      expect(escapeXml('')).toBe('');
    });

    it('should handle string without special characters', () => {
      expect(escapeXml('Hello World')).toBe('Hello World');
    });

    it('should handle numbers converted to string', () => {
      expect(escapeXml('123')).toBe('123');
    });
  });

  describe('generateOutputsXML()', () => {
    const serverIp = '192.168.1.100';
    const serverPort = 3000;

    it('should generate XML header and footer', () => {
      const lights: DeviceMapping[] = [];
      const xml = generateOutputsXML(lights, serverIp, serverPort);

      expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(xml).toContain('<VirtualOut');
      expect(xml).toContain('</VirtualOut>');
      expect(xml).toContain(`Address="http://${serverIp}:${serverPort}"`);
    });

    it('should include template info', () => {
      const lights: DeviceMapping[] = [];
      const xml = generateOutputsXML(lights, serverIp, serverPort);

      expect(xml).toContain('<Info templateType="3" minVersion="16011106"/>');
    });

    it('should generate XML for single light', () => {
      const lights: DeviceMapping[] = [
        {
          loxone_name: 'livingroom',
          hue_uuid: 'hue-123',
          hue_name: 'Living Room Light',
          hue_type: 'light'
        }
      ];

      const xml = generateOutputsXML(lights, serverIp, serverPort);

      expect(xml).toContain('Title="Livingroom (Hue)"');
      expect(xml).toContain('Comment="Living Room Light"');
      expect(xml).toContain('CmdOn="/livingroom/<v>"');
      expect(xml).toContain('Analog="true"');
    });

    it('should generate XML for multiple lights', () => {
      const lights: DeviceMapping[] = [
        {
          loxone_name: 'light1',
          hue_uuid: 'hue-1',
          hue_name: 'Light 1',
          hue_type: 'light'
        },
        {
          loxone_name: 'light2',
          hue_uuid: 'hue-2',
          hue_name: 'Light 2',
          hue_type: 'light'
        },
        {
          loxone_name: 'light3',
          hue_uuid: 'hue-3',
          hue_name: 'Light 3',
          hue_type: 'light'
        }
      ];

      const xml = generateOutputsXML(lights, serverIp, serverPort);

      expect(xml).toContain('light1');
      expect(xml).toContain('light2');
      expect(xml).toContain('light3');
      expect(xml.match(/<VirtualOutCmd/g)?.length).toBe(3);
    });

    it('should capitalize first letter of loxone_name', () => {
      const lights: DeviceMapping[] = [
        {
          loxone_name: 'bedroom',
          hue_uuid: 'hue-1',
          hue_name: 'Bedroom Light',
          hue_type: 'light'
        }
      ];

      const xml = generateOutputsXML(lights, serverIp, serverPort);

      expect(xml).toContain('Title="Bedroom (Hue)"');
    });

    it('should escape special characters in names', () => {
      const lights: DeviceMapping[] = [
        {
          loxone_name: 'test',
          hue_uuid: 'hue-1',
          hue_name: 'Light & Lamp "Special"',
          hue_type: 'light'
        }
      ];

      const xml = generateOutputsXML(lights, serverIp, serverPort);

      expect(xml).toContain('Light &amp; Lamp &quot;Special&quot;');
    });

    it('should handle empty lights array', () => {
      const lights: DeviceMapping[] = [];
      const xml = generateOutputsXML(lights, serverIp, serverPort);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<VirtualOut');
      expect(xml).toContain('</VirtualOut>');
      expect(xml.match(/<VirtualOutCmd/g)).toBeNull();
    });

    it('should set correct VirtualOut title', () => {
      const lights: DeviceMapping[] = [];
      const xml = generateOutputsXML(lights, serverIp, serverPort);

      expect(xml).toContain('Title="LoxHueBridge Lights"');
    });

    it('should set CloseAfterSend flag', () => {
      const lights: DeviceMapping[] = [];
      const xml = generateOutputsXML(lights, serverIp, serverPort);

      expect(xml).toContain('CloseAfterSend="true"');
    });

    it('should use correct separator', () => {
      const lights: DeviceMapping[] = [];
      const xml = generateOutputsXML(lights, serverIp, serverPort);

      expect(xml).toContain('CmdSep=";"');
    });
  });

  describe('generateInputsXML()', () => {
    const udpPort = 7000;

    it('should generate XML header and footer', () => {
      const sensors: DeviceMapping[] = [];
      const xml = generateInputsXML(sensors, udpPort);

      expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(xml).toContain('<VirtualInUdp');
      expect(xml).toContain('</VirtualInUdp>');
      expect(xml).toContain(`Port="${udpPort}"`);
    });

    it('should include template info', () => {
      const sensors: DeviceMapping[] = [];
      const xml = generateInputsXML(sensors, udpPort);

      expect(xml).toContain('<Info templateType="1" minVersion="16011106"/>');
    });

    it('should generate inputs for motion sensor', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'hallway',
          hue_uuid: 'sensor-1',
          hue_name: 'Hallway Motion',
          hue_type: 'sensor'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      // Should have motion, lux, temp, and battery
      expect(xml).toContain('Title="Hallway Motion"');
      expect(xml).toContain('Check="hue.hallway.motion \\v"');
      expect(xml).toContain('Title="Hallway Lux"');
      expect(xml).toContain('Check="hue.hallway.lux \\v"');
      expect(xml).toContain('Title="Hallway Temp"');
      expect(xml).toContain('Check="hue.hallway.temp \\v"');
      expect(xml).toContain('Title="Hallway Battery"');
      expect(xml).toContain('Check="hue.hallway.bat \\v"');
    });

    it('should set correct analog flags for sensor', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'sensor1',
          hue_uuid: 'sensor-1',
          hue_name: 'Sensor 1',
          hue_type: 'sensor'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      // All sensor readings should be analog
      expect(xml).toMatch(/Analog="true"/g);
    });

    it('should set correct ranges for sensor values', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'test',
          hue_uuid: 'sensor-1',
          hue_name: 'Test Sensor',
          hue_type: 'sensor'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      // Motion: 0-1
      expect(xml).toContain('MinVal="0" MaxVal="1"');
      // Lux: 0-65000
      expect(xml).toContain('MinVal="0" MaxVal="65000"');
      // Temperature: -50 to 100
      expect(xml).toContain('MinVal="-50" MaxVal="100"');
      // Battery: 0-100
      expect(xml).toContain('MinVal="0" MaxVal="100"');
    });

    it('should generate input for button', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'switch1',
          hue_uuid: 'button-1',
          hue_name: 'Dimmer Switch',
          hue_type: 'button'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      expect(xml).toContain('Title="Switch1 Event"');
      expect(xml).toContain('Check="hue.switch1.button \\v"');
      expect(xml).toContain('Analog="false"');
    });

    it('should generate rotary inputs for dial/rotary buttons', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'dial1',
          hue_uuid: 'button-1',
          hue_name: 'Rotary Switch',
          hue_type: 'button'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      expect(xml).toContain('Rotary CW');
      expect(xml).toContain('Rotary CCW');
      expect(xml).toContain('Check="hue.dial1.rotary cw"');
      expect(xml).toContain('Check="hue.dial1.rotary ccw"');
    });

    it('should detect German "Dreh" in button name for rotary', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'switch1',
          hue_uuid: 'button-1',
          hue_name: 'Dreh Dimmer',
          hue_type: 'button'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      expect(xml).toContain('Rotary CW');
      expect(xml).toContain('Rotary CCW');
    });

    it('should detect "Dial" in button name for rotary', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'dial1',
          hue_uuid: 'button-1',
          hue_name: 'Smart Dial',
          hue_type: 'button'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      expect(xml).toContain('Rotary CW');
      expect(xml).toContain('Rotary CCW');
    });

    it('should capitalize first letter of sensor name', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'kitchen',
          hue_uuid: 'sensor-1',
          hue_name: 'Kitchen Sensor',
          hue_type: 'sensor'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      expect(xml).toContain('Title="Kitchen Motion"');
      expect(xml).toContain('Title="Kitchen Lux"');
    });

    it('should handle mixed sensor and button types', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'motion1',
          hue_uuid: 'sensor-1',
          hue_name: 'Motion 1',
          hue_type: 'sensor'
        },
        {
          loxone_name: 'button1',
          hue_uuid: 'button-1',
          hue_name: 'Button 1',
          hue_type: 'button'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      expect(xml).toContain('Motion1 Motion');
      expect(xml).toContain('Motion1 Lux');
      expect(xml).toContain('Button1 Event');
    });

    it('should escape special characters in sensor names', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'test&special',
          hue_uuid: 'sensor-1',
          hue_name: 'Sensor & Device "Special"',
          hue_type: 'sensor'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      // Check that title is capitalized and escaped
      expect(xml).toContain('Test&amp;special');
    });

    it('should handle empty sensors array', () => {
      const sensors: DeviceMapping[] = [];
      const xml = generateInputsXML(sensors, udpPort);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<VirtualInUdp');
      expect(xml).toContain('</VirtualInUdp>');
      expect(xml.match(/<VirtualInUdpCmd/g)).toBeNull();
    });

    it('should set correct units for sensor values', () => {
      const sensors: DeviceMapping[] = [
        {
          loxone_name: 'test',
          hue_uuid: 'sensor-1',
          hue_name: 'Test',
          hue_type: 'sensor'
        }
      ];

      const xml = generateInputsXML(sensors, udpPort);

      expect(xml).toContain('Unit="&lt;v&gt; lx"'); // Lux
      expect(xml).toContain('Unit="&lt;v.1&gt; °C"'); // Temperature
      expect(xml).toContain('Unit="&lt;v&gt; %"'); // Battery
    });
  });

  describe('generateScenesXML()', () => {
    const serverIp = '192.168.1.100';
    const serverPort = 3000;

    it('should generate XML header and footer', () => {
      const scenes: any[] = [];
      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(xml).toContain('<VirtualOut');
      expect(xml).toContain('</VirtualOut>');
      expect(xml).toContain(`Address="http://${serverIp}:${serverPort}"`);
    });

    it('should include template info', () => {
      const scenes: any[] = [];
      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('<Info templateType="3" minVersion="16011106"/>');
    });

    it('should include generic scene command', () => {
      const scenes: any[] = [];
      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('Title="Scene (Generic)"');
      expect(xml).toContain('CmdOn="/scene/<v>/on"');
      expect(xml).toContain('CmdOff="/scene/<v>/off"');
      expect(xml).toContain('Analog="false"');
    });

    it('should generate XML for single scene', () => {
      const scenes = [
        {
          uuid: 'scene-123',
          name: 'Evening',
          lightCount: 5
        }
      ];

      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('Title="Evening (Scene)"');
      expect(xml).toContain('Comment="5 lights"');
      expect(xml).toContain('CmdOn="/scene/scene-123/on"');
      expect(xml).toContain('CmdOff="/scene/scene-123/off"');
    });

    it('should generate XML for multiple scenes', () => {
      const scenes = [
        {
          uuid: 'scene-1',
          name: 'Morning',
          lightCount: 3
        },
        {
          uuid: 'scene-2',
          name: 'Evening',
          lightCount: 5
        },
        {
          uuid: 'scene-3',
          name: 'Night',
          lightCount: 2
        }
      ];

      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('Morning (Scene)');
      expect(xml).toContain('Evening (Scene)');
      expect(xml).toContain('Night (Scene)');
      // +1 for generic scene command
      expect(xml.match(/<VirtualOutCmd/g)?.length).toBe(4);
    });

    it('should include group name in comment if available', () => {
      const scenes = [
        {
          uuid: 'scene-1',
          name: 'Bright',
          group: {
            name: 'Living Room'
          },
          lightCount: 4
        }
      ];

      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('Comment="Living Room - 4 lights"');
    });

    it('should not include group name if not available', () => {
      const scenes = [
        {
          uuid: 'scene-1',
          name: 'Bright',
          lightCount: 4
        }
      ];

      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('Comment="4 lights"');
      // Check that scene comment doesn't have group name
      expect(xml).toContain('Title="Bright (Scene)" Comment="4 lights"');
    });

    it('should escape special characters in scene names', () => {
      const scenes = [
        {
          uuid: 'scene-1',
          name: 'Scene & Effect "Special"',
          lightCount: 3
        }
      ];

      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('Scene &amp; Effect &quot;Special&quot;');
    });

    it('should escape special characters in group names', () => {
      const scenes = [
        {
          uuid: 'scene-1',
          name: 'Scene',
          group: {
            name: 'Room & Area "1"'
          },
          lightCount: 2
        }
      ];

      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('Room &amp; Area &quot;1&quot;');
    });

    it('should set analog to false for scenes', () => {
      const scenes = [
        {
          uuid: 'scene-1',
          name: 'Test',
          lightCount: 1
        }
      ];

      const xml = generateScenesXML(scenes, serverIp, serverPort);

      // Check that all VirtualOutCmd have Analog="false"
      const matches = xml.match(/Analog="false"/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(2); // Generic + 1 scene
    });

    it('should handle scene with zero lights', () => {
      const scenes = [
        {
          uuid: 'scene-1',
          name: 'Empty',
          lightCount: 0
        }
      ];

      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('Comment="0 lights"');
    });

    it('should handle empty scenes array', () => {
      const scenes: any[] = [];
      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<VirtualOut');
      expect(xml).toContain('</VirtualOut>');
      // Should still have generic scene command
      expect(xml).toContain('Scene (Generic)');
    });

    it('should set correct VirtualOut title', () => {
      const scenes: any[] = [];
      const xml = generateScenesXML(scenes, serverIp, serverPort);

      expect(xml).toContain('Title="LoxHueBridge Scenes"');
    });
  });

  describe('XML Formatting', () => {
    it('should use tabs for indentation in outputs XML', () => {
      const lights: DeviceMapping[] = [
        {
          loxone_name: 'test',
          hue_uuid: 'hue-1',
          hue_name: 'Test',
          hue_type: 'light'
        }
      ];

      const xml = generateOutputsXML(lights, '127.0.0.1', 3000);

      expect(xml).toContain('\t<Info');
      expect(xml).toContain('\t<VirtualOutCmd');
    });

    it('should use newlines to separate elements', () => {
      const lights: DeviceMapping[] = [
        {
          loxone_name: 'light1',
          hue_uuid: 'hue-1',
          hue_name: 'Light 1',
          hue_type: 'light'
        },
        {
          loxone_name: 'light2',
          hue_uuid: 'hue-2',
          hue_name: 'Light 2',
          hue_type: 'light'
        }
      ];

      const xml = generateOutputsXML(lights, '127.0.0.1', 3000);
      const lines = xml.split('\n');

      expect(lines.length).toBeGreaterThan(1);
      expect(lines[0]).toContain('<?xml version');
    });

    it('should produce valid XML structure', () => {
      const lights: DeviceMapping[] = [
        {
          loxone_name: 'test',
          hue_uuid: 'hue-1',
          hue_name: 'Test',
          hue_type: 'light'
        }
      ];

      const xml = generateOutputsXML(lights, '127.0.0.1', 3000);

      // Check basic XML structure
      expect(xml).toMatch(/^<\?xml version/);
      expect(xml).toMatch(/<VirtualOut[^>]*>/);
      expect(xml).toMatch(/<\/VirtualOut>$/);
    });
  });
});
