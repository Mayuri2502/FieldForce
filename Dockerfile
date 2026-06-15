FROM node:18

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Create directory for database
RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "src/server.js"]
