# Script para liberar el puerto 3000 y reiniciar el servidor

Write-Host "🔍 Buscando procesos en el puerto 3000..." -ForegroundColor Yellow

# Obtener PIDs usando el puerto 3000
$pids = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
        Select-Object -ExpandProperty OwningProcess -Unique

if ($pids) {
    Write-Host "❌ Encontrados procesos usando el puerto 3000: $pids" -ForegroundColor Red
    foreach ($processId in $pids) {
        Write-Host "   Deteniendo proceso $processId..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Procesos detenidos" -ForegroundColor Green
} else {
    Write-Host "✓ Puerto 3000 libre" -ForegroundColor Green
}

# Detener todos los procesos node por si acaso
Write-Host "🔍 Deteniendo todos los procesos Node.js..." -ForegroundColor Yellow
Get-Process -Name node,nodemon -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✓ Procesos Node.js detenidos" -ForegroundColor Green

# Esperar
Write-Host "⏳ Esperando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Iniciar servidor
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
Set-Location C:\Users\Damian\Desktop\Home_Finance\backend
npm run dev
