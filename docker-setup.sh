#!/bin/bash
# Setup script para Docker - Home Finance

echo "================================"
echo "Home Finance - Docker Setup"
echo "================================"
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Descárgalo desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado."
    exit 1
fi

echo "✓ Docker está instalado"
echo ""

# Preguntar tipo de instalación
echo "¿Qué tipo de configuración deseas?"
echo "1) Desarrollo COMPLETO (Frontend + Backend + MariaDB en Docker)"
echo "2) Desarrollo con BD EXTERNA (Frontend + Backend, BD en Render/VPS)"
echo ""
read -p "Selecciona (1 o 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "📦 Configurando desarrollo COMPLETO con MariaDB..."
    echo ""
    
    # Copiar .env
    if [ ! -f .env ]; then
        cp .env.docker .env
        echo "✓ Archivo .env creado"
    else
        echo "⚠ .env ya existe, se mantiene la configuración actual"
    fi
    
    echo ""
    echo "🚀 Iniciando containers..."
    docker-compose -f docker-compose.dev.yml up -d
    
    echo ""
    echo "✓ Setup completado!"
    echo ""
    echo "Accede a:"
    echo "  - Frontend: http://localhost:3001"
    echo "  - Backend:  http://localhost:3000"
    echo "  - BD:       localhost:3306"
    echo ""
    echo "Ver logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "Detener: docker-compose -f docker-compose.dev.yml down"
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "🔗 Configurando con BD EXTERNA..."
    echo ""
    
    if [ ! -f .env ]; then
        echo "Se necesita crear el archivo .env con las credenciales de base de datos"
        echo ""
        read -p "Ingresa el host de la BD (ej: db.render.com): " db_host
        read -p "Ingresa el usuario de BD: " db_user
        read -sp "Ingresa la contraseña de BD: " db_pass
        echo ""
        read -p "Ingresa el nombre de la BD: " db_name
        read -p "Ingresa el JWT_SECRET: " jwt_secret
        
        cat > .env << EOF
DB_HOST=$db_host
DB_PORT=3306
DB_USER=$db_user
DB_PASSWORD=$db_pass
DB_NAME=$db_name
JWT_SECRET=$jwt_secret
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
        echo ""
        echo "✓ Archivo .env creado"
    else
        echo "⚠ .env ya existe"
    fi
    
    echo ""
    echo "🚀 Iniciando Frontend + Backend..."
    docker-compose up -d
    
    echo ""
    echo "✓ Setup completado!"
    echo ""
    echo "Accede a:"
    echo "  - Frontend: http://localhost:3001"
    echo "  - Backend:  http://localhost:3000"
    echo ""
    echo "Ver logs: docker-compose logs -f"
    echo "Detener: docker-compose down"
    
else
    echo "❌ Opción no válida"
    exit 1
fi

echo ""
echo "Para más información: ver DOCKER_SETUP.md"
