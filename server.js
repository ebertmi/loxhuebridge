require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const path = require('path');
const dgram = require('dgram');

// --- KONFIGURATION ---
// ÄNDERUNG: Port aus .env laden
const PORT = parseInt(process.env.HTTP_PORT || "8555");
const DEBUG = process.env.DEBUG === 'true';

const BRIDGE_IP = process.env.HUE_BRIDGE_IP;
const APP_KEY = process.env.HUE_APP_KEY;
const LOXONE_IP = process.env.LOXONE_IP;
const LOXONE_UDP_PORT = parseInt(process.env.LOXONE_UDP_PORT || "7000");

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// --- LOGGER & BUFFER ---
const logBuffer = []; 
const MAX_LOGS = 50;

const getTime = () => new Date().toLocaleTimeString();

function addToLogBuffer(level, msg) {
    const entry = { time: getTime(), level: level, msg: msg };
    logBuffer.unshift(entry);
    if (logBuffer.length > MAX_LOGS) logBuffer.pop();
}

const log = {
    info:    (msg) => { console.log(`ℹ️  [${getTime()}] INFO:    ${msg}`); addToLogBuffer('INFO', msg); },
    success: (msg) => { console.log(`✅  [${getTime()}] SUCCESS: ${msg}`); addToLogBuffer('SUCCESS', msg); },
    warn:    (msg) => { console.log(`⚠️  [${getTime()}] WARN:    ${msg}`); addToLogBuffer('WARN', msg); },
    error:   (msg) => { console.error(`❌ [${getTime()}] ERROR:   ${msg}`); addToLogBuffer('ERROR', msg); },
    debug:   (msg) => { 
        if (DEBUG) {
            console.log(`🐛 [${getTime()}] DEBUG:   ${msg}`); 
            addToLogBuffer('DEBUG', msg);
        }
    },
    hueError: (error) => {
        const status = error.response ? error.response.status : 'Network Error';
        console.error(`❌ [${getTime()}] HUE ERROR! Status: ${status}`);
        addToLogBuffer('ERROR', `HUE ERROR! Status: ${status}`);
    }
};

// --- UDP SENDER ---
const udpClient = dgram.createSocket('udp4');

function sendToLoxone(baseName, suffix, value) {
    if (!LOXONE_IP) return;
    const message = `hue.${baseName}.${suffix} ${value}`;
    const buffer = Buffer.from(message);
    
    udpClient.send(buffer, LOXONE_UDP_PORT, LOXONE_IP, (err) => {
        if (err) log.error(`UDP Fehler: ${err}`);
        else if(DEBUG) console.log(`UDP >> ${message}`); 
    });
}

// --- DATEN & CACHES ---
let mapping = [];       
let detectedItems = []; 
let serviceToDeviceMap = {}; 
let statusCache = {};        

function loadMapping() {
    try {
        if (fs.existsSync('mapping.json')) {
            const raw = JSON.parse(fs.readFileSync('mapping.json'));
            mapping = raw.filter(m => m.loxone_name);
            log.info(`Mapping geladen: ${mapping.length} Einträge.`);
        }
    } catch (e) { mapping = []; }
}
loadMapping();

// --- HELFER ---
function kelvinToMirek(k) { if (k < 2000) return 500; return Math.round(1000000/k); }
function rgbToXy(r, g, b) {
    let red = r / 100; let green = g / 100; let blue = b / 100;
    red = (red > 0.04045) ? Math.pow((red + 0.055) / 1.055, 2.4) : (red / 12.92);
    green = (green > 0.04045) ? Math.pow((green + 0.055) / 1.055, 2.4) : (green / 12.92);
    blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / 1.055, 2.4) : (blue / 12.92);
    let X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
    let Y = red * 0.283881 + green * 0.729798 + blue * 0.065885;
    let Z = red * 0.000088 + green * 0.077053 + blue * 0.950255;
    let sum = X + Y + Z;
    if (sum === 0) return { x: 0, y: 0 };
    return { x: Number((X / sum).toFixed(4)), y: Number((Y / sum).toFixed(4)) };
}
function hueLightToLux(value) { return Math.round(Math.pow(10, (value - 1) / 10000)); }

// --- GERÄTE LOGIK ---
async function buildDeviceMap() {
    try {
        const res = await axios.get(`https://${BRIDGE_IP}/clip/v2/resource/device`, { headers: { 'hue-application-key': APP_KEY }, httpsAgent });
        const devices = res.data.data;
        serviceToDeviceMap = {}; 
        
        devices.forEach(dev => {
            dev.services.forEach(svc => {
                serviceToDeviceMap[svc.rid] = {
                    deviceId: dev.id,
                    deviceName: dev.metadata.name,
                    serviceType: svc.rtype
                };
            });
        });
        log.info(`Device Map aufgebaut: ${Object.keys(serviceToDeviceMap).length} Services.`);
    } catch (e) { log.error("DeviceMap Fehler: " + e.message); }
}

