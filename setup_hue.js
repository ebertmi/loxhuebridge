require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const https = require('https');

// Hue Bridge verwendet selbst-signierte Zertifikate.
// Für lokale Entwicklung müssen wir die Prüfung deaktivieren.
const httpsAgent = new https.Agent({  
  rejectUnauthorized: false
});

const BRIDGE_IP = process.env.HUE_BRIDGE_IP;

if (!BRIDGE_IP || BRIDGE_IP.includes('XXX')) {
    console.error("FEHLER: Bitte trage zuerst die echte IP deiner Hue Bridge in die .env Datei ein!");
    process.exit(1);
}

console.log(`Versuche Verbindung zur Bridge auf ${BRIDGE_IP}...`);
console.log("BITTE JETZT DEN RUNDEN KNOPF AUF DER HUE BRIDGE DRÜCKEN!");
console.log("Du hast 30 Sekunden Zeit...");

// Wir versuchen es alle 2 Sekunden, bis der Knopf gedrückt wurde
let attempts = 0;
const maxAttempts = 15;

const registerUser = async () => {
    try {
        const response = await axios.post(
            `https://${BRIDGE_IP}/api`, 
            { devicetype: "loxHueBridge#Server" },
            { httpsAgent } // Wichtig für HTTPS ohne gültiges Zertifikat
        );

        const data = response.data[0];

        if (data.error) {
            if (data.error.type === 101) {
                // Fehler 101 = Link Button not pressed
                process.stdout.write("."); // Kleiner Punkt als Ladebalken
            } else {
                console.log("\nAndere Fehlermeldung:", data.error.description);
            }
        } else if (data.success) {
            const username = data.success.username;
            console.log("\n\nERFOLG! Benutzer erstellt.");
            console.log(`Dein API Key: ${username}`);
            
            // Speichern in .env
            const envContent = `HUE_BRIDGE_IP=${BRIDGE_IP}\nHUE_APP_KEY=${username}`;
            fs.writeFileSync('.env', envContent);
            console.log("Der Key wurde automatisch in die .env Datei gespeichert.");
            process.exit(0);
        }
    } catch (error) {
        console.error("\nVerbindungsfehler:", error.message);
        console.error("Prüfe IP und Netzwerkverbindung.");
        process.exit(1);
    }
};

const interval = setInterval(() => {
    attempts++;
    registerUser();
    if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.log("\n\nZeit abgelaufen. Bitte starte das Skript erneut und drücke den Knopf rechtzeitig.");
    }
}, 2000);