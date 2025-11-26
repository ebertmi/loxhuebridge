# loxHueBridge 🇦🇹 Deutsche Version

**loxHueBridge** ist eine bidirektionale Schnittstelle zwischen dem **Loxone Miniserver** und der **Philips Hue Bridge (V2 / API)**.

Sie ermöglicht eine extrem schnelle, lokale Steuerung ohne Cloud-Verzögerung und nutzt die moderne Hue Event-Schnittstelle (SSE), um Statusänderungen (Bewegung, Temperatur, externe Schaltungen) in Echtzeit an Loxone zurückzumelden.

## 🚀 Features

* **Bidirektional:** Loxone steuert Hue ↔ Hue meldet Status an Loxone.
* **Clean URLs:** Sprechende Namen statt kryptischer IDs (z.B. `/wohnzimmer/50`).
* **Auto-Discovery:** Erkennt automatisch Hue Lichter, Räume, Zonen, Bewegungsmelder und Schalter.
* **Smart Mapping:** Einfache Zuordnung über ein modernes Web-Dashboard.
* **Hardware-Abstraktion:** Tausche defekte Hue-Lampen aus, ohne das Loxone-Programm ändern zu müssen.
* **Smart Logic:** Erkennt automatisch, ob geschaltet, gedimmt oder Farbe geändert werden soll, basierend auf dem Wert.
* **Docker Ready:** Optimiert für den Einsatz auf Raspberry Pi, Synology NAS oder Servern.

---

## 📋 Voraussetzungen

* Philips Hue Bridge (V2, eckiges Modell)
* Loxone Miniserver
* Ein Server für Docker (z.B. Raspberry Pi)

---

## 🛠 Installation (Docker)

Dies ist die empfohlene Installationsmethode.

1.  **Repository klonen oder Dateien kopieren:**
    Benötigt werden `Dockerfile`, `docker-compose.yml`, `package.json`, `server.js` und der Ordner `public`.

2.  **Konfiguration vorbereiten:**
    Erstelle eine Datei `mapping.json` (falls nicht vorhanden):
    ```bash
    echo "[]" > mapping.json
    ```

3.  **Environment Variablen setzen:**
    Erstelle eine `.env` Datei:
    ```ini
    # Hue Bridge Settings
    HUE_BRIDGE_IP=192.168.1.XXX
    HUE_APP_KEY=DeinGenerierterKey... 
    
    # Loxone Settings (für Rückkanal)
    LOXONE_IP=192.168.1.YYY
    LOXONE_UDP_PORT=7000
    
    # Server Settings
    HTTP_PORT=8555
    DEBUG=false
    ```

4.  **Starten:**
    ```bash
    docker compose up -d --build
    ```

Das Web-Interface ist nun unter `http://<DEINE-IP>:8555` erreichbar.

---

## ⚙️ Einrichtung in Loxone

### 1. Lichter steuern (Ausgang)

Damit die Werte sauber übertragen werden, empfiehlt es sich, am **Lichtbaustein** (Ausgang AQ, RGB, etc.) zuerst einen **Analogmerker** anzuschließen und diesen dann mit dem Virtuellen Ausgangsbefehl zu verbinden.

1.  Erstelle einen **Virtuellen Ausgang**:
    * **Adresse:** `http://<IP-DER-BRIDGE>:8555`
    * **Verbindung schließen:** Ja
2.  Erstelle darunter **Virtuelle Ausgangsbefehle**.
3.  Verbinde den Analogmerker des Lichtbausteins mit diesem Befehl.

| Funktion | Befehl bei EIN / Analog | Erklärung |
| :--- | :--- | :--- |
| **Ausschalten** | `/kueche/<v>` | Schaltet aus (wenn Wert 0) |
| **Dimmen** | `/kueche/<v>` | Werte 2-100 werden als % Helligkeit interpretiert |
| **Warmweiß** | `/kueche/<v>` | Nutzt Loxone Smart Actuator Logik (z.B. `201002700`) |
| **Farbe (RGB)** | `/kueche/<v>` | Nutzt Loxone RGB Logik (R + G*1000 + B*1000000) |

*Hinweis:* `<v>` ist der Platzhalter für den Wert, den der Analogmerker sendet.
### 2. Sensoren empfangen (Eingang)

Erstelle in Loxone Config einen **Virtuellen UDP Eingang**:
* **UDP Empfangsport:** `7000` (oder was in der .env steht)

Erstelle darunter **Virtuelle UDP Eingangsbefehle**.
Der Befehlserkennungstext entspricht dem Namen, den du im Web-Interface dem Sensor gegeben hast (z.B. `bwm_flur`).

| Sensor-Typ | Befehlserkennung | Beispielwert |
| :--- | :--- | :--- |
| **Bewegung** | `hue.bwm_flur.motion \v` | 0 oder 1 |
| **Helligkeit** | `hue.bwm_flur.lux \v` | Lux-Wert (z.B. 150) |
| **Temperatur** | `hue.bwm_flur.temp \v` | Grad Celsius (z.B. 21.5) |
| **Schalter** | `hue.taster.button \v` | Event (z.B. `initial_press`) |
| **Licht Status**| `hue.kueche.on \v` | 0 oder 1 (Rückmeldung) |

---

## 🖥 Web Dashboard

Rufe `http://<IP>:8555` auf.

1.  **Tab Lichter:**
    * Sende einen Befehl aus Loxone (z.B. `/buero/1`).
    * Der Befehl erscheint unter "Neu entdeckt".
    * Klicke ihn an und wähle rechts das passende Hue-Licht aus. Speichern.
