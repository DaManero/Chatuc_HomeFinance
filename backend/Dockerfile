# Backend - Single stage (no build step needed)
FROM node:20-alpine AS backend

RUN apk add --no-cache dumb-init

WORKDIR /backend

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
