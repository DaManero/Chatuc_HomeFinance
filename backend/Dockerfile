# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# No build step needed for backend
RUN echo 'Backend - no build step'

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Instalar dumb-init
RUN apk add --no-cache dumb-init

# Copiar node_modules y código del builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

# Exponer puerto
EXPOSE 3000

# Usar dumb-init para ejecutar el servidor
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
