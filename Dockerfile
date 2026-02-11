# Stage 1: Build
FROM node:20-alpine AS builder

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
FROM node:20-alpine

WORKDIR /app

# Instalar dumb-init
RUN apk add --no-cache dumb-init

# Copiar node_modules y código compilado del builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Exponer puerto (Railway usa PORT env var)
EXPOSE ${PORT:-3001}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3001; require('http').get('http://localhost:' + port, (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Usar dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
