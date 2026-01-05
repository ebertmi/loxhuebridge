# Loxone Lichtstatus über WebSocket abfragen

> Ergänzung zum WebSocket-Guide für Lichtsteuerung

---

## Übersicht: Status-System

Der Miniserver sendet Status-Updates als **binäre Event-Tables** über WebSocket. Um den Status von Lichtern abzufragen, brauchst du:

1. Eine authentifizierte WebSocket-Verbindung
2. Die **LoxAPP3.json** (Strukturdatei mit allen UUIDs)
3. Aktivierte **Status-Updates** (`enablebinstatusupdate`)

---

## Schritt 1: Strukturdatei laden (LoxAPP3.json)

### Abrufen

```
data/LoxAPP3.json
```

### Relevante Bereiche für Lichtsteuerung

```json
{
  "controls": {
    "0c5e3412-00a2-11e3-ffff1234567890ab": {
      "name": "Wohnzimmer Licht",
      "type": "LightControllerV2",
      "uuidAction": "0c5e3412-00a2-11e3-ffff1234567890ab",
      "states": {
        "activeMoods": "0c5e3412-00a2-11e3-ffff1234567890ab/activeMoods",
        "moodList": "0c5e3412-00a2-11e3-ffff1234567890ab/moodList",
        "favoriteMoods": "0c5e3412-00a2-11e3-ffff1234567890ab/favoriteMoods",
        "additionalMoods": "0c5e3412-00a2-11e3-ffff1234567890ab/additionalMoods"
      },
      "subControls": {
        "0c5e3412-00a2-11e3-ffff1234567890ab/AI1": {
          "name": "Deckenleuchte",
          "type": "Dimmer",
          "uuidAction": "0c5e3412-00a2-11e3-ffff1234567890ab/AI1",
          "states": {
            "position": "0c5e3412-00a2-11e3-ffff1234567890cd",
            "min": "...",
            "max": "...",
            "step": "..."
          }
        },
        "0c5e3412-00a2-11e3-ffff1234567890ab/AI2": {
          "name": "Stehlampe",
          "type": "Switch",
          "uuidAction": "0c5e3412-00a2-11e3-ffff1234567890ab/AI2",
          "states": {
            "active": "0c5e3412-00a2-11e3-ffff1234567890ef"
          }
        }
      }
    }
  }
}
```

### Wichtige Control-Typen

| Type | Beschreibung |
|------|-------------|
| `LightControllerV2` | Lichtsteuerungsbaustein |
| `LightController` | Älterer Lichtsteuerungsbaustein |
| `Dimmer` | Einzelner Dimmer (SubControl) |
| `Switch` | Schalter (SubControl) |
| `ColorPickerV2` | RGB/RGBW-Lichter |

---

## Schritt 2: Status-Updates aktivieren

```
jdev/sps/enablebinstatusupdate
```

Nach diesem Befehl erhältst du:

1. **Initiale Event-Tables** mit allen aktuellen Werten
2. **Laufende Updates** bei Änderungen

---

## Schritt 3: Event-Tables verarbeiten

### Event-Typen (Message-Header Identifier)

| ID | Typ | Relevanz für Lichter |
|----|-----|---------------------|
| 2 | Value-States | ✅ Dimmwerte, Position |
| 3 | Text-States | ✅ Mood-Namen, Listen |

### Value-States (Identifier 2)

Binäre Struktur pro Event (24 Bytes):

```
Bytes 0-15:  UUID (128-bit)
Bytes 16-23: Double-Wert (64-bit, little-endian)
```

**Beispiel-Werte:**
- Dimmer-Position: `0.0` - `100.0`
- Switch-Status: `0.0` (aus) oder `1.0` (an)
- Aktive Mood-ID: `1.0`, `2.0`, etc.

### Text-States (Identifier 3)

Binäre Struktur:

```
Bytes 0-15:   UUID
Bytes 16-31:  Icon-UUID
Bytes 32-35:  Textlänge (32-bit unsigned)
Bytes 36+:   Text (UTF-8, padded auf 4-Byte-Grenze)
```

**Beispiel-Texte:**
- `moodList`: JSON-Array mit verfügbaren Moods
- `activeMoods`: Aktuelle Mood-IDs als Text

---

## LightControllerV2: Wichtige States

### Haupt-States

