FROM node:18-alpine

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./
RUN npm ci --only=production

# Rebuild sqlite3 for Alpine
RUN npm rebuild sqlite3

COPY backend/ ./

# Create directory for database
RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "src/server.js"]
