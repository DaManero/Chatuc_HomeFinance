# Home Finance

Sistema de gestión de finanzas personales con Next.js, Node.js y PostgreSQL.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Levantar todos los servicios
docker-compose -f docker-compose.dev.yml up -d

# Acceder a la aplicación
Frontend: http://localhost:3001
Backend: http://localhost:3000
```

**Credenciales de prueba:**

- Email: `damian@example.com`
- Contraseña: `Test123!`

### Scripts Disponibles

```bash
# Backup de base de datos
./backup-database.ps1

# Restaurar base de datos desde backup
./restore-database.ps1 -BackupFile "backup_file.sql"

# Llenar BD con datos de prueba
./seed-data.ps1
```

## 📋 Requisitos

- Docker & Docker Compose
- Node.js 18+
- PowerShell (para scripts)

## 🏗️ Estructura del Proyecto

```
.
├── app/                    # Frontend Next.js
├── backend/               # Backend Node.js
├── components/            # Componentes React
├── services/              # Servicios/APIs
├── context/               # Contexto de React
├── utils/                 # Utilidades
├── docs/                  # Documentación
├── docker-compose.dev.yml # Dev environment
├── docker-compose.yml     # Prod environment
└── render.yaml           # Deployment en Render
```

## 🗄️ Base de Datos

- **Tipo:** PostgreSQL 15
- **Desarrollo:** puerto 55432
- **Producción:** Render PostgreSQL

## 📚 Documentación

Ver la carpeta `/docs` para documentación completa.

## 🔗 Enlaces

- [Render App](https://home-finance-production.onrender.com)
- [GitHub Repo](https://github.com/tu-usuario/home-finance)

## 📝 Licencia

MIT
