# Loxone Miniserver WebSocket-Kommunikation (Gen 2)

> Basierend auf offizieller Dokumentation v16.0 (2025.06.03)

---

## Übersicht

Der Miniserver Gen 2 unterstützt **WSS (WebSocket Secure)** und **HTTPS** mit TLS-Verschlüsselung. Seit Version 11.2 ist die Application-Layer-Encryption nicht mehr zwingend erforderlich, wenn TLS verwendet wird.

---

## Voraussetzungen

- WebSocket-Client (RFC6455-konform)
- IP/URL des Miniservers (inkl. Port)
- Gültige Credentials (User & Passwort)
- Bei CloudDNS: Vorherige Auflösung erforderlich

---

## Verbindungsaufbau - Schritt für Schritt

### 1. Erreichbarkeit prüfen

```
GET https://{ipOrUrl}:{port}/jdev/cfg/apiKey
```

**Antwort enthält:**
- `httpsStatus`: `1` = TLS verfügbar, `2` = Zertifikat abgelaufen
- `local`: Gibt an, ob Verbindung als lokal gilt (seit v12.1)
- `hasEventSlots`: Verfügbarkeit von Event-Slots (max. 31 gleichzeitige Clients)

### 2. Zertifikat abrufen

```
GET jdev/sys/getcertificate
```

- Zertifikatskette verifizieren (Loxone Root Certificate)
- Public Key aus letztem Zertifikat extrahieren → `{publicKey}`
- Format: X.509 encoded key in PEM

### 3. WebSocket-Verbindung öffnen

```
wss://{ipOrUrl}:{port}/ws/rfc6455
```

**Header:**
```
Sec-WebSocket-Protocol: remotecontrol
```

### 4. Session-Key generieren

```javascript
// AES256-CBC Key generieren (32 Byte) → {key} (Hex)
// Random IV generieren (16 Byte) → {iv} (Hex)

// Payload für RSA-Verschlüsselung
const payload = `${key}:${iv}`;

// Mit publicKey RSA-verschlüsseln → {encrypted-session-key} (Base64)
```

### 5. Key Exchange

```
jdev/sys/keyexchange/{encrypted-session-key}
```

### 6. Salt generieren

```javascript
// Random Salt (z.B. 2 Byte Hex-String) → {salt}
```

### 7. Token abrufen oder authentifizieren

