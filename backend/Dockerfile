# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Copiar node_modules del builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Usar dumb-init para ejecutar el servidor
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