| State | Typ | Beschreibung |
|-------|-----|-------------|
| `activeMoods` | Text | Array der aktiven Mood-IDs `[1]` oder `[1,3]` |
| `moodList` | Text | JSON-Array aller verfügbaren Moods |
| `favoriteMoods` | Text | IDs der Favoriten-Moods |
| `additionalMoods` | Text | IDs zusätzlicher Moods |

### moodList Format

```json
[
  {"id": 777, "name": "Aus", "static": true},
  {"id": 1, "name": "Hell", "static": false},
  {"id": 2, "name": "Gemütlich", "static": false},
  {"id": 3, "name": "Kino", "static": false}
]
```

> **Hinweis:** Mood-ID `777` ist immer "Alles aus"

### SubControl States (einzelne Lichtkreise)

| State | Typ | Beschreibung |
|-------|-----|-------------|
| `position` | Value | Dimmwert 0-100% |
| `active` | Value | 0 = aus, 1 = an (für Switches) |
| `min` | Value | Minimaler Dimmwert |
| `max` | Value | Maximaler Dimmwert |
| `step` | Value | Schrittweite |

---

## Python-Beispiel: Status-Monitoring

```python
import websocket
import struct
import json

class LoxoneStateMonitor:
    def __init__(self, host, token, user):
        self.host = host
        self.token = token
        self.user = user
        self.states = {}  # UUID -> Wert
        self.structure = None
        
    def connect(self):
        self.ws = websocket.WebSocketApp(
            f"wss://{self.host}/ws/rfc6455",
            subprotocols=["remotecontrol"],
            on_message=self.on_message,
            on_open=self.on_open
        )
        self.ws.run_forever()
    
    def on_open(self, ws):
        # Authentifizieren (vereinfacht)
        ws.send(f"authwithtoken/{self.token}/{self.user}")
        
        # Strukturdatei laden
        ws.send("data/LoxAPP3.json")
        
        # Status-Updates aktivieren
        ws.send("jdev/sps/enablebinstatusupdate")
    
    def on_message(self, ws, message):
        if isinstance(message, bytes):
            self.parse_binary_message(message)
        else:
            # Text-Message (JSON-Response oder LoxAPP3.json)
            self.handle_text_message(message)
    
    def parse_binary_message(self, data):
        # Message-Header parsen (8 Bytes)
        if len(data) < 8:
            return
            
        header = data[:8]
        identifier = header[1]
        payload_length = struct.unpack('<I', header[4:8])[0]
        
        # Payload ist die nächste Nachricht
        # (In der Praxis kommt der Header separat)
        
        if identifier == 2:  # Value-States
            self.parse_value_states(data[8:])
        elif identifier == 3:  # Text-States
            self.parse_text_states(data[8:])
    
    def parse_value_states(self, data):
        """Parse Value-State Event-Table"""
        offset = 0
        while offset + 24 <= len(data):
            # UUID extrahieren (16 Bytes)
            uuid_bytes = data[offset:offset+16]
            uuid = self.bytes_to_uuid(uuid_bytes)
            
            # Double-Wert extrahieren (8 Bytes)
            value = struct.unpack('<d', data[offset+16:offset+24])[0]
            
            self.states[uuid] = value
            self.on_value_update(uuid, value)
            
            offset += 24
    
    def parse_text_states(self, data):
        """Parse Text-State Event-Table"""
        offset = 0
        while offset + 36 <= len(data):
            # UUID (16 Bytes)
            uuid_bytes = data[offset:offset+16]
            uuid = self.bytes_to_uuid(uuid_bytes)
            
            # Icon-UUID überspringen (16 Bytes)
            offset += 32
            
            # Textlänge (4 Bytes)
            text_length = struct.unpack('<I', data[offset:offset+4])[0]
            offset += 4
            
            # Text extrahieren
            text = data[offset:offset+text_length].decode('utf-8').rstrip('\x00')
            
            # Padding auf 4-Byte-Grenze
            padded_length = (text_length + 3) & ~3
            offset += padded_length
            
            self.states[uuid] = text
            self.on_text_update(uuid, text)
    
    def bytes_to_uuid(self, uuid_bytes):
        """Konvertiert 16 Bytes zu UUID-String"""
        d1 = struct.unpack('<I', uuid_bytes[0:4])[0]
        d2 = struct.unpack('<H', uuid_bytes[4:6])[0]
        d3 = struct.unpack('<H', uuid_bytes[6:8])[0]
        d4 = uuid_bytes[8:16]
        
        return f"{d1:08x}-{d2:04x}-{d3:04x}-{d4[0]:02x}{d4[1]:02x}{d4[2]:02x}{d4[3]:02x}{d4[4]:02x}{d4[5]:02x}{d4[6]:02x}{d4[7]:02x}"
    
    def on_value_update(self, uuid, value):
        """Callback bei Value-Update"""
        control = self.find_control_by_state_uuid(uuid)
        if control:
            print(f"[VALUE] {control['name']}: {value}")
    
    def on_text_update(self, uuid, text):
        """Callback bei Text-Update"""
        control = self.find_control_by_state_uuid(uuid)
        if control:
            print(f"[TEXT] {control['name']}: {text}")
    
    def find_control_by_state_uuid(self, state_uuid):
        """Findet Control anhand einer State-UUID"""
        if not self.structure:
            return None
        
        for uuid, control in self.structure.get('controls', {}).items():
            # Haupt-States prüfen
            for state_name, s_uuid in control.get('states', {}).items():
                if s_uuid == state_uuid:
                    return {'name': f"{control['name']}.{state_name}", 'control': control}
            
            # SubControl-States prüfen
            for sub_uuid, sub in control.get('subControls', {}).items():
                for state_name, s_uuid in sub.get('states', {}).items():
                    if s_uuid == state_uuid:
                        return {'name': f"{control['name']}/{sub['name']}.{state_name}", 'control': sub}
        
        return None
    
    def get_light_status(self, control_name):
        """Gibt den Status einer Lichtsteuerung zurück"""
        for uuid, control in self.structure.get('controls', {}).items():
            if control['name'] == control_name and control['type'] == 'LightControllerV2':
                result = {
                    'name': control['name'],
                    'activeMoods': None,
                    'moodList': None,
                    'subControls': {}
                }
                
                # Haupt-States
                states = control.get('states', {})
                if 'activeMoods' in states:
                    result['activeMoods'] = self.states.get(states['activeMoods'])
                if 'moodList' in states:
                    result['moodList'] = self.states.get(states['moodList'])
                
                # SubControls (einzelne Lichter)
                for sub_uuid, sub in control.get('subControls', {}).items():
                    sub_states = sub.get('states', {})
                    position_uuid = sub_states.get('position')
                    active_uuid = sub_states.get('active')
                    
                    result['subControls'][sub['name']] = {
                        'type': sub['type'],
                        'position': self.states.get(position_uuid) if position_uuid else None,
                        'active': self.states.get(active_uuid) if active_uuid else None
                    }
                
                return result
        
        return None

# Verwendung
monitor = LoxoneStateMonitor("192.168.1.10", "your_token", "admin")
monitor.connect()
```

