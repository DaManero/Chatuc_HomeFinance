import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function addUserIdToInvestmentEarnings() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✓ Conectado a la base de datos");

    // Verificar si la columna ya existe
    const [columns] = await connection.query(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'investment_earnings' 
      AND COLUMN_NAME = 'user_id'
    `,
      [process.env.DB_NAME]
    );

    if (columns.length > 0) {
      console.log("✓ La columna user_id ya existe");
      return;
    }

    // Agregar columna user_id (nullable primero)
    await connection.query(`
      ALTER TABLE investment_earnings
      ADD COLUMN user_id INT UNSIGNED NULL AFTER investment_id
    `);

    console.log("✓ Columna user_id agregada (nullable)");

    // Si hay registros, actualizar con el userId del investment relacionado
    await connection.query(`
      UPDATE investment_earnings ie
      INNER JOIN investments i ON ie.investment_id = i.id
      SET ie.user_id = i.user_id
      WHERE ie.user_id IS NULL
    `);

    console.log("✓ Valores user_id actualizados");

    // Ahora hacer la columna NOT NULL y agregar constraints
    await connection.query(`
      ALTER TABLE investment_earnings
      MODIFY COLUMN user_id INT UNSIGNED NOT NULL,
      ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      ADD INDEX idx_user_id (user_id)
    `);

    console.log("✓ Constraints agregadas a user_id");
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

addUserIdToInvestmentEarnings();
