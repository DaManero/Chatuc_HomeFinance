# 🔧 Docker Troubleshooting Guide

## 🚨 Problemas Comunes y Soluciones

---

### 1. ❌ "docker: command not found"

**Causa:** Docker no está instalado o el PATH no está configurado.

**Solución:**

1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Instala siguiendo los pasos del instalador
3. **Reinicia tu computadora** (importante!)
4. Abre una **nueva terminal** PowerShell/cmd
5. Verifica: `docker --version`

**Si aún no funciona en Windows:**

```powershell
# Ejecuta PowerShell como ADMINISTRADOR
# Agrega Docker al PATH manualmente
$env:Path += ";C:\Program Files\Docker\Docker\resources\bin"
docker --version
```

---

### 2. ❌ "Port 3000/3001/3306 already in use"

**Causa:** Otro proceso está usando el puerto.

**Solución Windows:**

```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000
# Output: TCP    0.0.0.0:3000    0.0.0.0:*    LISTENING    12345

# Matar el proceso (reemplaza 12345 con el PID)
taskkill /PID 12345 /F

# Alternativamente, cambiar puerto en docker-compose.yml
# Cambiar "3000:3000" a "3001:3000"
```

**Solución Mac/Linux:**

```bash
# Ver proceso
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

**Solución alternativa:** Cambiar puertos en docker-compose

```yaml
ports:
  - "3002:3000" # Localhost:3002 → Container:3000
```

---

### 3. ❌ "docker-compose: command not found"

**Causa:** Docker Compose no está instalado o PATH incorrecto.

**Solución:**

- Verificar que Docker Desktop está instalado (incluye Compose)
- Alternativamente, instalar Docker Compose por separado:

```powershell
# Windows - descargar binario
curl -L "https://github.com/docker/compose/releases/download/v2.0.0/docker-compose-windows-x86_64.exe" -o "C:\Program Files\Docker\docker-compose.exe"

# Verificar
docker-compose --version
```

---

### 4. ❌ "No space left on device"

**Causa:** El disco está lleno o volúmenes Docker ocupan demasiado espacio.

**Solución:**

```bash
# Limpiar imágenes sin usar
docker image prune -a

# Limpiar volúmenes sin usar
docker volume prune

# Limpiar todo (¡cuidado!)
docker system prune -a --volumes

# Ver uso de disco
docker system df
```

---

### 5. ❌ "Database connection refused"

**Síntomas:**

- Backend no puede conectar a la BD
- Error: `ER_ACCESS_DENIED_FOR_USER`

**Solución:**

```bash
# Verificar que MariaDB está corriendo
docker-compose -f docker-compose.dev.yml ps

# Ver logs de BD
docker-compose -f docker-compose.dev.yml logs db

# Reiniciar BD
docker-compose -f docker-compose.dev.yml restart db

# Esperar 15-20 segundos y verificar health
docker-compose -f docker-compose.dev.yml ps

# Verificar credenciales en .env
cat .env | grep DB_
```

**Checklist:**

- [ ] `DB_HOST=db` (no localhost)
- [ ] `DB_PORT=3306`
- [ ] `DB_USER=root`
- [ ] `DB_PASSWORD=root_password_docker`
- [ ] `DB_NAME=home_finance_dev`

---

### 6. ❌ "Backend can't reach Frontend" o viceversa

**Causa:** Containers no están en la misma red o DNS no resuelve.

**Solución:**

```bash
# Verificar que ambos están en la misma red
docker network ls
docker inspect home_finance_network

# Verificar DNS
docker-compose exec backend nslookup frontend
docker-compose exec frontend nslookup backend

# Reiniciar network
docker-compose down
docker-compose up -d
```

---

### 7. ❌ "Changes not reflected in container"

**Causa:** Los volúmenes no se actualizaron o code is cached.

**Solución:**

```bash
# Opción 1: Rebuild completo (más lento pero seguro)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

# Opción 2: Restart de containers
docker-compose -f docker-compose.dev.yml restart backend frontend

# Opción 3: Usar Ctrl+C para detener y volver a levantar
# (Útil durante desarrollo)
```

**Prevención:**

- Asegurar que `.:/app` está en volumes
- No editar archivos DENTRO del container
- Editar archivos en host, el container ve los cambios

---

### 8. ❌ "docker: permission denied"

**Causa:** El usuario no tiene permisos para usar Docker.

**Solución Windows:**

```powershell
# Ejecutar PowerShell como ADMINISTRADOR
# Todos los comandos de Docker después
```

**Solución Mac/Linux:**

```bash
# Agregar usuario a grupo docker
sudo usermod -aG docker $USER

# Activar cambios
newgrp docker