---

## Direktabfrage einzelner Werte (HTTP)

Neben dem Event-Stream kannst du auch gezielt Werte abfragen:

### State eines Controls abfragen

```bash
# Via Bezeichnung
curl "https://admin:pass@192.168.1.10/jdev/sps/io/WohnzimmerLicht/state"

# Via UUID
curl "https://admin:pass@192.168.1.10/jdev/sps/io/0c5e3412-00a2-11e3-ffff1234567890ab/state"
```

### Alle States eines Controls

```bash
curl "https://admin:pass@192.168.1.10/jdev/sps/io/WohnzimmerLicht/all"
```

> ⚠️ **Hinweis:** `/all` funktioniert seit v7.x nicht mehr zuverlässig für LightControllerV2

### Position eines Dimmers (SubControl)

```bash
# SubControl über UUID ansprechen
curl "https://admin:pass@192.168.1.10/jdev/sps/io/0c5e3412-00a2-11e3-ffff1234567890ab/AI1/state"
```

---

## Licht steuern über WebSocket

### Mood aktivieren

```
jdev/sps/io/{uuid}/changeTo/{moodId}

# Beispiel: Mood 2 (Gemütlich) aktivieren
jdev/sps/io/0c5e3412-00a2-11e3-ffff1234567890ab/changeTo/2
```

### Mood zur Liste hinzufügen (mischen)

```
jdev/sps/io/{uuid}/addMood/{moodId}
```

### Mood aus Liste entfernen

```
jdev/sps/io/{uuid}/removeMood/{moodId}
```

### Alles aus (Mood 777)

