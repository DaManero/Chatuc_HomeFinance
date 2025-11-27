import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";

async function up() {
  await sequelize.query(
    `
    CREATE TABLE IF NOT EXISTS pending_transactions (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      rawMessage TEXT NOT NULL COMMENT 'Mensaje original enviado por Telegram',
      amount DECIMAL(15, 2) NULL COMMENT 'Monto detectado automáticamente',
      currency ENUM('ARS', 'USD') NULL DEFAULT 'ARS' COMMENT 'Moneda detectada',
      type ENUM('Ingreso', 'Egreso') NULL COMMENT 'Tipo de transacción detectado',
      suggestedCategory VARCHAR(100) NULL COMMENT 'Categoría sugerida por el parser',
      description VARCHAR(255) NULL COMMENT 'Descripción extraída del mensaje',
      transactionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha/hora del mensaje',
      status ENUM('pending', 'processed', 'discarded') NOT NULL DEFAULT 'pending' COMMENT 'Estado de la transacción pendiente',
      userId INT UNSIGNED NOT NULL,
      processedTransactionId INT UNSIGNED NULL COMMENT 'ID de la transacción creada al procesar',
      telegramMessageId VARCHAR(100) NULL COMMENT 'ID del mensaje de Telegram',
      telegramChatId VARCHAR(100) NULL COMMENT 'Chat ID de Telegram del usuario',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (processedTransactionId) REFERENCES transactions(id) ON DELETE SET NULL,
      
      INDEX idx_userId (userId),
      INDEX idx_status (status),
      INDEX idx_userId_status (userId, status),
      INDEX idx_transactionDate (transactionDate)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    { type: QueryTypes.RAW }
  );
  console.log("✓ Tabla pending_transactions creada");
}

async function down() {
  await sequelize.query(`DROP TABLE IF EXISTS pending_transactions`, {
    type: QueryTypes.RAW,
  });
  console.log("✓ Tabla pending_transactions eliminada");
}

// Ejecutar migración
(async () => {
  try {
    await up();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en migración:", error);
    process.exit(1);
  }
})();
