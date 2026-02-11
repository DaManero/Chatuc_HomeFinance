FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Usar dumb-init para ejecutar el servidor
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