```
jdev/sps/io/{uuid}/changeTo/777
```

### Plus/Minus (nächste/vorherige Mood)

```
jdev/sps/io/{uuid}/plus
jdev/sps/io/{uuid}/minus
```

### SubControl (einzelner Lichtkreis) direkt steuern

```bash
# Dimmer auf 50%
jdev/sps/io/{subControl-uuid}/50

# Beispiel
jdev/sps/io/0c5e3412-00a2-11e3-ffff1234567890ab/AI1/50
```

---

## Zusammenfassung: Status-Mapping

```
LoxAPP3.json
    └── controls
        └── {LightControllerV2-UUID}
            ├── states
            │   ├── activeMoods → Text-State (z.B. "[1,3]")
            │   └── moodList   → Text-State (JSON-Array)
            └── subControls
                └── {UUID}/AI1
                    └── states
                        └── position → Value-State (0-100)
```

**Workflow:**

1. `LoxAPP3.json` laden → UUIDs der States merken
2. `enablebinstatusupdate` senden
3. Event-Tables empfangen und nach UUIDs filtern
4. Bei Updates: UUID-zu-Control-Mapping verwenden

---

## ColorPickerV2: RGB- und Farbtemperatur-Status

ColorPickerV2 erscheint als **SubControl** innerhalb eines LightControllerV2 – entweder für einzelne RGB-Lichtkreise oder als **MasterColor** für alle Farblichter.

### Struktur in LoxAPP3.json

```json
{
  "controls": {
    "0c5e3412-00a2-11e3-ffff1234567890ab": {
      "name": "Wohnzimmer Licht",
      "type": "LightControllerV2",
      "details": {
        "masterValue": "0c5e3412-00a2-11e3-ffff1234567890ab/masterValue",
        "masterColor": "0c5e3412-00a2-11e3-ffff1234567890ab/masterColor"
      },
      "subControls": {
        "0c5e3412-00a2-11e3-ffff1234567890ab/masterValue": {
          "name": "Master-Helligkeit",
          "type": "Dimmer",
          "states": {
            "position": "0c5e3412-00a2-11e3-ffff1234567890ab/masterValue"
          }
        },
        "0c5e3412-00a2-11e3-ffff1234567890ab/masterColor": {
          "name": "Master-Farbe",
          "type": "ColorPickerV2",
          "states": {
            "color": "aaaabbbb-cccc-dddd-eeee-ffffffffffff",
            "sequence": "...",
            "sequenceColorIdx": "..."
          },
          "details": {
            "pickerType": "Rgb"
          }
        },
        "0c5e3412-00a2-11e3-ffff1234567890ab/AI3": {
          "name": "LED-Strip Küche",
          "type": "ColorPickerV2",
          "states": {
            "color": "11112222-3333-4444-5555-666677778888"
          },
          "details": {
            "pickerType": "Lumitech"
          }
        }
      }
    }
  }
}
```

### ColorPickerV2 States

| State | Typ | Beschreibung |
|-------|-----|-------------|
| `color` | Text | Aktuelle Farbe als String |
| `sequence` | Text | JSON mit aktiver Farbsequenz |
| `sequenceColorIdx` | Value | Index in Sequenz (-1 = keine Sequenz aktiv) |

### Farbformat-Strings

Der `color`-State liefert einen **Text-String** in einem von drei Formaten:

#### 1. HSV (RGB-Farben)

```
hsv(hue, saturation, value)
```

| Parameter | Bereich | Beschreibung |
|-----------|---------|--------------|
| hue | 0-360 | Farbton (0=Rot, 120=Grün, 240=Blau) |
| saturation | 0-100 | Sättigung (0=Weiß, 100=Voll gesättigt) |
| value | 0-100 | Helligkeit (0=Aus, 100=Maximum) |

**Beispiele:**
- `hsv(0,100,100)` → Reines Rot, volle Helligkeit
- `hsv(120,100,50)` → Grün, halbe Helligkeit
- `hsv(240,50,80)` → Helles Blau-Violett
- `hsv(0,0,0)` → Aus

#### 2. Farbtemperatur (Tunable White / Lumitech)

```
temp(brightness, kelvin)
```

| Parameter | Bereich | Beschreibung |
|-----------|---------|--------------|
| brightness | 0-100 | Helligkeit |
| kelvin | 2700-6500 | Farbtemperatur (warm → kalt) |

