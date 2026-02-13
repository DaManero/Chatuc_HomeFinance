FROM node:20-alpine AS builder
WORKDIR /app

# Copiar archivos de dependencias primero
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Crear directorio public si no existe
RUN mkdir -p /app/public

# IMPORTANTE: Ejecutar el build ANTES de la siguiente etapa
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar dumb-init
RUN apk add --no-cache dumb-init

# Copiar node_modules y archivos construidos desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Usuario no root para seguridad
USER node

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["dumb-init", "node_modules/.bin/next", "start"]