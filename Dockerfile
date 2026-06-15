FROM node:18

WORKDIR /app

# Install build tools for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm ci --only=production

# Rebuild sqlite3 from source
RUN npm rebuild sqlite3 --build-from-source

COPY backend/ ./

# Create directory for database
RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "src/server.js"]
