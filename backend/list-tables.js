import { sequelize } from "./src/config/db.js";
import { QueryTypes } from "sequelize";

async function listTables() {
  try {
    const results = await sequelize.query(
      `
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'home_finance'
        `,
      { type: QueryTypes.SELECT },
    );

    console.log("📋 Tablas existentes en la base de datos:\n");
    results.forEach((row) => {
      console.log(`  - ${row.TABLE_NAME}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

listTables();