// --- STATUS UPDATE ---
function updateStatus(loxName, key, val) {
    if (!statusCache[loxName]) statusCache[loxName] = {};
    if (statusCache[loxName][key] !== val) {
        statusCache[loxName][key] = val;
        sendToLoxone(loxName, key, val);
        if(DEBUG) process.stdout.write(` > ${loxName}.${key}=${val} `);
    }
}

// --- EVENT PROZESSOR ---
function findMappingForService(serviceId) {
    let entry = mapping.find(m => m.hue_uuid === serviceId);
    if (entry) return entry.loxone_name;

    const deviceMeta = serviceToDeviceMap[serviceId];
    if (deviceMeta) {
        entry = mapping.find(m => {
            const mappedMeta = serviceToDeviceMap[m.hue_uuid];
            return mappedMeta && mappedMeta.deviceId === deviceMeta.deviceId;
        });
        if (entry) return entry.loxone_name;
    }
    return null;
}

function processHueEvents(events) {
    events.forEach(evt => {
        if (evt.type === 'update' || evt.type === 'add') {
            evt.data.forEach(d => {
                const serviceId = d.id;
                const loxName = findMappingForService(serviceId);

                if (loxName) {
                    if (d.motion && d.motion.motion !== undefined) updateStatus(loxName, 'motion', d.motion.motion ? 1 : 0);
                    if (d.temperature && d.temperature.temperature !== undefined) updateStatus(loxName, 'temp', d.temperature.temperature);
                    if (d.light && d.light.light_level !== undefined) updateStatus(loxName, 'lux', hueLightToLux(d.light.light_level));
                    if (d.on) updateStatus(loxName, 'on', d.on.on ? 1 : 0);
                    if (d.dimming && d.dimming.brightness !== undefined) updateStatus(loxName, 'bri', d.dimming.brightness);
                    if (d.button && d.button.last_event !== undefined) updateStatus(loxName, 'button', d.button.last_event);
                    if (d.power_state && d.power_state.battery_level !== undefined) updateStatus(loxName, 'bat', d.power_state.battery_level);
                } 
                else {
                    if (d.motion || d.temperature || d.light || d.button || (d.on && !serviceToDeviceMap[serviceId])) {
                        const meta = serviceToDeviceMap[serviceId];
                        const niceName = meta ? meta.deviceName : serviceId;
                        
                        let type = 'unknown';
                        let val = '';
                        
                        if(d.motion) { type='sensor'; val='Bewegung'; }
                        else if(d.temperature) { type='sensor'; val='Temp'; }
                        else if(d.light) { type='sensor'; val='Lux'; }
                        else if(d.button) { type='button'; val='Taste'; }
                        else if(d.on) { type='light'; val='Schalten'; }

                        if(type !== 'unknown') {
                            addDetectedItem({ type: type, id: serviceId, name: niceName, val: val });
                        }
                    }
                }
            });
        }
    });
}

function addDetectedItem(item) {
    const exists = detectedItems.find(d => d.id === item.id);
    if (!exists) {
        detectedItems.push(item);
        if (detectedItems.length > 10) detectedItems.shift();
        log.debug(`Neu: ${item.name} (${item.val})`);
    }
}

async function startEventStream() {
    await buildDeviceMap();
    log.info("EventStream Start...");
    try {
        const response = await axios({
            method: 'get',
            url: `https://${BRIDGE_IP}/eventstream/clip/v2`,
            headers: { 'hue-application-key': APP_KEY, 'Accept': 'text/event-stream' },
            httpsAgent,
            responseType: 'stream'
        });
        response.data.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');
            lines.forEach(line => {
                if (line.startsWith('data: ')) {
                    try { processHueEvents(JSON.parse(line.substring(6))); } catch (e) {}
                }
            });
        });
        response.data.on('end', () => setTimeout(startEventStream, 5000));
    } catch (error) { setTimeout(startEventStream, 10000); }
}

// --- EXPRESS APP ---
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Targets
app.get('/api/targets', async (req, res) => {
    try {
        await buildDeviceMap(); 
        const [lights, rooms, zones, devices] = await Promise.all([
            axios.get(`https://${BRIDGE_IP}/clip/v2/resource/light`, { headers: { 'hue-application-key': APP_KEY }, httpsAgent }),
            axios.get(`https://${BRIDGE_IP}/clip/v2/resource/room`, { headers: { 'hue-application-key': APP_KEY }, httpsAgent }),
            axios.get(`https://${BRIDGE_IP}/clip/v2/resource/zone`, { headers: { 'hue-application-key': APP_KEY }, httpsAgent }),
            axios.get(`https://${BRIDGE_IP}/clip/v2/resource/device`, { headers: { 'hue-application-key': APP_KEY }, httpsAgent })
        ]);
        let targets = [];
        if(lights.data?.data) lights.data.data.forEach(l => targets.push({ uuid: l.id, name: l.metadata.name, type: 'light' }));
        [...(rooms.data?.data || []), ...(zones.data?.data || [])].forEach(g => {
             const s = g.services.find(s => s.rtype === 'grouped_light');
             if(s) targets.push({ uuid: s.rid, name: g.metadata.name, type: 'group' });
        });
        if(devices.data?.data) {
            devices.data.data.forEach(dev => {
                const motion = dev.services.find(s => s.rtype === 'motion');
                if(motion) targets.push({ uuid: motion.rid, name: dev.metadata.name, type: 'sensor' });
                const btn = dev.services.find(s => s.rtype === 'button');
                if(btn) targets.push({ uuid: btn.rid, name: `${dev.metadata.name} (Taster)`, type: 'button' });
            });
        }
        targets.sort((a,b) => a.name.localeCompare(b.name));
        res.json(targets);
    } catch(e) { res.status(500).json([]); }
});

