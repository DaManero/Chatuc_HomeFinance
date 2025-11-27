import { sequelize } from "../config/db.js";

async function createLoansTables() {
  try {
    console.log("🔄 Creando tablas de préstamos...");

    // Crear tabla exchange_rates
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        currencyFrom VARCHAR(3) NOT NULL DEFAULT 'USD' COMMENT 'Moneda de origen',
        currencyTo VARCHAR(3) NOT NULL DEFAULT 'ARS' COMMENT 'Moneda de destino',
        rate DECIMAL(10,2) NOT NULL COMMENT 'Tasa de cambio',
        source ENUM('manual', 'api', 'oficial', 'blue') NOT NULL DEFAULT 'api' COMMENT 'Fuente de la cotización',
        date DATE NOT NULL COMMENT 'Fecha de la cotización',
        userId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (userId, date),
        INDEX idx_currencies (currencyFrom, currencyTo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Tabla exchange_rates creada");

    // Crear tabla loans
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entity VARCHAR(255) NOT NULL COMMENT 'Banco, persona, etc.',
        totalAmount DECIMAL(12,2) NOT NULL COMMENT 'Monto total del préstamo',
        pendingAmount DECIMAL(12,2) NOT NULL COMMENT 'Monto pendiente de pago',
        currency VARCHAR(3) NOT NULL DEFAULT 'ARS' COMMENT 'Moneda del préstamo',
        interestRate DECIMAL(5,2) NULL COMMENT 'Tasa de interés',
        loanDate DATE NOT NULL COMMENT 'Fecha del préstamo',
        dueDate DATE NULL COMMENT 'Fecha de vencimiento',
        installments INT NULL COMMENT 'Cantidad de cuotas',
        installmentAmount DECIMAL(12,2) NULL COMMENT 'Monto por cuota',
        status ENUM('Activo', 'Pagado', 'Vencido') NOT NULL DEFAULT 'Activo' COMMENT 'Estado del préstamo',
        description TEXT NULL,
        userId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_status (userId, status),
        INDEX idx_loan_date (loanDate)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Tabla loans creada");

    // Crear tabla loan_payments
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS loan_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        loanId INT NOT NULL COMMENT 'ID del préstamo',
        amount DECIMAL(12,2) NOT NULL COMMENT 'Monto del pago',
        paymentDate DATE NOT NULL COMMENT 'Fecha del pago',
        transactionId INT NULL COMMENT 'ID de la transacción asociada',
        notes TEXT NULL COMMENT 'Notas del pago',
        userId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (loanId) REFERENCES loans(id) ON DELETE CASCADE,
        FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE SET NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_loan (loanId),
        INDEX idx_payment_date (paymentDate)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Tabla loan_payments creada");

    console.log("✅ Migración completada exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en la migración:", error);
    process.exit(1);
  }
}

createLoansTables();
