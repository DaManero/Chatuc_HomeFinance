# Docker Setup - Home Finance

## Opciones de despliegue

### Opción 1: Desarrollo local COMPLETO (con MariaDB)

Usa este si quieres tener TODO en Docker, incluyendo la base de datos.

```bash
# Copiar variables de entorno
cp .env.docker .env

# Construir y lanzar con MariaDB incluido
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener
docker-compose -f docker-compose.dev.yml down
```

✅ Accede a:

- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Base de datos: localhost:3306

---

### Opción 2: Desarrollo con BD externa (Render/VPS)

Usa este cuando tu BD esté en un servidor externo.

```bash
# Crear archivo .env con credenciales externas
cat > .env << EOF
DB_HOST=your-render-db-host.com
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_db
JWT_SECRET=your-secret
TELEGRAM_BOT_TOKEN=optional_token
EOF

# Lanzar solo Frontend + Backend
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

---

## Comandos útiles

```bash
# Ver estado de containers
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f backend
docker-compose logs -f frontend

# Ejecutar comando en container
docker-compose exec backend npm run seed

# Reconstruir sin cache
docker-compose build --no-cache

# Limpiar todo (containers + redes)
docker-compose down -v

# Rebuild y restart
docker-compose up --build -d
```

---

## Para Producción (Render.com)

1. **Pushear a GitHub** con los Dockerfiles
2. **En Render.com**:
   - New → Web Service
   - Connect repositorio
   - Region: selecciona la más cercana
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment:
     ```
     DB_HOST=tu-render-db.onrender.com
     DB_PORT=3306
     DB_USER=tu_usuario
     DB_PASSWORD=tu_password
     DB_NAME=tu_db
     JWT_SECRET=produccion_secret
     ```

3. **Deploy**: Render detectorá Dockerfile automáticamente

---

## Solución de problemas

**Puerto 3000 ya en uso:**

```bash
# Liberar puerto
netstat -ano | findstr :3000  # Ver qué usa el puerto
taskkill /PID <pid> /F        # Matar proceso
```

**BD no se conecta:**

```bash
# Verificar que MariaDB está corriendo
docker-compose ps

# Revisar logs de DB
docker-compose logs db

# Reiniciar servicio
docker-compose restart db
```

**Cambios no se ven:**

```bash
# Limpiar volúmenes y reconstruir
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```
