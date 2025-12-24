/**
 * XML Generator Utility
 * Generates Loxone-compatible XML configuration files
 */

/**
 * Generates XML for Loxone Virtual Outputs (lights control)
 * @param {Array} lights - Array of light mappings
 * @param {string} serverIp - Server IP address
 * @param {number} serverPort - Server port
 * @returns {string} XML string
 */
function generateOutputsXML(lights, serverIp, serverPort) {
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
 * @param {Array} sensors - Array of sensor/button mappings
 * @param {number} udpPort - UDP port number
 * @returns {string} XML string
 */
function generateInputsXML(sensors, udpPort) {
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
 * Escapes special XML characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

module.exports = {
    generateOutputsXML,
    generateInputsXML,
    escapeXml
};
