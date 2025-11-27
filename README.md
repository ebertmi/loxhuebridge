# loxHueBridge 🇦🇹

**loxHueBridge** ist eine bidirektionale Schnittstelle zwischen dem **Loxone Miniserver** und der **Philips Hue Bridge (V2 / API)**.

Sie ermöglicht eine extrem schnelle, lokale Steuerung ohne Cloud-Verzögerung und nutzt die moderne Hue Event-Schnittstelle (SSE), um Statusänderungen (Bewegung, Temperatur, externe Schaltungen) in Echtzeit an Loxone zurückzumelden.

## 🚀 Features

* **Smart Setup:** Automatische Suche der Hue Bridge und Pairing per Web-Interface.
* **Live Dashboard:** Zeigt alle verbundenen Lichter und Sensoren (Temperatur, Lux, Bewegung) in Echtzeit.
* **Smart Mapping:** Einfache Zuordnung per "Klick & Wähl".
* **Loxone Integration:**
    * **Steuern:** Schalten, Dimmen, Warmweiß & RGB (via Virtueller Ausgang).
    * **Empfangen:** Bewegung, Taster, Helligkeit, Temperatur (via UDP Eingang).
* **Docker Ready:** Robustes Design mit Data-Persistence.

---

## 📋 Voraussetzungen

* Philips Hue Bridge (V2, eckiges Modell)
* Loxone Miniserver
* Ein Server für Docker (z.B. Raspberry Pi, Synology, Unraid)

---

## 🛠 Installation

Die Installation erfolgt via Docker Compose.

1.  **Dateien laden:**
    Klone das Repository oder kopiere die Dateien (`docker-compose.yml`, `Dockerfile`, `package.json`, `server.js`, `public/`) in einen Ordner auf deinem Server.

2.  **Starten:**
    ```bash
    docker compose up -d --build
    ```

3.  **Setup Assistent:**
    Öffne `http://<DEINE-IP>:8555` im Browser.
    Der Assistent führt dich durch die Verbindung zur Hue Bridge (Pairing-Knopf drücken) und die Konfiguration von Loxone (IP & UDP Port).

---

## 🔌 Integration in Loxone (Smart Import)

Anstatt Befehle manuell einzutippen, kannst du deine konfigurierte loxHueBridge direkt in Loxone importieren.

![Loxone Import Workflow](lox_import.gif)

### Schritt 1: Vorlagen exportieren
1.  Öffne das **loxHueBridge Dashboard** (`http://<IP>:8555`).
2.  Klicke auf **"Auswählen / Exportieren"** (oben rechts bei "Aktiv").
3.  Wähle alle Geräte aus, die du in Loxone haben möchtest (oder "Alles markieren").
4.  Klicke auf **"📥 XML"**.
    * Mach das einmal im Tab **💡 Lichter** (speichert `lox_outputs.xml`).
    * Mach das einmal im Tab **📡 Sensoren** (speichert `lox_inputs.xml`).

### Schritt 2: Vorlagen in Loxone Config importieren

1.  Öffne **Loxone Config**.
2.  Klicke im Menüband oben auf den Tab **Miniserver**.
3.  Klicke auf den Button **Gerätevorlagen** und wähle **Vorlage importieren...**.
4.  Wähle die eben heruntergeladene XML-Datei aus.
5.  Wiederhole das für beide Dateien (Inputs und Outputs).

### Schritt 3: Geräte anlegen

**Für Lichter (Virtuelle Ausgänge):**
1.  Klicke im Peripheriebaum auf **Virtuelle Ausgänge**.
2.  Klicke oben im Menüband auf **Vordefinierte Geräte**.
3.  Wähle im Dropdown **LoxHueBridge Lights**.
4.  Ein neuer Virtueller Ausgang mit all deinen Lampen wird erstellt.
    * *Tipp:* Verbinde einen **Analogmerker** zwischen Lichtbaustein und dem Ausgangsbefehl für saubere Datenübertragung.

**Für Sensoren (Virtuelle UDP Eingänge):**
1.  Klicke im Peripheriebaum auf **Virtuelle UDP Eingänge**.
2.  Klicke oben im Menüband auf **Vordefinierte Geräte**.
3.  Wähle im Dropdown **LoxHueBridge Sensors**.
4.  Ein neuer UDP-Eingang mit all deinen Bewegungs-, Temperatur- und Helligkeitssensoren wird erstellt.
    * *Hinweis:* Kontrolliere, ob der **UDP Empfangsport** (Standard 7000) mit deiner loxHueBridge Einstellung übereinstimmt.

### ⚠️ Wichtige Einstellung für Lichtbausteine

Damit Warmweiß/Kaltweiß korrekt dargestellt wird, müssen die Grenzen im Loxone **Lichtsteuerungs-Baustein** (oder Smart Actuator) an die Bridge angepasst werden.

Klicke auf den Baustein und setze in den Eigenschaften:
* **Max. Farbtemperatur (Kalt):** `6500`
* **Min. Farbtemperatur (Warm):** `2700`

---

## 💡 Manuelle Konfiguration (Referenz)

Falls du die Befehle manuell anlegen möchtest:

**Lichter (Virtueller Ausgang):**
Adresse: `http://<IP-DER-BRIDGE>:8555`

| Funktion | Befehl bei EIN / Analog | Erklärung |
| :--- | :--- | :--- |
| **Ausschalten** | `/kueche/<v>` | Schaltet aus (Wert 0) |
| **Dimmen** | `/kueche/<v>` | Werte 2-100 % |
| **Warmweiß** | `/kueche/<v>` | Smart Actuator Logik (z.B. `201002700`) |
| **RGB** | `/kueche/<v>` | RGB Logik (R + G*1000 + B*1000000) |

