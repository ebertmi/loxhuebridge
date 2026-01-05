/**
 * XML Generator Utility
 * Generates Loxone-compatible XML configuration files
 * 
 * Supports:
 * - Virtual Outputs for light controls
 * - Virtual Inputs for sensors and buttons
 * - Virtual Outputs for scenes
 */

import { DeviceMapping } from '../types';

/**
 * Scene structure for XML generation
 */
interface SceneForXML {
  uuid: string;
  name: string;
  group?: {
    name: string;
  };
  lightCount: number;
}

/**
 * Generates XML for Loxone Virtual Outputs (lights control)
 */
export function generateOutputsXML(lights: DeviceMapping[], serverIp: string, serverPort: number): string {
  const xmlParts = [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<VirtualOut Title="LoxHueBridge Lights" Address="http://${serverIp}:${serverPort}" CmdInit="" CloseAfterSend="true" CmdSep=";">`,
    '\t<Info templateType="3" minVersion="16011106"/>'
  ];

  lights.forEach(light => {
    const title = light.loxone_name.charAt(0).toUpperCase() +
                 light.loxone_name.slice(1) + " (Hue)";

    xmlParts.push(
      `\t<VirtualOutCmd Title="${escapeXml(title)}" ` +
      `Comment="${escapeXml(light.hue_name)}" ` +
      `CmdOn="/${light.loxone_name}/<v>" Analog="true"/>`
    );
  });

  xmlParts.push('</VirtualOut>');

  return xmlParts.join('\n');
}

/**
 * Generates XML for Loxone Virtual Inputs (sensors and buttons)
 */
export function generateInputsXML(sensors: DeviceMapping[], udpPort: number): string {
  const xmlParts = [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<VirtualInUdp Title="LoxHueBridge Sensors" Port="${udpPort}">`,
    '\t<Info templateType="1" minVersion="16011106"/>'
  ];

  sensors.forEach(sensor => {
    const name = sensor.loxone_name;
    const title = name.charAt(0).toUpperCase() + name.slice(1);

    if (sensor.hue_type === 'sensor') {
      // Motion sensor
      xmlParts.push(
        `\t<VirtualInUdpCmd Title="${escapeXml(title)} Motion" ` +
        `Check="hue.${name}.motion \\v" Analog="true" ` +
        `DefVal="0" MinVal="0" MaxVal="1" Unit="&lt;v&gt;"/>`
      );

      // Light level (Lux)
      xmlParts.push(
        `\t<VirtualInUdpCmd Title="${escapeXml(title)} Lux" ` +
        `Check="hue.${name}.lux \\v" Analog="true" ` +
        `DefVal="0" MinVal="0" MaxVal="65000" Unit="&lt;v&gt; lx"/>`
      );

      // Temperature
      xmlParts.push(
        `\t<VirtualInUdpCmd Title="${escapeXml(title)} Temp" ` +
        `Check="hue.${name}.temp \\v" Analog="true" ` +
        `DefVal="0" MinVal="-50" MaxVal="100" Unit="&lt;v.1&gt; °C"/>`
      );

      // Battery
      xmlParts.push(
        `\t<VirtualInUdpCmd Title="${escapeXml(title)} Battery" ` +
        `Check="hue.${name}.bat \\v" Analog="true" ` +
        `DefVal="0" MinVal="0" MaxVal="100" Unit="&lt;v&gt; %"/>`
      );
    } else if (sensor.hue_type === 'button') {
      // Button event
      xmlParts.push(
        `\t<VirtualInUdpCmd Title="${escapeXml(title)} Event" ` +
        `Check="hue.${name}.button \\v" Analog="false"/>`
      );

      // Rotary encoder (if name suggests it's a dial/rotary)
      if (sensor.hue_name.includes("Dreh") ||
          sensor.hue_name.includes("Rotary") ||
          sensor.hue_name.includes("Dial")) {

        xmlParts.push(
          `\t<VirtualInUdpCmd Title="${escapeXml(title)} Rotary CW" ` +
          `Check="hue.${name}.rotary cw" Analog="false"/>`
        );

        xmlParts.push(
          `\t<VirtualInUdpCmd Title="${escapeXml(title)} Rotary CCW" ` +
          `Check="hue.${name}.rotary ccw" Analog="false"/>`
        );
      }
    }
  });

  xmlParts.push('</VirtualInUdp>');

  return xmlParts.join('\n');
}

/**
 * Generate Loxone VirtualOut XML for Hue scenes
 */
export function generateScenesXML(scenes: SceneForXML[], serverIp: string, serverPort: number): string {
  const xmlParts = [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<VirtualOut Title="LoxHueBridge Scenes" Address="http://${serverIp}:${serverPort}" CmdInit="" CloseAfterSend="true" CmdSep=";">`,
    '\t<Info templateType="3" minVersion="16011106"/>'
  ];

  // Add generic scene command (use with Status block)
  xmlParts.push(
    `\t<VirtualOutCmd Title="Scene (Generic)" ` +
    `Comment="Use with Status block - pass scene UUID as value" ` +
    `CmdOn="/scene/<v>/on" ` +
    `CmdOff="/scene/<v>/off" ` +
    `Analog="false"/>`
  );

  scenes.forEach(scene => {
    const title = `${scene.name} (Scene)`;
    const comment = scene.group
      ? `${scene.group.name} - ${scene.lightCount} lights`
      : `${scene.lightCount} lights`;

    // Scene activation command (on/off)
    xmlParts.push(
      `\t<VirtualOutCmd Title="${escapeXml(title)}" ` +
      `Comment="${escapeXml(comment)}" ` +
      `CmdOn="/scene/${scene.uuid}/on" ` +
      `CmdOff="/scene/${scene.uuid}/off" ` +
      `Analog="false"/>`
    );
  });

  xmlParts.push('</VirtualOut>');
  return xmlParts.join('\n');
}

/**
 * Escapes special XML characters
 */
export function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
