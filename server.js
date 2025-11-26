const express = require('express');
const app = express();
const port = 8080; // Port, den du in Loxone angibst

// Middleware für einfaches Logging jedes Requests
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Eingehender Request: ${req.url}`);
    next();
});

// Route-Definition basierend auf deiner Struktur:
// http://<ip>:<port>/<type>/<id>/<mode>/<value>
app.get('/:type/:id/:mode/:value', (req, res) => {
    const { type, id, mode, value } = req.params;

    console.log('--- Loxone Befehl empfangen ---');
    
    // 1. Typ analysieren
    let typeText = "Unbekannt";
    if (type === 'l') typeText = "Einzellicht";
    if (type === 'g') typeText = "Gruppe";
    console.log(`Ziel:      ${typeText} (ID: ${id})`);

    // 2. Modus analysieren
    let modeText = mode;
    if (mode === 'ww') modeText = "Warmweiß (Smart Actuator)";
    if (mode === 'ea') modeText = "Schalter (Ein/Aus)";
    if (mode === 'rgb') modeText = "Farbe (RGB)";
    console.log(`Modus:     ${modeText}`);

    // 3. Roh-Wert
    console.log(`Roh-Wert:  ${value}`);

    // Hier können wir später die Logik zum Dekodieren einbauen
    // Beispiel für deine Logik-Vorbereitung:
    if (value === '0') {
        console.log(">> Aktion: AUSSCHALTEN");
    } else {
        if (mode === 'ea') {
             console.log(">> Aktion: EINSCHALTEN");
        }
        // Platzhalter für WW und RGB Decoding
    }

    console.log('-------------------------------');

    // WICHTIG: 200 OK an Loxone zurücksenden, sonst meldet Loxone einen Fehler
    res.status(200).send('OK');
});

// Server starten
app.listen(port, () => {
    console.log(`loxHueBridge läuft auf Port ${port}`);
    console.log(`Beispielaufruf: http://localhost:${port}/l/14/ww/201002700`);
});