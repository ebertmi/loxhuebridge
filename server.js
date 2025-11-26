const express = require('express');
const app = express();
const port = 8555; // Port auf 8555

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Request: ${req.url}`);
    next();
});

// Route: /<type>/<id>/<mode>/<value>
app.get('/:type/:id/:mode/:value', (req, res) => {
    const { type, id, mode, value } = req.params;

    console.log('--- Loxone Befehl empfangen ---');
    
    // 1. Typ
    let typeText = "Unbekannt";
    if (type === 'l') typeText = "Einzellicht";
    if (type === 'g') typeText = "Gruppe";
    console.log(`Ziel:      ${typeText} (ID: ${id})`);

    // 2. Modus (Jetzt mit 'dim')
    let modeText = mode;
    if (mode === 'ww')  modeText = "Warmweiß (Smart Actuator)";
    if (mode === 'ea')  modeText = "Schalter (Ein/Aus)";
    if (mode === 'rgb') modeText = "Farbe (RGB)";
    if (mode === 'dim') modeText = "Dimmer (Helligkeit)"; // <--- NEU
    console.log(`Modus:     ${modeText}`);

    // 3. Roh-Wert
    console.log(`Roh-Wert:  ${value}`);

    // Logik-Vorschau
    if (value === '0') {
        console.log(">> Aktion: AUSSCHALTEN");
    } else {
        if (mode === 'ea') {
             console.log(">> Aktion: EINSCHALTEN");
        }
        if (mode === 'dim') {
             // Hier prüfen wir später, ob Hue 0-100 oder 0-254 braucht
             console.log(`>> Aktion: Setze Helligkeit auf ${value}%`);
        }
        // Platzhalter für WW und RGB
    }

    console.log('-------------------------------');
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`loxHueBridge läuft auf Port ${port}`);
});