# 🚀 Pasos siguientes para Docker

## 1️⃣ Prerequisitos (si no los tienes)

### Windows

Descarga e instala: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)

Después de instalar:

- Reinicia tu computadora
- Abre PowerShell como Administrador
- Verifica: `docker --version`

### Mac

Descarga e instala: [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)

### Linux

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

---

## 2️⃣ Verificar instalación

```bash
docker --version
docker-compose --version
```

Ambos deben mostrar versiones.

---

## 3️⃣ Levantar los containers

### Opción A: Desarrollo COMPLETO (con BD en Docker)

```bash
# Desde la raíz del proyecto
cd C:\Users\Damian\Desktop\Home_Finance

# Copiar variables de entorno
Copy-Item ".env.docker" ".env"

# Construir e iniciar
docker-compose -f docker-compose.dev.yml up -d

# Ver estado
docker-compose -f docker-compose.dev.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f
```

**Acceso:**

- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- MariaDB: localhost:3306

### Opción B: Solo Frontend + Backend (BD externa)

```bash
# Editar .env con tus credenciales
# Luego:
docker-compose up -d
```

---

## 4️⃣ Troubleshooting

### Error: "docker: command not found"

- Docker no está instalado o no está en el PATH
- Solución: Reinicia la terminal o la computadora después de instalar

### Puerto ya en uso

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar proceso (cambiar PID por el número)
taskkill /PID <number> /F
```

### BD no se conecta

```bash
# Ver logs de la BD
docker-compose -f docker-compose.dev.yml logs db

# Reiniciar BD
docker-compose -f docker-compose.dev.yml restart db

# Esperar 10-15 segundos y verificar estado
docker-compose -f docker-compose.dev.yml ps
```

### Cambios no se ven en containers

```bash
# Limpiar y reconstruir
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

---

## 5️⃣ Comandos útiles

```bash
# Ver containers corriendo
docker-compose ps

# Ver logs con filtro
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Ejecutar comando en container
docker-compose exec backend npm run seed
docker-compose exec db mariadb -u root -p

# Detener
docker-compose down

# Detener y borrar volúmenes (CUIDADO: pierde datos)
docker-compose down -v

# Reconstruir sin cache
docker-compose build --no-cache

# Restart de un servicio
docker-compose restart backend
```

---

## 6️⃣ Cuando todo esté funcionando

### Test de conectividad

```bash
# En PowerShell
# Backend health check
Invoke-WebRequest -Uri http://localhost:3000/health

# Frontend
Start-Process "http://localhost:3001"
```

### Próximos pasos productivos

1. Hacer test de funcionalidad (login, crear transacciones, etc.)
2. Preparar para GitHub:
   ```bash
   git add .
   git commit -m "add: docker setup for production deployment"
   git push origin main
   ```
3. Configurar en Render.com:
   - New Web Service
   - Conectar repositorio
   - Render detectará Dockerfile automáticamente
   - Agregar variables de entorno para BD
   - Deploy

---

## 📚 Más recursos

- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Guía detallada
- [DOCKER_CHECKLIST.md](DOCKER_CHECKLIST.md) - Checklist completo
- [Docker Docs](https://docs.docker.com/)
