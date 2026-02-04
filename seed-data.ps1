#!/usr/bin/env pwsh

# Script para llenar la base de datos con datos de ejemplo

$ContainerName = "home_finance_db"
$DbUser = "postgres"
$DbName = "home_finance_dev"

Write-Host "Llenando base de datos con datos de ejemplo..." -ForegroundColor Cyan

# Crear usuario de prueba
$sql = @"
-- Insertar usuario
INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at)
VALUES ('Damian', 'damian@example.com', '$2a$10$fake_hash_for_testing', 'Admin', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insertar categorías
INSERT INTO categories (name, type, user_id, created_at, updated_at)
VALUES 
  ('Comida', 'Egreso', 1, NOW(), NOW()),
  ('Transporte', 'Egreso', 1, NOW(), NOW()),
  ('Salario', 'Ingreso', 1, NOW(), NOW()),
  ('Bonificación', 'Ingreso', 1, NOW(), NOW()),
  ('Otros', 'Egreso', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insertar método de pago
INSERT INTO payment_methods (name, type, user_id, created_at, updated_at)
VALUES 
  ('Efectivo', 'CASH', 1, NOW(), NOW()),
  ('Tarjeta de Débito', 'DEBIT_CARD', 1, NOW(), NOW()),
  ('Banco', 'BANK_TRANSFER', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insertar transacciones de ejemplo
INSERT INTO transactions (amount, description, type, transaction_date, category_id, payment_method_id, user_id, created_at, updated_at)
VALUES 
  (100.00, 'Almuerzo en restaurante', 'EXPENSE', NOW(), 1, 1, 1, NOW(), NOW()),
  (50.00, 'Viaje en taxi', 'EXPENSE', NOW(), 2, 1, 1, NOW(), NOW()),
  (5000.00, 'Salario mensual', 'INCOME', NOW(), 3, 3, 1, NOW(), NOW()),
  (200.00, 'Mercado', 'EXPENSE', NOW(), 1, 2, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;
"@

# Ejecutar el SQL
docker exec -e PGPASSWORD=postgres $ContainerName psql -U $DbUser -d $DbName -c "$sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Datos de ejemplo insertados exitosamente!" -ForegroundColor Green
    
    # Mostrar resumen
    Write-Host "`nResumen de datos:" -ForegroundColor Yellow
    docker exec -e PGPASSWORD=postgres $ContainerName psql -U $DbUser -d $DbName -c "SELECT 'Usuarios' as tabla, COUNT(*) as cantidad FROM users UNION ALL SELECT 'Categorías', COUNT(*) FROM categories UNION ALL SELECT 'Métodos de pago', COUNT(*) FROM payment_methods UNION ALL SELECT 'Transacciones', COUNT(*) FROM transactions;"
}
else {
    Write-Host "Error al insertar datos de ejemplo." -ForegroundColor Red
    exit 1
}