app.post('/api/mapping', (req, res) => {
    mapping = req.body.filter(m => m.loxone_name);
    fs.writeFileSync('mapping.json', JSON.stringify(mapping, null, 4));
    mapping.forEach(m => {
        const mappedMeta = serviceToDeviceMap[m.hue_uuid];
        detectedItems = detectedItems.filter(d => {
             if(d.type === 'command') return d.name.toLowerCase() !== m.loxone_name.toLowerCase();
             const detectedMeta = serviceToDeviceMap[d.id];
             if(mappedMeta && detectedMeta && mappedMeta.deviceId === detectedMeta.deviceId) return false;
             return d.id !== m.hue_uuid;
        });
    });
    res.json({ success: true });
});

app.get('/api/mapping', (req, res) => res.json(mapping));
app.get('/api/detected', (req, res) => res.json([...detectedItems].reverse()));
app.get('/api/status', (req, res) => res.json(statusCache));

// API: SETTINGS (ÄNDERUNG: HTTP Port hinzugefügt)
app.get('/api/settings', (req, res) => {
    res.json({
        bridge_ip: BRIDGE_IP,
        loxone_ip: LOXONE_IP,
        loxone_port: LOXONE_UDP_PORT,
        http_port: PORT, // <--- NEU
        debug: DEBUG,
        key_configured: APP_KEY ? 'Ja (Maskiert)' : 'Nein'
    });
});

app.get('/api/logs', (req, res) => {
    res.json(logBuffer);
});

// --- HAUPTROUTE ---
app.get('/:name/:value', async (req, res) => {
    const { name, value } = req.params;
    if (!name) return res.status(400).send("Name missing");
    const searchName = name.toLowerCase();

    const entry = mapping.find(m => m.loxone_name && m.loxone_name.toLowerCase() === searchName);
    
    if (!entry) {
        addDetectedItem({ type: 'command', name: name, id: 'cmd_'+name });
        return res.status(200).send('Recorded');
    }

    if (entry.hue_type === 'sensor' || entry.hue_type === 'button') return res.status(400).send("Read-only");

    const targetUuid = entry.hue_uuid;
    const resourceType = entry.hue_type === 'group' ? 'grouped_light' : 'light';
    let huePayload = {}; 
    let numericVal = parseInt(value);
    if (isNaN(numericVal)) numericVal = 0;

    if (numericVal === 0) huePayload = { on: { on: false } };
    else if (numericVal === 1) huePayload = { on: { on: true } };
    else if (numericVal > 1 && numericVal <= 100) huePayload = { on: { on: true }, dimming: { brightness: numericVal } };
    else {
        const strVal = value.toString();
        if (strVal.startsWith('20') && strVal.length >= 9) {
            const bri = parseInt(strVal.substring(2, 5));
            const kel = parseInt(strVal.substring(5));
            huePayload = (bri===0) ? { on: { on: false } } : { on: { on: true }, dimming: { brightness: bri }, color_temperature: { mirek: kelvinToMirek(kel) } };
        } else {
            let b = Math.floor(numericVal / 1000000);
            let rem = numericVal % 1000000;
            let g = Math.floor(rem / 1000);
            let r = rem % 1000;
            let maxBri = Math.max(r, g, b);
            huePayload = (maxBri===0) ? { on: { on: false } } : { on: { on: true }, dimming: { brightness: maxBri }, color: { xy: rgbToXy(r, g, b) } };
        }
    }

    try {
        await axios.put(`https://${BRIDGE_IP}/clip/v2/resource/${resourceType}/${targetUuid}`, huePayload, { headers: { 'hue-application-key': APP_KEY }, httpsAgent });
        updateStatus(entry.loxone_name, 'on', huePayload.on?.on ? 1 : 0);
        if(huePayload.dimming) updateStatus(entry.loxone_name, 'bri', huePayload.dimming.brightness);
        res.status(200).send('OK');
    } catch (error) { log.hueError(error); res.status(500).send('Error'); }
});

app.listen(PORT, () => {
    console.log(`🚀 loxHueBridge Live auf ${PORT}`);
    startEventStream();
});