**Sensoren (UDP Eingang):**
Port: 7000

| Typ | Befehlserkennung |
| :--- | :--- |
| **Bewegung** | `hue.bwm_flur.motion \v` |
| **Helligkeit** | `hue.bwm_flur.lux \v` |
| **Temperatur** | `hue.bwm_flur.temp \v` |
| **Schalter** | `hue.taster.button \v` |

---

## 🇬🇧 English Version

**loxHueBridge** is a bidirectional interface between the **Loxone Miniserver** and the **Philips Hue Bridge (V2 / API)**.

It enables extremely fast, local control without cloud delays and uses the modern Hue Event Interface (SSE) to report status changes (motion, temperature, external switches) back to Loxone in real-time.

## 🚀 Features

* **Smart Setup:** Automatic discovery of the Hue Bridge and pairing via web interface.
* **Live Dashboard:** Shows all connected lights and sensors (temperature, lux, motion) in real-time.
* **Smart Mapping:** Easy assignment via "Click & Select".
* **Loxone Integration:**
    * **Control:** Switching, Dimming, Warm White & RGB (via Virtual Output).
    * **Receive:** Motion, Switches, Brightness, Temperature (via UDP Input).
* **Docker Ready:** Robust design with data persistence.

---

## 📋 Prerequisites

* Philips Hue Bridge (V2, square model)
* Loxone Miniserver
* A server for Docker (e.g., Raspberry Pi, Synology, Unraid)

---

## 🛠 Installation

Installation is done via Docker Compose.

1.  **Download Files:**
    Clone the repository or copy the files (`docker-compose.yml`, `Dockerfile`, `package.json`, `server.js`, `public/`) to a folder on your server.

2.  **Start:**
    ```bash
    docker compose up -d --build
    ```

3.  **Setup Assistant:**
    Open `http://<YOUR-IP>:8555` in your browser.
    The assistant will guide you through connecting to the Hue Bridge (pressing the pairing button) and configuring Loxone (IP & UDP Port).

---

## 🔌 Integration in Loxone (Smart Import)

Instead of typing commands manually, you can directly import your configured loxHueBridge into Loxone.

![Loxone Import Workflow](lox_import.gif)

### Step 1: Export Templates
1.  Open the **loxHueBridge Dashboard** (`http://<IP>:8555`).
2.  Click **"Select / Export"** (top right in the "Active" section).
3.  Select the devices you want in Loxone (or "Select All").
4.  Click **"📥 XML"**.
    * Do this once in the **💡 Lights** tab (saves `lox_outputs.xml`).
    * Do this once in the **📡 Sensors** tab (saves `lox_inputs.xml`).

### Step 2: Import Templates into Loxone Config

1.  Open **Loxone Config**.
2.  Click on the **Miniserver** tab in the ribbon menu.
3.  Click the **Device Templates** button and select **Import Template...**.
4.  Select the downloaded XML files.
5.  Repeat for both files (Inputs and Outputs).

### Step 3: Create Devices

**For Lights (Virtual Outputs):**
1.  Click on **Virtual Outputs** in the periphery tree.
2.  Click on **Predefined Devices** in the ribbon menu.
3.  Select **LoxHueBridge Lights** from the dropdown.
4.  A new Virtual Output with all your lights is created.
    * *Tip:* Connect an **Analog Memory** between your Lighting Controller and the output command to ensure clean data transmission.

**For Sensors (Virtual UDP Inputs):**
1.  Click on **Virtual UDP Inputs** in the periphery tree.
2.  Click on **Predefined Devices** in the ribbon menu.
3.  Select **LoxHueBridge Sensors** from the dropdown.
4.  A new UDP Input with all your motion, temperature, and lux sensors is created.
    * *Note:* Check if the **UDP Receive Port** (Default 7000) matches your loxHueBridge settings.

### ⚠️ Important Setting for Lighting Controllers

To ensure Warm White/Cool White is rendered correctly, you must adjust the limits in the **Lighting Controller** block (or Smart Actuator) properties in Loxone Config:

* **Max Color Temperature (Cool):** `6500`
* **Min Color Temperature (Warm):** `2700`

---

## 💡 Manual Configuration (Reference)

If you prefer to add commands manually:

**Lights (Virtual Output):**
Address: `http://<IP-OF-BRIDGE>:8555`

| Function | Command on ON / Analog | Explanation |
| :--- | :--- | :--- |
| **Switch Off** | `/kitchen/<v>` | Switches off (if value is 0) |
| **Dimming** | `/kitchen/<v>` | Values 2-100 are interpreted as % brightness |
| **Warm White** | `/kitchen/<v>` | Uses Loxone Smart Actuator logic (e.g., `201002700`) |
| **Color (RGB)** | `/kitchen/<v>` | Uses Loxone RGB logic (R + G*1000 + B*1000000) |

**Sensors (UDP Input):**
Port: 7000

| Type | Command Recognition |
| :--- | :--- |
| **Motion** | `hue.motion_hall.motion \v` |
| **Brightness** | `hue.motion_hall.lux \v` |
| **Temperature** | `hue.motion_hall.temp \v` |
| **Switch** | `hue.button.button \v` |

---

## 💡 Tips

* **Data Folder:** All settings are saved in the `./data` folder. Make sure to back it up.
* **Host Network:** The container uses the host network mode for trouble-free UDP communication.


---

## 🤝 Credits

**#kiassisted** 🤖
This project was created with the assistance of AI.
Code architecture, logic, and documentation support provided by Gemini.