# Setup script para Docker - Home Finance (Windows PowerShell)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Home Finance - Docker Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker está instalado: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker no está instalado. Descárgalo desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "¿Qué tipo de configuración deseas?" -ForegroundColor Yellow
Write-Host "1) Desarrollo COMPLETO (Frontend + Backend + MariaDB en Docker)"
Write-Host "2) Desarrollo con BD EXTERNA (Frontend + Backend, BD en Render/VPS)"
Write-Host ""
$choice = Read-Host "Selecciona (1 o 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "📦 Configurando desarrollo COMPLETO con MariaDB..." -ForegroundColor Cyan
    Write-Host ""
    
    # Copiar .env
    if (-Not (Test-Path ".env")) {
        Copy-Item ".env.docker" ".env"
        Write-Host "✓ Archivo .env creado" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ .env ya existe, se mantiene la configuración actual" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🚀 Iniciando containers..." -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml up -d
    
    Write-Host ""
    Write-Host "✓ Setup completado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Accede a:" -ForegroundColor Cyan
    Write-Host "  - Frontend: http://localhost:3001"
    Write-Host "  - Backend:  http://localhost:3000"
    Write-Host "  - BD:       localhost:3306"
    Write-Host ""
    Write-Host "Ver logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Yellow
    Write-Host "Detener: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Yellow
    
}
elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "🔗 Configurando con BD EXTERNA..." -ForegroundColor Cyan
    Write-Host ""
    
    if (-Not (Test-Path ".env")) {
        Write-Host "Se necesita crear el archivo .env con las credenciales de base de datos" -ForegroundColor Yellow
        Write-Host ""
        
        $dbHost = Read-Host "Ingresa el host de la BD (ej: db.render.com)"
        $dbUser = Read-Host "Ingresa el usuario de BD"
        $dbPass = Read-Host "Ingresa la contraseña de BD" -AsSecureString
        $dbPassPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($dbPass))
        $dbName = Read-Host "Ingresa el nombre de la BD"
        $jwtSecret = Read-Host "Ingresa el JWT_SECRET"
        
        $envContent = @"
DB_HOST=$dbHost
DB_PORT=3306
DB_USER=$dbUser
DB_PASSWORD=$dbPassPlain
DB_NAME=$dbName
JWT_SECRET=$jwtSecret
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
"@
        
        Set-Content -Path ".env" -Value $envContent
        Write-Host ""
        Write-Host "✓ Archivo .env creado" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ .env ya existe" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🚀 Iniciando Frontend + Backend..." -ForegroundColor Cyan
    docker-compose up -d
    
    Write-Host ""
    Write-Host "✓ Setup completado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Accede a:" -ForegroundColor Cyan
    Write-Host "  - Frontend: http://localhost:3001"
    Write-Host "  - Backend:  http://localhost:3000"
    Write-Host ""
    Write-Host "Ver logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "Detener: docker-compose down" -ForegroundColor Yellow
    
}
else {
    Write-Host "❌ Opción no válida" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Para más información: ver DOCKER_SETUP.md" -ForegroundColor Cyan
