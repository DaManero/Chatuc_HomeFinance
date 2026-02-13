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

# Ejecutar el build
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar dumb-init
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copiar standalone output y archivos estáticos
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Usuario no root para seguridad
USER node

# Exponer puerto
EXPOSE 3000

# Comando de inicio (standalone usa server.js)
CMD ["dumb-init", "node", "server.js"]