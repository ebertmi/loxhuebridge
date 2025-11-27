FROM node:18-alpine
RUN apk add --no-cache tzdata
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY . .
EXPOSE 8555
CMD ["node", "server.js"]