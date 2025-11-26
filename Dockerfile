# Wir nutzen Node 18 auf Alpine Linux (sehr klein und sicher)
FROM node:18-alpine

# Zeitzone installieren (damit Logs die richtige Uhrzeit haben)
RUN apk add --no-cache tzdata

# Arbeitsverzeichnis im Container erstellen
WORKDIR /app

# Zuerst nur package.json kopieren (für besseres Caching)
COPY package.json ./

# Abhängigkeiten installieren
RUN npm install --production

# Jetzt den Rest des Codes kopieren
COPY . .

# Port freigeben (nur zur Info, Mapping passiert in docker-compose)
EXPOSE 8555

# Startbefehl
CMD ["node", "server.js"]