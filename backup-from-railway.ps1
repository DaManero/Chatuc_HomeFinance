#!/usr/bin/env pwsh

# Script para hacer backup de Railway y restaurar en DB local de desarrollo
# Uso: ./backup-from-railway.ps1

# ============================================
# CONFIGURACION RAILWAY (proxy publico)
# ============================================
$Railway = @{
    Host     = "trolley.proxy.rlwy.net"
    Port     = 15150
    User     = "postgres"
    Password = "YcWTziLkKCdAcvNvgQvqRlrDwdDMCiWy"
    DbName   = "railway"
}

# ============================================
# CONFIGURACION LOCAL (Docker)
# ============================================
$Local = @{
    ContainerName = "home_finance_db"
    Host          = "localhost"
    Port          = 55432
    User          = "postgres"
    Password      = "postgres"
    DbName        = "home_finance_dev"
}

$BackupFile = "railway_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
$BackupPath = Join-Path (Get-Location) $BackupFile

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  BACKUP RAILWAY -> LOCAL DEV" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PASO 1: Verificar herramientas
# ============================================
Write-Host "[1/4] Verificando herramientas..." -ForegroundColor Yellow
Write-Host "  Usando imagen postgres:17-alpine via Docker para compatibilidad con Railway PG17." -ForegroundColor Green

# ============================================
# PASO 2: Hacer dump de Railway
# ============================================
Write-Host ""
Write-Host "[2/4] Descargando datos desde Railway ($($Railway.Host):$($Railway.Port))..." -ForegroundColor Yellow

# Usar imagen postgres:17-alpine para garantizar compatibilidad con Railway (PG17)
Write-Host "  Usando imagen postgres:17-alpine para compatibilidad con Railway PG17..." -ForegroundColor DarkGray

docker run --rm `
    -e PGPASSWORD=$($Railway.Password) `
    postgres:17-alpine `
    pg_dump `
    --host=$($Railway.Host) `
    --port=$($Railway.Port) `
    --username=$($Railway.User) `
    --dbname=$($Railway.DbName) `
    --no-privileges `
    --no-owner `
    --format=plain | Out-File -FilePath $BackupPath -Encoding UTF8

$dumpExitCode = $LASTEXITCODE

$env:PGPASSWORD = ""

if ($dumpExitCode -ne 0 -or -not (Test-Path $BackupPath) -or (Get-Item $BackupPath).Length -lt 100) {
    Write-Host ""
    Write-Host "ERROR: No se pudo hacer el dump de Railway." -ForegroundColor Red
    Write-Host "  Verifica que el proxy este activo y los datos de conexion sean correctos." -ForegroundColor Red
    if (Test-Path $BackupPath) { Remove-Item $BackupPath }
    exit 1
}

$BackupSize = (Get-Item $BackupPath).Length / 1KB
Write-Host "  Backup descargado: $BackupFile ($($BackupSize.ToString('F0')) KB)" -ForegroundColor Green

# ============================================
# PASO 3: Verificar/iniciar contenedor local
# ============================================
Write-Host ""
Write-Host "[3/4] Preparando base de datos local..." -ForegroundColor Yellow

$ContainerRunning = docker ps --filter "name=$($Local.ContainerName)" --format '{{.Names}}' | Select-String $Local.ContainerName

if (-not $ContainerRunning) {
    Write-Host "  Iniciando contenedor Docker local..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d db
    Start-Sleep -Seconds 10
}

# Confirmar antes de pisar la DB local
Write-Host ""
Write-Host "  ATENCION: Esto va a reemplazar todos los datos de '$($Local.DbName)' con los de Railway." -ForegroundColor Red
$confirm = Read-Host "  Continuar? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "  Operacion cancelada." -ForegroundColor Yellow
    Remove-Item $BackupPath
    exit 0
}

# Drop y recrear la DB local
Write-Host "  Recreando base de datos local..." -ForegroundColor Yellow

docker exec -e PGPASSWORD=$($Local.Password) $($Local.ContainerName) `
    psql -U $($Local.User) -d postgres -c "DROP DATABASE IF EXISTS $($Local.DbName);"

docker exec -e PGPASSWORD=$($Local.Password) $($Local.ContainerName) `
    psql -U $($Local.User) -d postgres -c "CREATE DATABASE $($Local.DbName);"

# ============================================
# PASO 4: Restaurar el backup en local
# ============================================
Write-Host ""
Write-Host "[4/4] Restaurando datos en local..." -ForegroundColor Yellow

# Copiar el backup al contenedor y restaurarlo
$ContainerBackupPath = "/tmp/$BackupFile"
docker cp $BackupPath "$($Local.ContainerName):$ContainerBackupPath"

docker exec -e PGPASSWORD=$($Local.Password) $($Local.ContainerName) `
    psql -U $($Local.User) -d $($Local.DbName) -f $ContainerBackupPath

$restoreExitCode = $LASTEXITCODE

# Limpiar archivo temporal del contenedor
docker exec $($Local.ContainerName) rm -f $ContainerBackupPath

if ($restoreExitCode -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  Backup guardado en: $BackupPath" -ForegroundColor Green
    Write-Host "  Datos restaurados en: $($Local.DbName) (localhost:$($Local.Port))" -ForegroundColor Green
    Write-Host ""
    Write-Host "  El archivo de backup se mantiene por si necesitas restore manual." -ForegroundColor DarkGray
}
else {
    Write-Host ""
    Write-Host "ERROR: La restauracion fallo. Revisa el output anterior para detalles." -ForegroundColor Red
    Write-Host "  El archivo de backup se mantuvo en: $BackupPath" -ForegroundColor Yellow
    exit 1
}