# Verificar
docker ps
```

---

### 9. ❌ "Health check failed" (Containers muestran "unhealthy")

**Síntomas:**

```
docker-compose ps
# backend   unhealthy
# frontend  unhealthy
```

**Solución:**

```bash
# Ver logs
docker-compose logs backend
docker-compose logs frontend

# Verificar manualmente la salud
curl http://localhost:3000/health
curl http://localhost:3001

# Si retorna error, revisar logs de aplicación
docker-compose logs -f backend
```

**Causas comunes:**

- Aplicación no ha iniciado completamente
- Base de datos no lista
- Variables de entorno incorrectas

**Esperar y reintentar:**

```bash
sleep 30
docker-compose ps  # Ver si está healthy ahora
```

---

### 10. ❌ "Cannot connect to Docker daemon"

**Causa:** Docker daemon no está corriendo.

**Solución Windows:**

1. Abre Docker Desktop (busca en Inicio)
2. Espera a que esté completamente cargado (icono en taskbar)
3. Intenta de nuevo

**Solución Mac/Linux:**

```bash
# Verificar que daemon está corriendo
docker ps

# Si no, iniciar
sudo systemctl start docker

# Verificar status
sudo systemctl status docker
```

---

### 11. ❌ "Cannot read from environment file"

**Síntomas:**

```
error: file not found: .env
```

**Solución:**

```bash
# Crear .env desde template
cp .env.docker .env

# Editar con tus valores
cat .env

# O crear manualmente
echo "DB_HOST=localhost" > .env
echo "DB_USER=root" >> .env
```

---

### 12. ❌ "Compose file invalid"

**Causa:** Errores de sintaxis en `docker-compose.yml`

**Solución:**

```bash
# Validar archivo
docker-compose config

# Si hay errores, revisarlos y corregir YAML
# Causas comunes:
# - Indentación incorrecta (usar espacios, no tabs)
# - Comillas mal cerradas
# - Caracteres especiales sin escaper

# Ejemplo correcto:
services:
  backend:
    environment:
      - DB_PASSWORD=my-password
```

---

### 13. ❌ "Volume mount issues"

**Problema:** Archivos no sincronizados entre host y container.

**Solución:**

```bash
# En Windows (Docker Desktop), habilitar file sharing:
# 1. Docker Desktop → Settings → Resources → File Sharing
# 2. Agregar C:\Users\Damian\Desktop\Home_Finance

# Verificar mounts
docker inspect <container_id> | grep -A 20 "Mounts"

# Remount volumes
docker-compose down
docker-compose up -d
```

---

## 📊 Matriz de Diagnóstico

| Síntoma                | Comando de Debug                                | Probable Causa            |
| ---------------------- | ----------------------------------------------- | ------------------------- |
| "Connection refused"   | `docker-compose logs db`                        | DB no inició              |
| "Port in use"          | `netstat -ano \| findstr :PORT`                 | Otro proceso ocupa puerto |
| "Image not found"      | `docker images`                                 | Build incompleto          |
| "Out of memory"        | `docker stats`                                  | Demasiados containers     |
| "DNS not resolving"    | `docker-compose exec backend nslookup frontend` | Red issues                |
| "Health check failing" | `curl http://localhost:3000/health`             | App no responde           |

---

## 🔍 Comandos de Debugging

```bash
# Ver todos los containers (incluyendo parados)
docker ps -a

# Ver todos los volúmenes
docker volume ls

# Ver todas las redes
docker network ls

# Inspeccionar container específico
docker inspect <container_id>

# Ver recursos usados (CPU, memoria)
docker stats

# Ver logs con timestamps
docker-compose logs --timestamps

# Ver últimas N líneas
docker-compose logs -f --tail 50

# Ejecutar comando en container corriendo
docker-compose exec backend npm --version

# Copiar archivo del container
docker cp <container_id>:/path/to/file ./local/path

# Copiar archivo al container
docker cp ./local/file <container_id>:/path/to/file
```

---

## 🆘 Escalado de Problemas

Si nada funciona:

1. **Limpiar todo:**

   ```bash
   docker-compose down -v
   docker system prune -a
   ```

2. **Reiniciar Docker:**
   - Windows: Cierra Docker Desktop y vuelve a abrir
   - Mac/Linux: `sudo systemctl restart docker`

3. **Reconstruir desde cero:**

   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **Buscar en logs:**

   ```bash
   docker-compose logs -f | grep -i error
   ```

5. **Contactar soporte:**
   - GitHub Issues
   - Stack Overflow con tag `docker`
   - Docker Community Forums

---

## 📞 Recursos de Ayuda

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [MariaDB Docker Docs](https://hub.docker.com/_/mariadb)
- [Node.js Docker Docs](https://hub.docker.com/_/node)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment/docker)

---

**Guía de Troubleshooting v1.0**  
**Última actualización: 30 Enero 2026**