- **Neuer Token:** → siehe [Token abrufen](#token-abrufen)
- **Vorhandener Token:** → siehe [Mit Token authentifizieren](#mit-token-authentifizieren)

---

## Token-basierte Authentifizierung

### Token abrufen

#### Schritt 1: Key und Salt holen

```
jdev/sys/getkey2/{user}
```

**Antwort:**
- `key`: Für HMAC-Hashing
- `salt`: User-spezifischer Salt → `{userSalt}`
- `hashAlg`: Zu verwendender Hash-Algorithmus (SHA1 oder SHA256)

#### Schritt 2: Passwort hashen

```javascript
// {pwHash} = uppercase(hash("{password}:{userSalt}", hashAlg))
const pwHash = hash(`${password}:${userSalt}`, hashAlg).toUpperCase();
```

#### Schritt 3: Credentials-Hash erstellen

```javascript
// {hash} = HMAC-SHA256("{user}:{pwHash}", key)
// NICHT in upper/lowercase konvertieren!
const hash = hmacSha256(`${user}:${pwHash}`, key);
```

#### Schritt 4: JWT Token anfordern (verschlüsselt!)

```
jdev/sys/getjwt/{hash}/{user}/{permission}/{uuid}/{info}
```

**Parameter:**
| Parameter | Beschreibung |
|-----------|-------------|
| `{permission}` | `2` = Web (kurzlebig), `4` = App (langlebig) |
| `{uuid}` | Client-UUID, Format: `098802e1-02b4-603c-ffffeee000d80cfd` |
| `{info}` | URL-encoded Beschreibung, z.B. `Mein%20Script` |

> ⚠️ **Wichtig:** Dieser Request MUSS verschlüsselt sein!

**Antwort:**
```json
{
  "token": "...",           // JWT Token - speichern!
  "validUntil": 1234567890, // Sekunden seit 1.1.2009
  "tokenRights": 4,         // Bitmap der Berechtigungen
  "unsecurePass": false,    // Warnung bei schwachem Passwort
  "key": "..."              // Für weitere Requests
}
```

### Mit Token authentifizieren

```javascript
// Token mit getkey-Ergebnis hashen
const tokenHash = hmacSha256(token, key);

// Authentifizierung (WebSocket)
const authCmd = `authwithtoken/${tokenHash}/${user}`;

// Authentifizierung (HTTP)
// ?autht={tokenHash}&user={user} an URL anhängen
```

> Ab Version 11.2 kann der Token auch im Klartext gesendet werden.

### Token erneuern

```
jdev/sys/refreshjwt/{tokenHash}/{user}
```

### Token prüfen

```
jdev/sys/checktoken/{tokenHash}/{user}
```

### Token löschen

```
jdev/sys/killtoken/{tokenHash}/{user}
```

---

## Berechtigungen (Permissions)

| Bit | Name | Beschreibung |
|-----|------|-------------|
| `0x00000002` | Web | Kurzlebiger Token für Web-Interface |
| `0x00000004` | App | Langlebiger Token für Apps |
| `0x00000001` | Admin | Administrative Rechte |
| `0x00000008` | Config | Login in Loxone Config |
| `0x00000100` | Sys-WS | System-Webservices (z.B. Reboot) |

---

## Befehle verschlüsseln

### Für WebSocket

```javascript
// 1. Befehl mit Session-Key verschlüsseln
const plaintext = `salt/${salt}/${cmd}`;
const cipher = aesEncrypt(plaintext, key, iv); // Base64

// 2. URI-Component-Encode
const encCipher = encodeURIComponent(cipher);

// 3. Senden
const command = `jdev/sys/enc/${encCipher}`;
// oder mit verschlüsselter Antwort:
const command = `jdev/sys/fenc/${encCipher}`;
```

### Salt aktualisieren (Replay-Schutz)

```javascript
// Nach jedem Befehl Salt erneuern
const nextSalt = generateRandomSalt();
const cipher = aesEncrypt(`nextSalt/${prevSalt}/${nextSalt}/${cmd}`, key, iv);
```

---

## Status-Updates empfangen

### Binäre Status-Updates aktivieren

```
jdev/sps/enablebinstatusupdate
```

Nach diesem Befehl sendet der Miniserver Event-Tables mit:
- Value-States (numerische Werte)
- Text-States (Texte)
- Daytimer-States (Zeitpläne)
- Weather-States (Wetterdaten)

---

## Message Header Struktur

Jede Nachricht wird von einem 8-Byte Header eingeleitet:

```
Byte 1: 0x03 (fix)
Byte 2: Identifier
Byte 3: Info-Flags
Byte 4: Reserved
Byte 5-8: Payload-Länge (32-bit unsigned, little endian)
```

### Identifier

| ID | Typ |
|----|-----|
| 0 | Text-Message |
| 1 | Binary File |
| 2 | Value-States |
| 3 | Text-States |
| 4 | Daytimer-States |
| 5 | Out-Of-Service |
| 6 | Keepalive Response |
| 7 | Weather-States |

---

## Verbindung aufrechterhalten

```
keepalive
```

- Antwort: Message-Header mit Identifier `0x06`
- **Timeout:** Verbindung wird nach 5 Minuten ohne Aktivität geschlossen

---

## Struktur-Datei (LoxAPP3.json)

### Abrufen

```
data/LoxAPP3.json
```

### Versionsprüfung (für Caching)

```
jdev/sps/LoxAPPversion3
```

Vergleich mit `lastModified`-Feld der gecachten Datei.

---

## Steuerungsbefehle

### Allgemeine Syntax

```
jdev/sps/io/{uuid}/{command}
```

### Beispiele

```bash
# Schalten
jdev/sps/io/{uuid}/on
jdev/sps/io/{uuid}/off

# Dimmen
jdev/sps/io/{uuid}/50        # 50%

# Mit Bezeichnung statt UUID
jdev/sps/io/WohnzimmerLicht/on
```

---

## Secured Commands (Visu-Passwort)

Für geschützte Funktionen mit Visualisierungs-Passwort:

### 1. Salt und Key holen

```
jdev/sys/getvisusalt/{user}
```

### 2. Visu-Passwort hashen

```javascript
const visuPwHash = hash(`${visuPw}:${salt}`, hashAlg).toUpperCase();
const hash = hmacSha256(visuPwHash, key);
```

### 3. Befehl senden

```
jdev/sps/ios/{hash}/{uuid}/{command}
```

### Passwort prüfen (ohne Funktion auszulösen)

```
jdev/sps/checkuservisupwd/{hash}
```

---

## CloudDNS

### IP-Adresse auflösen

```
GET https://dns.loxonecloud.com/?getip&snr={SerialNumber}&json=true
```

**Response-Codes:**
| Code | Bedeutung |
|------|-----------|
| 200 | OK |
| 403 | Nicht registriert |
| 405 | Meldet nicht bei CloudDNS |
| 409 | Unsicheres Passwort |
| 412 | Port nicht geöffnet |

**Für TLS-Verbindung:**
- `IPHTTPS`: IP und Port für HTTPS/WSS
- `PortOpenHTTPS`: Port-Status für HTTPS

### Hostname für TLS konstruieren

```javascript
// IPv4: 192.168.1.10 → 192-168-1-10
const cleanedIp = ip.replace(/\./g, '-');

// Hostname
const hostname = `${cleanedIp}.${serialNumber}.dyndns.loxonecloud.com:${port}`;
```

---

## Error-Codes

| Code | Bedeutung |
|------|-----------|
| 400 | Bad Request / Nicht authentifiziert |
| 401 | Ungültige Credentials / Entschlüsselung fehlgeschlagen |
| 403 | Keine Berechtigung |
| 404 | Unbekannter Befehl |
| 420 | Timeout bei Authentifizierung |
| 423 | Benutzer deaktiviert |
| 503 | Miniserver startet neu |
| 901 | Max. Verbindungen erreicht (256 für Gen 2) |

---

## WebSocket Close Codes

| Code | Bedeutung |
|------|-----------|
| 4003 | Blockiert (zu viele Fehlversuche) |
| 4004 | Benutzer geändert |
| 4005 | Aktueller Benutzer geändert |
| 4006 | Benutzer deaktiviert |
| 4007 | Update läuft |
| 4008 | Keine Event-Slots verfügbar |

---

## Verschlüsselungsparameter

### RSA
- Mode: ECB
- Padding: PKCS1
- Encoding: Base64 (NoWrap)

### AES
- Mode: CBC
- Padding: ZeroBytePadding
- Encoding: Base64 (NoWrap)
- IV: 16 Byte
- Block: 16 Byte
- Key: 32 Byte

---

## Beispiel: Vollständiger Verbindungsaufbau (Python-Pseudocode)

```python
import websocket
import hashlib
import hmac
from Crypto.Cipher import AES
from Crypto.PublicKey import RSA

# 1. Erreichbarkeit prüfen
api_info = requests.get(f"https://{host}/jdev/cfg/apiKey").json()

# 2. Zertifikat holen und Public Key extrahieren
cert = requests.get(f"https://{host}/jdev/sys/getcertificate").text
public_key = extract_public_key(cert)

# 3. WebSocket öffnen
ws = websocket.create_connection(
    f"wss://{host}/ws/rfc6455",
    subprotocols=["remotecontrol"]
)

# 4. Session-Key generieren
aes_key = os.urandom(32).hex()
aes_iv = os.urandom(16).hex()
session_payload = f"{aes_key}:{aes_iv}"

# 5. RSA-verschlüsseln und Key Exchange
encrypted_session = rsa_encrypt(session_payload, public_key)
ws.send(f"jdev/sys/keyexchange/{encrypted_session}")

# 6. Token holen
ws.send(f"jdev/sys/getkey2/{username}")
key_response = ws.recv()

pw_hash = hashlib.sha256(f"{password}:{user_salt}".encode()).hexdigest().upper()
credentials_hash = hmac.new(key, f"{username}:{pw_hash}".encode(), hashlib.sha256).hexdigest()

# Verschlüsselter Token-Request
token_cmd = f"jdev/sys/getjwt/{credentials_hash}/{username}/4/{client_uuid}/{client_info}"
encrypted_cmd = aes_encrypt(f"salt/{salt}/{token_cmd}", aes_key, aes_iv)
ws.send(f"jdev/sys/enc/{encrypted_cmd}")

# 7. Status-Updates aktivieren
ws.send("jdev/sps/enablebinstatusupdate")

# 8. Keepalive-Loop
while True:
    ws.send("keepalive")
    time.sleep(60)
```



## Beispiele

## Farbe ColorPickerV2
Farbe eines ColorPickerV2 contronls ändern `jdev/sps/io/1f4b4509-02b0-c8aa-ffffed57184a04d2/AI2/hsv(351,100,22)`
Response: 
```json
{
    "LL": {
        "control": "dev/sps/io/1f4b4509-02b0-c8aa-ffffed57184a04d2/AI2/hsv(351,100,22)",
        "value": "1",
        "Code": "200"
    }
}
```

## Stimmung / Mood setzen

Request: `jdev/sps/io/1f4b4509-02b0-c8aa-ffffed57184a04d2/changeTo/2`

Response: 
```json
{
    "LL": {
        "control": "dev/sps/io/1f4b4509-02b0-c8aa-ffffed57184a04d2/changeTo/2",
        "value": "1",
        "Code": "200"
    }
}
```

## Masterhelligkeit setzen

Request: `jdev/sps/io/1fae583e-031a-2d82-ffffed57184a04d2/masterValue/100.000000`

Resonse:
```json
{
    "LL": {
        "control": "dev/sps/io/1fae583e-031a-2d82-ffffed57184a04d2/masterValue/100.000000",
        "value": "0",
        "Code": "200"
    }
}
```

## Masterfarbe / Mastercolor setzen für tageslicht

request: `jdev/sps/io/1f4b4509-02b0-c8aa-ffffed57184a04d2/masterColor/temp(100,4379)`

response

```json
{
    "LL": {
        "control": "dev/sps/io/1f4b4509-02b0-c8aa-ffffed57184a04d2/masterColor/temp(100,4379)",
        "value": "1",
        "Code": "200"
    }
}
```

## Masterfarbe / Mastercolor setzen für rgb

request: `jdev/sps/io/1f4b4509-02b0-c8aa-ffffed57184a04d2/masterColor/hsv(53,100,100)`

response:
```json
{
    "LL": {
        "control": "dev/sps/io/1f4b4509-02b0-c8aa-ffffed57184a04d2/masterColor/hsv(53,100,100)",
        "value": "1",
        "Code": "200"
    }
}
```

## Switch setzen

Request: `jdev/sps/io/1fae583e-031a-2d82-ffffed57184a04d2/AI1/on`

response:
```json
{
    "LL": {
        "control": "dev/sps/io/1fae583e-031a-2d82-ffffed57184a04d2/AI1/on",
        "value": "1",
        "Code": "200"
    }
}
```

## Dimmer setzen
Request: `jdev/sps/io/1fae583e-031a-2d82-ffffed57184a04d2/AI2/64.000000`

Response:
```json
{
    "LL": {
        "control": "dev/sps/io/1fae583e-031a-2d82-ffffed57184a04d2/AI2/64.000000",
        "value": "1",
        "Code": "200"
    }
}
```

---

## Wichtige Hinweise

1. **TLS verwenden:** Miniserver Gen 2 unterstützt WSS/HTTPS - immer bevorzugen
2. **Token statt Passwort:** Tokens können widerrufen werden ohne Passwortänderung
3. **Salt aktualisieren:** Nach jedem Befehl für Replay-Schutz
4. **Keepalive senden:** Mind. alle 5 Minuten
5. **Event-Slots begrenzt:** Max. 31 gleichzeitige Clients für Status-Updates
6. **HTTP-Verbindungen:** Max. 256 gleichzeitig (Gen 2)