#!/usr/bin/env pwsh

# Script para restaurar la base de datos desde un backup
# Uso: ./restore-database.ps1 -BackupFile "nombre_del_backup.sql"

param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile
)

# Validar que el archivo existe
if (-not (Test-Path $BackupFile)) {
    Write-Host "Error: El archivo de backup '$BackupFile' no existe." -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando restauracion de la base de datos..." -ForegroundColor Cyan
Write-Host "Archivo: $BackupFile" -ForegroundColor Yellow

# Informacion de conexion
$ContainerName = "home_finance_db"
$DbUser = "postgres"
$DbName = "home_finance_dev"

# Verificar si el contenedor esta corriendo
$ContainerRunning = docker ps --filter "name=$ContainerName" --format '{{.Names}}' | Select-String $ContainerName

if (-not $ContainerRunning) {
    Write-Host "El contenedor '$ContainerName' no esta corriendo." -ForegroundColor Red
    Write-Host "Iniciando contenedor..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d db
    Start-Sleep -Seconds 5
}

# Confirmar la restauracion
Write-Host ""
Write-Host "ADVERTENCIA: Esta operacion reemplazara todos los datos en la base de datos '$DbName'." -ForegroundColor Yellow
$confirm = Read-Host "Deseas continuar? (S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Operacion cancelada." -ForegroundColor Yellow
    exit 0
}

# Ejecutar psql para restaurar la base de datos
Write-Host "Restaurando base de datos..." -ForegroundColor Yellow

# Primero, eliminar todas las conexiones a la base de datos
docker exec -e PGPASSWORD=postgres $ContainerName psql -U $DbUser -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DbName' AND pid <> pg_backend_pid();" 2>$null

# Eliminar la base de datos existente si existe
Write-Host "Eliminando base de datos existente..." -ForegroundColor Yellow
docker exec -e PGPASSWORD=postgres $ContainerName psql -U $DbUser -d postgres -c "DROP DATABASE IF EXISTS $DbName;" 2>$null

# Crear la base de datos de nuevo
Write-Host "Creando base de datos nueva..." -ForegroundColor Yellow
docker exec -e PGPASSWORD=postgres $ContainerName psql -U $DbUser -d postgres -c "CREATE DATABASE $DbName;" 2>$null

# Restaurar desde el archivo de backup
Write-Host "Restaurando datos..." -ForegroundColor Yellow
Get-Content $BackupFile | docker exec -i -e PGPASSWORD=postgres $ContainerName psql -U $DbUser -d $DbName 2>$null

# Verificar si la restauracion fue exitosa
if ($LASTEXITCODE -eq 0) {
    Write-Host "Restauracion completada exitosamente!" -ForegroundColor Green
    Write-Host "La base de datos ha sido restaurada desde: $BackupFile" -ForegroundColor Green
}
else {
    Write-Host "Error al restaurar la base de datos." -ForegroundColor Red
    exit 1
}
