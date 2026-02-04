#!/usr/bin/env pwsh

# Script para hacer backup de la base de datos
# Uso: ./backup-database.ps1 [nombre_archivo_backup.sql]

param(
    [string]$BackupFileName = "backup_home_finance_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
)

Write-Host "Iniciando backup de la base de datos..." -ForegroundColor Cyan

# Informacion de conexion
$ContainerName = "home_finance_db"
$DbUser = "postgres"
$DbName = "home_finance_dev"
$BackupPath = Join-Path (Get-Location) $BackupFileName

# Verificar si el contenedor esta corriendo
$ContainerRunning = docker ps --filter "name=$ContainerName" --format '{{.Names}}' | Select-String $ContainerName

if (-not $ContainerRunning) {
    Write-Host "El contenedor '$ContainerName' no esta corriendo." -ForegroundColor Red
    Write-Host "Iniciando contenedor..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d db
    Start-Sleep -Seconds 5
}

# Ejecutar pg_dump dentro del contenedor
Write-Host "Creando dump de la base de datos..." -ForegroundColor Yellow

docker exec -e PGPASSWORD=postgres $ContainerName pg_dump -U $DbUser -d $DbName --no-privileges --no-owner > $BackupPath

# Verificar si el backup fue exitoso
if ($LASTEXITCODE -eq 0 -and (Test-Path $BackupPath) -and (Get-Item $BackupPath).Length -gt 0) {
    $BackupSize = (Get-Item $BackupPath).Length / 1MB
    Write-Host "Backup completado exitosamente!" -ForegroundColor Green
    Write-Host "Ubicacion: $BackupPath" -ForegroundColor Green
    Write-Host "Tamanio: $($BackupSize.ToString('F2')) MB" -ForegroundColor Green
}
else {
    Write-Host "Error al crear el backup." -ForegroundColor Red
    exit 1
}