**Beispiele:**
- `temp(100,2700)` → Warmweiß, volle Helligkeit
- `temp(50,4000)` → Neutralweiß, halbe Helligkeit
- `temp(80,6500)` → Kaltweiß/Tageslicht

#### 3. Tageslicht (seit v13.0)

```
daylight(brightness, mode)
```

| Parameter | Wert | Beschreibung |
|-----------|------|--------------|
| brightness | 0-100 | Helligkeit |
| mode | 4 | Direktes Licht |
| mode | 5 | Indirektes Licht |

### pickerType in Details

| Typ | Beschreibung |
|-----|-------------|
| `Rgb` | RGB-Farbwähler (HSV-Format) |
| `Lumitech` | Lumitech-Leuchten (temp-Format) |
| `TunableWhite` | Nur Farbtemperatur, kein RGB |

### Farbsequenzen

Der `sequence`-State enthält ein JSON-Objekt:

```json
{
  "colors": [
    "hsv(0,100,100)",
    "hsv(120,100,100)",
    "hsv(240,100,100)"
  ],
  "interval": 300,
  "type": 0,
  "mode": 4
}
```

| Feld | Beschreibung |
|------|-------------|
| `colors` | Array mit Farbstrings (max. 6) |
| `interval` | Überblendzeit in Sekunden (60-3600) |
| `type` | 0 = RGB, 2 = Tageslicht |
| `mode` | 4 = direkt, 5 = indirekt (nur bei Tageslicht) |

---

## MasterValue & MasterColor

Der LightControllerV2 hat zwei spezielle SubControls für globale Steuerung:

### MasterValue (Master-Helligkeit)

- **Typ:** `Dimmer`
- **UUID:** In `details.masterValue`
- **State:** `position` (0-100)
- Steuert die **Gesamthelligkeit** aller Lichtkreise

### MasterColor (Master-Farbe)

- **Typ:** `ColorPickerV2`
- **UUID:** In `details.masterColor`
- **State:** `color` (hsv/temp-String)
- Steuert die **Farbe aller RGB-Lichtkreise** gleichzeitig
- Nur vorhanden, wenn mindestens ein ColorPicker-SubControl existiert

---

## Python-Beispiel: Farbwerte parsen

```python
import re

def parse_loxone_color(color_string):
    """
    Parst Loxone Farbstrings in verwendbare Werte.
    
    Returns dict mit Typ und Werten.
    """
    if not color_string:
        return None
    
    # HSV-Format: hsv(hue, saturation, value)
    hsv_match = re.match(r'hsv\((\d+),(\d+),(\d+)\)', color_string)
    if hsv_match:
        return {
            'type': 'hsv',
            'hue': int(hsv_match.group(1)),         # 0-360
            'saturation': int(hsv_match.group(2)),  # 0-100
            'value': int(hsv_match.group(3))        # 0-100
        }
    
    # Temperatur-Format: temp(brightness, kelvin)
    temp_match = re.match(r'temp\((\d+),(\d+)\)', color_string)
    if temp_match:
        return {
            'type': 'temp',
            'brightness': int(temp_match.group(1)),  # 0-100
            'kelvin': int(temp_match.group(2))       # 2700-6500
        }
    
    # Tageslicht-Format: daylight(brightness, mode)
    daylight_match = re.match(r'daylight\((\d+)(?:,(\d+))?\)', color_string)
    if daylight_match:
        return {
            'type': 'daylight',
            'brightness': int(daylight_match.group(1)),
            'mode': int(daylight_match.group(2)) if daylight_match.group(2) else 4
        }
    
    return None


def hsv_to_rgb(h, s, v):
    """Konvertiert HSV (Loxone-Format) zu RGB (0-255)."""
    s = s / 100
    v = v / 100
    
    c = v * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = v - c
    
    if h < 60:
        r, g, b = c, x, 0
    elif h < 120:
        r, g, b = x, c, 0
    elif h < 180:
        r, g, b = 0, c, x
    elif h < 240:
        r, g, b = 0, x, c
    elif h < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x
    
    return (
        int((r + m) * 255),
        int((g + m) * 255),
        int((b + m) * 255)
    )


def kelvin_to_rgb(kelvin):
    """Approximiert RGB-Werte für Farbtemperatur."""
    temp = kelvin / 100
    
    # Rot
    if temp <= 66:
        r = 255
    else:
        r = temp - 60
        r = 329.698727446 * (r ** -0.1332047592)
        r = max(0, min(255, r))
    
    # Grün
    if temp <= 66:
        g = temp
        g = 99.4708025861 * math.log(g) - 161.1195681661
    else:
        g = temp - 60
        g = 288.1221695283 * (g ** -0.0755148492)
    g = max(0, min(255, g))
    
    # Blau
    if temp >= 66:
        b = 255
    elif temp <= 19:
        b = 0
    else:
        b = temp - 10
        b = 138.5177312231 * math.log(b) - 305.0447927307
        b = max(0, min(255, b))
    
    return (int(r), int(g), int(b))


# Beispiel-Verwendung
color_states = [
    "hsv(0,100,100)",      # Rot
    "hsv(120,50,80)",      # Hellgrün
    "temp(100,2700)",      # Warmweiß
    "temp(50,6500)",       # Kaltweiß gedimmt
    "daylight(80,4)"       # Tageslicht direkt
]

for color in color_states:
    parsed = parse_loxone_color(color)
    print(f"{color} → {parsed}")
    
    if parsed['type'] == 'hsv':
        rgb = hsv_to_rgb(parsed['hue'], parsed['saturation'], parsed['value'])
        print(f"  RGB: {rgb}")
```