2.  **Tab Sensoren:**
    * Löse einen Sensor aus (Bewegung).
    * Klicke auf den Chip unter "Neu entdeckt" (im Tab Sensoren).
    * Gib ihm einen Namen (z.B. `bwm_flur`) und speichere.
3.  **Tab System:**
    * Prüfe Logs und Einstellungen.

---

## 🐳 Docker Hinweise

Der Container nutzt `network_mode: "host"`. Dies ist empfohlen, damit Loxone die UDP-Pakete korrekt der IP-Adresse des Hosts zuordnen kann.

Falls du **kein** Host-Netzwerk nutzen willst, musst du Ports mappen:
```yaml
ports:
  - "8555:8555"
  # UDP Port muss explizit exposed werden, wenn nicht host mode!
```

---

# loxHueBridge - 🇬🇧 English Version

**loxHueBridge** is a bidirectional interface between the **Loxone Miniserver** and the **Philips Hue Bridge (V2 / API)**.

It enables extremely fast, local control without cloud delays and uses the modern Hue Event Interface (SSE) to report status changes (motion, temperature, external switches) back to Loxone in real-time.

## 🚀 Features

* **Bidirectional:** Loxone controls Hue ↔ Hue reports status to Loxone.
* **Clean URLs:** Descriptive names instead of cryptic IDs (e.g., `/livingroom/50`).
* **Auto-Discovery:** Automatically detects Hue lights, rooms, zones, motion sensors, and switches.
* **Smart Mapping:** Easy assignment via a modern web dashboard.
* **Hardware Abstraction:** Replace defective Hue bulbs without changing the Loxone program.
* **Smart Logic:** Automatically detects whether to switch, dim, or change color based on the value.
* **Docker Ready:** Optimized for use on Raspberry Pi, Synology NAS, or servers.

---

## 📋 Prerequisites

* Philips Hue Bridge (V2, square model)
* Loxone Miniserver
* A server for Docker (e.g., Raspberry Pi)

---

## 🛠 Installation (Docker)

This is the recommended installation method.

1.  **Clone repository or copy files:**
    You need `Dockerfile`, `docker-compose.yml`, `package.json`, `server.js`, and the `public` folder.

2.  **Prepare configuration:**
    Create a `mapping.json` file (if it doesn't exist):
    ```bash
    echo "[]" > mapping.json
    ```

3.  **Set environment variables:**
    Create a `.env` file:
    ```ini
    # Hue Bridge Settings
    HUE_BRIDGE_IP=192.168.1.XXX
    HUE_APP_KEY=YourGeneratedKey... 
    
    # Loxone Settings (for return channel)
    LOXONE_IP=192.168.1.YYY
    LOXONE_UDP_PORT=7000
    
    # Server Settings
    HTTP_PORT=8555
    DEBUG=false
    ```

4.  **Start:**
    ```bash
    docker compose up -d --build
    ```

The web interface is now accessible at `http://<YOUR-IP>:8555`.

---

## ⚙️ Setup in Loxone

### 1. Controlling Lights (Output)

To ensure clean data transmission, it is recommended to connect an **Analog Memory** (Analogmerker) to the **Lighting Controller** outputs (AQ, RGB, etc.) first, and then link this memory to the Virtual Output Command.

1.  Create a **Virtual Output**:
    * **Address:** `http://<IP-OF-BRIDGE>:8555`
    * **Close connection:** Yes
2.  Create **Virtual Output Commands** underneath.
3.  Connect the Analog Memory from the Lighting Controller to this command.

| Function | Command on ON / Analog | Explanation |
| :--- | :--- | :--- |
| **Switch Off** | `/kitchen/<v>` | Switches off (if value is 0) |
| **Dimming** | `/kitchen/<v>` | Values 2-100 are interpreted as % brightness |
| **Warm White** | `/kitchen/<v>` | Uses Loxone Smart Actuator logic (e.g., `201002700`) |
| **Color (RGB)** | `/kitchen/<v>` | Uses Loxone RGB logic (R + G*1000 + B*1000000) |

*Note:* `<v>` is the placeholder for the value sent by the Analog Memory.

### 2. Receiving Sensors (Input)

Create a **Virtual UDP Input** in Loxone Config:
* **UDP Receive Port:** `7000` (or whatever is in your .env)

Create **Virtual UDP Input Commands** underneath.
The command recognition text corresponds to the name you gave the sensor in the web interface (e.g., `motion_hall`).

| Sensor Type | Command Recognition | Example Value |
| :--- | :--- | :--- |
| **Motion** | `hue.motion_hall.motion \v` | 0 or 1 |
| **Brightness** | `hue.motion_hall.lux \v` | Lux value (e.g., 150) |
| **Temperature** | `hue.motion_hall.temp \v` | Degrees Celsius (e.g., 21.5) |
| **Switch** | `hue.button.button \v` | Event (e.g., `initial_press`) |
| **Light Status**| `hue.kitchen.on \v` | 0 or 1 (Feedback) |

---

## 🖥 Web Dashboard

Open `http://<IP>:8555`.

1.  **Lights Tab:**
    * Send a command from Loxone (e.g., `/office/1`).
    * The command appears under "Newly Discovered".
    * Click it and select the matching Hue light on the right. Save.
2.  **Sensors Tab:**
    * Trigger a sensor (motion).
    * Click on the chip under "Newly Discovered" (in the Sensors tab).
    * Give it a name (e.g., `motion_hall`) and save.
3.  **System Tab:**
    * Check logs and settings.

---

## 🐳 Docker Notes

The container uses `network_mode: "host"`. This is recommended so that Loxone can correctly assign the UDP packets to the host's IP address.

If you do **not** want to use host network, you must map ports:
```yaml
ports:
  - "8555:8555"
  # UDP Port must be explicitly exposed if not in host mode!
````

```

