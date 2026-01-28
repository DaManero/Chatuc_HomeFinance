import { sequelize } from "./src/config/db.js";
import { QueryTypes } from "sequelize";

async function addColumn() {
  try {
    console.log("🔧 Agregando columna parent_category_id...");

    await sequelize.query(
      `
      ALTER TABLE categories 
      ADD COLUMN parent_category_id INT UNSIGNED NULL AFTER is_recurring
    `,
      { type: QueryTypes.RAW },
    );

    console.log("✓ Columna agregada");

    await sequelize.query(
      `
      ALTER TABLE categories
      ADD CONSTRAINT fk_categories_parent 
        FOREIGN KEY (parent_category_id) 
        REFERENCES categories(id) 
        ON DELETE CASCADE
    `,
      { type: QueryTypes.RAW },
    );

    console.log("✓ Foreign key agregada");
    console.log("✅ Migración completada exitosamente");
    process.exit(0);
  } catch (error) {
    if (error.original && error.original.errno === 1060) {
      console.log("⚠️  La columna parent_category_id ya existe");
      process.exit(0);
    }
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addColumn();
