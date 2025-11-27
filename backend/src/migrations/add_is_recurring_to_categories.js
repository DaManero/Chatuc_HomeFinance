import { sequelize } from "../config/db.js";

async function addIsRecurringColumn() {
  try {
    await sequelize.query(`
      ALTER TABLE categories 
      ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT FALSE 
      COMMENT 'Indica si es una categoría de gasto/ingreso fijo mensual'
    `);
    console.log(
      "✓ Columna is_recurring agregada exitosamente a la tabla categories"
    );
    process.exit(0);
  } catch (error) {
    if (error.original?.errno === 1060) {
      console.log("⚠ La columna is_recurring ya existe en la tabla categories");
      process.exit(0);
    } else {
      console.error("✗ Error al agregar columna is_recurring:", error.message);
      process.exit(1);
    }
  }
}

addIsRecurringColumn();
