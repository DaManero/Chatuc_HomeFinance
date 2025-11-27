import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function createInvestmentEarningsTable() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✓ Conectado a la base de datos");

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS investment_earnings (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        investment_id INT UNSIGNED NOT NULL,
        amount DECIMAL(12, 2) NOT NULL COMMENT 'Monto del rendimiento',
        currency VARCHAR(3) NOT NULL DEFAULT 'ARS' COMMENT 'Moneda del rendimiento',
        earning_date DATE NOT NULL COMMENT 'Fecha del rendimiento',
        notes TEXT COMMENT 'Notas adicionales',
        transaction_id INT UNSIGNED COMMENT 'ID de la transacción generada',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
        INDEX idx_investment_date (investment_id, earning_date),
        INDEX idx_earning_date (earning_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createTableSQL);
    console.log("✓ Tabla investment_earnings creada");

    console.log("✅ Migración completada exitosamente");
  } catch (error) {
    console.error("❌ Error en la migración:", error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createInvestmentEarningsTable();
