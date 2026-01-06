# ============================================
# Stage 1: Build TypeScript
# ============================================
FROM node:18-alpine AS builder

# Install timezone data
RUN apk add --no-cache tzdata

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src ./src
COPY server.ts ./

# Build TypeScript to dist/
RUN npm run build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:18-alpine

# Install timezone data
RUN apk add --no-cache tzdata

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy public files (HTML/CSS/JS frontend)
COPY public ./public

# Create data directory
RUN mkdir -p /app/data

# Expose HTTP port
EXPOSE 8555

# Start the application
CMD ["node", "dist/server.js"]
