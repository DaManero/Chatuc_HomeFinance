# 🏗️ Home Finance - Docker Architecture

## Local Development Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Desktop (Local)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │               Docker Network: home_finance_network         │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Frontend   │  │   Backend    │  │  MariaDB     │    │  │
│  │  │ (Next.js)    │  │ (Node.js)    │  │ (Database)   │    │  │
│  │  │              │  │              │  │              │    │  │
│  │  │ :3001        │  │ :3000        │  │ :3306        │    │  │
│  │  │              │  │              │  │              │    │  │
│  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │    │  │
│  │  │ │ Port 3001│ │  │ │ Port 3000│ │  │ │ Port 3306│ │    │  │
│  │  │ │ Health   │ │  │ │ Health   │ │  │ │ Volume:  │ │    │  │
│  │  │ │ Check :  │ │  │ │ Check :  │ │  │ │ db_data  │ │    │  │
│  │  │ │ Auto ✓   │ │  │ │ Auto ✓   │ │  │ │ Persist  │ │    │  │
│  │  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │    │  │
│  │  │              │  │              │  │              │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │         ▲                  ▲                ▲             │  │
│  │         └──────────────────┼────────────────┘             │  │
│  │                            │                             │  │
│  │           Internal Network (DNS Resolution)              │  │
│  │                                                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ▲                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              localhost:3001      localhost:3000
              (Browser)           (API)
```

---

## Production Architecture (Render.com)

```
┌─────────────────────────────────────────────────────────────────┐
│                        RENDER.COM                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                     GitHub Repository                           │
│                   (Push triggers deploy)                        │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Render Services (Separate Deployments)                │  │
│  │                                                          │  │
│  │  ┌───────────────────┐  ┌───────────────────┐          │  │
│  │  │   Frontend        │  │   Backend         │          │  │
│  │  │   (Web Service)   │  │   (Web Service)   │          │  │
│  │  │                   │  │                   │          │  │
│  │  │   Next.js Build   │  │   Node.js Start   │          │  │
│  │  │   npm start       │  │   node src/...    │          │  │
│  │  │                   │  │                   │          │  │
│  │  │   Auto SSL ✓      │  │   Auto SSL ✓      │          │  │
│  │  │   Auto Scaling ✓  │  │   Auto Scaling ✓  │          │  │
│  │  └────────┬──────────┘  └────────┬──────────┘          │  │
│  │           │                      │                     │  │
│  │           │                      ▼                     │  │
│  │           │          ┌───────────────────────┐         │  │
│  │           │          │   PostgreSQL/MySQL    │         │  │
│  │           │          │   Managed by Render   │         │  │
│  │           │          │                       │         │  │
│  │           │          │   Auto-backup ✓       │         │  │
│  │           │          │   Auto-scaling ✓      │         │  │
│  │           │          │   Persistent ✓        │         │  │
│  │           │          └───────────────────────┘         │  │
│  │           │                                             │  │
│  │           └─────────── Internal CDN ────────────────┐   │  │
│  │                                                      │   │  │
│  └──────────────────────────────────────────────────────┘   │  │
│                            ▲                                 │  │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            your-app.onrender.com   API (Internal)
            (Public Internet)
```

---

## Data Flow

### During Development

```
User Browser
    │
    ├─→ http://localhost:3001 (Frontend Container)
    │        │
    │        ├─→ Displays UI
    │        └─→ Makes API calls to http://localhost:3000
    │
    └─→ http://localhost:3000 (Backend Container)
             │
             ├─→ Processes requests
             └─→ Queries MariaDB (localhost:3306)
                      │
                      ├─→ Stores/retrieves data
                      └─→ Persists in db_data volume
```

### In Production

```
User Browser
    │
    ├─→ https://your-app.onrender.com (Frontend Service)
    │        │
    │        ├─→ Displays UI
    │        └─→ Makes API calls to Backend Service
    │
    └─→ Backend Service (Internal)
             │
             ├─→ Processes requests
             └─→ Queries Render Database
                      │
                      ├─→ Stores/retrieves data
                      └─→ Auto-backups ✓
```

---

## File Structure in Docker Image

### Frontend Image

```
/app
├── .next/                 # Compiled Next.js
├── node_modules/          # Dependencies
├── public/                # Static files
├── package.json
├── next.config.mjs
├── jsconfig.json
├── app/                   # Source code
├── components/
├── services/
├── context/
├── theme/
└── utils/
```

### Backend Image

```
/app
├── node_modules/          # Dependencies
├── src/
│   ├── server.js          # Entry point
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── package.json
└── .env                   # Mounted from host
```

---

## Environment Variables Flow

### Local Development

```
.env.docker (Template)
    ↓
docker-compose.dev.yml (References .env)
    ↓
Backend Container (Uses DB_HOST=db)
    ↓
Database Container (Responds to host "db")
```

### Production

```
GitHub Secrets / Environment Variables
    ↓
Render Dashboard (Configuration)
    ↓
Backend Container (Uses RDS_HOSTNAME)
    ↓
Managed Database (External Service)
```

---

## Volume Mounting Strategy

### Development Mounts

```
Frontend:
  - .:/app                 # Live code changes
  - /app/node_modules      # Named volume (performance)
  - /app/.next             # Named volume (build cache)

Backend:
  - ./backend:/app         # Live code changes
  - /app/node_modules      # Named volume (performance)

Database:
  - db_data:/var/lib/mysql # Persistent storage
```

### Production

```
Frontend:
  - Read-only filesystem
  - No volume mounts (stateless)

Backend:
  - Read-only filesystem (except logs)
  - No volume mounts (stateless)

Database:
  - Managed by Render
  - Auto-backups and snapshots
```

---

## Health Check Strategy

### Frontend (Every 30s)

```
GET http://localhost:3001
Expected: 200 OK
Timeout: 10s
Retries: 3
```

### Backend (Every 30s)

```
GET http://localhost:3000/health
Expected: 200 OK
Timeout: 10s
Retries: 3
```

### Database (Every 10s)

```
MYSQL: mariadb-admin ping -h localhost
Expected: Success
Timeout: 5s
Retries: 5
```

---

## Build Process

### Frontend Build (docker-compose build frontend)

```
1. Base: node:18-alpine
2. Copy package*.json
3. npm ci (clean install)
4. Copy source code
5. npm run build
   └─ Next.js compiles to /app/.next
6. Stage 2: Create runtime image
7. Copy .next, node_modules, public
8. EXPOSE 3001
9. CMD: npm start
```

### Backend Build (docker-compose build backend)

```
1. Base: node:18-alpine
2. Copy package*.json
3. npm ci (only production)
4. Stage 2: Create runtime image
5. Copy node_modules, source
6. EXPOSE 3000
7. CMD: node src/server.js
```

---

## Networking

### Container Names (DNS)

- `frontend` - Accessible within network
- `backend` - Accessible within network
- `db` - Accessible within network

### Port Mapping

```
Host       Container   Service
----       ---------   -------
3001       3001        Frontend
3000       3000        Backend
3306       3306        MariaDB
```

### Network Mode

```
Bridge Network: home_finance_network
└─ Containers communicate by name
└─ Isolated from host unless ports mapped
└─ Auto DNS resolution between services
```

---

**Architecture v1.0 - 30 Enero 2026**