---

## Farbsteuerung über WebSocket

### HSV-Farbe setzen

```
jdev/sps/io/{colorpicker-uuid}/hsv({hue},{saturation},{value})

# Beispiel: Rot mit voller Sättigung
jdev/sps/io/0c5e3412-00a2-11e3-ffff1234567890ab/AI3/hsv(0,100,100)
```

### Farbtemperatur setzen

```
jdev/sps/io/{colorpicker-uuid}/temp({brightness},{kelvin})

# Beispiel: Warmweiß 80%
jdev/sps/io/0c5e3412-00a2-11e3-ffff1234567890ab/AI3/temp(80,2700)
```

### Tageslicht setzen (v13.0+)

```
jdev/sps/io/{colorpicker-uuid}/daylight({brightness},{mode})

# mode: 4 = direkt, 5 = indirekt
```

### Helligkeit der Sequenz ändern

```
jdev/sps/io/{colorpicker-uuid}/setBrightness/{value}
```

### Farbsequenz starten

```
jdev/sps/io/{colorpicker-uuid}/setSequence/{duration_seconds}/{color1}/{color2}/.../{startIdx}

# Beispiel: RGB-Wechsel alle 60 Sekunden
jdev/sps/io/{uuid}/setSequence/60/hsv(0,100,100)/hsv(120,100,100)/hsv(240,100,100)/-1
```

### Favoriten-Farbe speichern

```
jdev/sps/io/{colorpicker-uuid}/setFav/{index}/{color}

# Beispiel
jdev/sps/io/{uuid}/setFav/0/hsv(30,80,100)
```

---

## Zusammenfassung: Farb-Status abrufen

```
LoxAPP3.json
    └── controls
        └── {LightControllerV2-UUID}
            ├── details
            │   ├── masterValue → UUID für Master-Helligkeit
            │   └── masterColor → UUID für Master-Farbe
            └── subControls
                ├── {uuid}/masterValue (Dimmer)
                │   └── states.position → Value 0-100
                ├── {uuid}/masterColor (ColorPickerV2)
                │   └── states.color → Text "hsv(...)" oder "temp(...)"
                └── {uuid}/AI3 (ColorPickerV2)
                    ├── states.color → Text "hsv(0,100,100)"
                    ├── states.sequence → Text (JSON)
                    └── states.sequenceColorIdx → Value (-1 oder Index)
```

**Wichtig:**
- Farbwerte kommen als **Text-States** (Identifier 3), nicht als Value-States
- Das Format (`hsv`/`temp`/`daylight`) ergibt sich aus `details.pickerType`
- Bei `TunableWhite` wird nur `temp()` verwendet, kein HSV

---

## Tipps

- **Caching:** LoxAPP3.json nur bei Änderung neu laden (via `jdev/sps/LoxAPPversion3`)
- **Performance:** Status-Updates kommen nur bei Änderungen, nicht polling nötig
- **Reconnect:** Bei Verbindungsabbruch erneut `enablebinstatusupdate` senden
- **Max. Clients:** Nur 31 gleichzeitige Event-Empfänger möglich