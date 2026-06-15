FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create directory for database
RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "src/server.js"]
