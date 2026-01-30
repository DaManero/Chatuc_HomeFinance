# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init
RUN apk add --no-cache dumb-init

# Copiar node_modules y código compilado del builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Usar dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
