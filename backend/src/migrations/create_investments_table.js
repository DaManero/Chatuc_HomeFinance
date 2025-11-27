import { sequelize } from "../config/db.js";

async function createInvestmentsTable() {
  try {
    console.log("🔄 Creando tabla de inversiones...");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        type ENUM('Plazo Fijo', 'Compra Divisa', 'Venta Divisa', 'Otro') NOT NULL COMMENT 'Tipo de inversión',
        amount DECIMAL(12,2) NOT NULL COMMENT 'Monto de la inversión',
        currency VARCHAR(3) NOT NULL DEFAULT 'ARS' COMMENT 'Moneda de la inversión',
        exchangeRate DECIMAL(10,2) NULL COMMENT 'Tipo de cambio usado',
        exchangeAmount DECIMAL(12,2) NULL COMMENT 'Monto en la otra moneda',
        exchangeCurrency VARCHAR(3) NULL COMMENT 'Moneda de intercambio',
        startDate DATE NOT NULL COMMENT 'Fecha de inicio',
        endDate DATE NULL COMMENT 'Fecha de vencimiento',
        interestRate DECIMAL(5,2) NULL COMMENT 'Tasa de interés anual',
        status ENUM('Activo', 'Vencido', 'Rescatado') NOT NULL DEFAULT 'Activo' COMMENT 'Estado',
        entity VARCHAR(255) NOT NULL COMMENT 'Banco, casa de cambio, etc.',
        description TEXT NULL,
        userId INT UNSIGNED NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_status (userId, status),
        INDEX idx_user_type (userId, type),
        INDEX idx_start_date (startDate)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✓ Tabla investments creada");
    console.log("✅ Migración completada exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en la migración:", error);
    process.exit(1);
  }
}

createInvestmentsTable();
