FROM node:20-alpine AS base
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Install client dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm install --legacy-peer-deps

COPY client/ ./client/
RUN cd client && npm run build

# Copy server code
COPY server/ ./server/
# Move built client into server public serving directory
RUN cp -r ./client/dist ./server/public

WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]
