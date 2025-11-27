import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";

async function up() {
  await sequelize.query(
    `
    CREATE TABLE IF NOT EXISTS user_telegram_links (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      userId INT UNSIGNED NOT NULL,
      telegramChatId VARCHAR(100) NOT NULL UNIQUE,
      telegramUsername VARCHAR(255) NULL,
      isActive BOOLEAN NOT NULL DEFAULT TRUE,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      
      INDEX idx_userId (userId),
      INDEX idx_telegramChatId (telegramChatId),
      INDEX idx_isActive (isActive)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    { type: QueryTypes.RAW }
  );
  console.log("✓ Tabla user_telegram_links creada");
}

async function down() {
  await sequelize.query(`DROP TABLE IF EXISTS user_telegram_links`, {
    type: QueryTypes.RAW,
  });
  console.log("✓ Tabla user_telegram_links eliminada");
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
