# INSTRUCCIONES DE DESPLIEGUE EN RAILWAY

## 📋 Requisitos Previos

- Cuenta en [Railway.app](https://railway.app)
- Repositorio en GitHub con tu código
- Git configurado localmente

---

## 🚀 Paso 1: Configurar Repositorio en GitHub

1. **Inicializar git (si no lo has hecho):**

```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Crear repositorio en GitHub y subir código:**

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

## 🎯 Paso 2: Configurar Railway

### A) Crear Cuenta y Proyecto

1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con GitHub
3. Click en "New Project"

### B) Agregar Base de Datos MySQL

1. Click en "+ New"
2. Selecciona "Database" → "MySQL"
3. Espera a que se cree
4. Railway te dará automáticamente las credenciales

### C) Desplegar Backend

1. Click en "+ New"
2. Selecciona "GitHub Repo"
3. Busca y selecciona tu repositorio
4. Railway detectará automáticamente el proyecto

#### Configurar Variables de Entorno del Backend:

En el servicio del Backend, ve a "Variables" y agrega:

```env
# Railway proporciona estas automáticamente desde MySQL:
DATABASE_URL=mysql://user:password@host:port/database

# O configura manualmente:
DB_HOST=<mysql-railway-host>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<mysql-railway-password>
DB_NAME=railway

# Configuración JWT (IMPORTANTE: cambia el secret)
JWT_SECRET=tu-secreto-super-seguro-cambialo-en-produccion
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Puerto (Railway lo asigna automáticamente)
PORT=3000

# Telegram Bot (opcional)
TELEGRAM_BOT_TOKEN=tu_token_de_telegram

# API URL (la URL que te da Railway para el backend)
API_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

**Railway Reference Variables:**

- Railway proporciona `${{RAILWAY_PUBLIC_DOMAIN}}` automáticamente
- Puedes referenciar variables entre servicios: `${{Backend.RAILWAY_PUBLIC_DOMAIN}}`

#### Configurar Root Directory:

1. Ve a "Settings" del servicio Backend
2. En "Root Directory" coloca: `backend`
3. En "Start Command" coloca: `node src/server.js`

### D) Desplegar Frontend

1. Click en "+ New" nuevamente
2. Selecciona el mismo repositorio GitHub
3. Railway detectará Next.js automáticamente

#### Configurar Variables de Entorno del Frontend:

En el servicio del Frontend, ve a "Variables" y agrega:

```env
# URL del backend (reemplaza con tu URL de Railway del backend)
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
```

**Tip:** Usa la variable reference de Railway:

```env
NEXT_PUBLIC_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
```

#### Configurar Root Directory:

1. Ve a "Settings" del servicio Frontend
2. Verifica que "Root Directory" esté en `/` (raíz)
3. El "Build Command" debe ser: `npm run build`
4. El "Start Command" debe ser: `npm start`

---

## 🔄 Paso 3: Auto-Deploy desde GitHub

**¡Ya está configurado!** Railway automáticamente:

- ✅ Detecta cambios en tu repositorio
- ✅ Despliega cuando haces `git push`
- ✅ Muestra logs en tiempo real

### Para actualizar:

```bash
git add .
git commit -m "tu mensaje"
git push
```

Railway desplegará automáticamente en ~2-3 minutos.

---

## 🔧 Paso 4: Migrar Base de Datos

Una vez desplegado el backend, ejecuta las migraciones:

1. En Railway, ve al servicio Backend
2. Click en la pestaña "Deployments"
3. Click en los tres puntos (...) del deployment activo
4. Selecciona "View Logs"

Si necesitas ejecutar comandos:

- Railway no tiene shell directo, pero puedes:
  - Agregar scripts en `package.json` del backend
  - O conectarte a la BD desde tu máquina local

**Conectarse localmente a Railway MySQL:**

```bash
mysql -h <railway-mysql-host> -P <puerto> -u root -p<password> railway
```

---

## 📝 Paso 5: Verificar Despliegue

1. **Backend:** `https://tu-backend.up.railway.app/health`
2. **Frontend:** `https://tu-frontend.up.railway.app`

---

## 🐛 Troubleshooting

### Error: Puerto en uso

Railway asigna el puerto automáticamente. Asegúrate de usar:

```javascript
const PORT = process.env.PORT || 3000;
```

### Error: No se conecta la base de datos

Verifica que las variables de entorno estén correctamente configuradas en Railway.

### Frontend no se conecta al Backend

Asegúrate de que `NEXT_PUBLIC_API_URL` apunte a la URL pública de Railway del backend.

### Ver Logs

- Ve al servicio en Railway
- Click en "Deployments"
- Click en el deployment activo
- Click en "View Logs"

---

## 💰 Monitoreo de Costos

1. Ve a tu proyecto en Railway
2. Click en "Usage" para ver consumo
3. Con los $5 gratis puedes correr ~15 días 24/7
4. Agrega tarjeta para $10/mes gratis

---

## 🔒 Seguridad

✅ **Completado:**

- `.env` está en `.gitignore`
- Variables sensibles en Railway
- JWT secret único en producción

❌ **Recomendaciones adicionales:**

- Cambia `JWT_SECRET` a algo único y seguro
- Habilita CORS solo para tu dominio frontend
- Considera agregar rate limiting

---

## 📚 Referencias

- [Railway Docs](https://docs.railway.app)
- [Deploy Next.js](https://docs.railway.app/guides/nextjs)
- [Deploy Node.js](https://docs.railway.app/guides/nodejs)
- [MySQL en Railway](https://docs.railway.app/databases/mysql)
